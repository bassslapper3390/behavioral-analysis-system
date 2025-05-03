import { NextResponse } from "next/server"
import { verifyAuth, logAudit } from "@/lib/auth"
import { getBehavioralProfile, saveBehavioralProfile, logAnomaly } from "@/lib/db"
import { detectAnomaly } from "@/lib/behavior-tracker"

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ message: authResult.error }, { status: 401 })
    }

    // Get user ID from auth result
    const userId = (authResult.user as any).id
    console.log("Verifying behavior for user:", userId)

    // Get behavioral profile from request
    const { behavioralProfile } = await request.json()

    if (!behavioralProfile) {
      return NextResponse.json({ message: "Behavioral profile is required" }, { status: 400 })
    }

    // Get stored profile
    const storedProfile = await getBehavioralProfile(userId)

    if (!storedProfile) {
      // First login, save profile
      console.log("No stored profile found for user:", userId, "Creating initial profile")
      await saveBehavioralProfile(userId, behavioralProfile)

      await logAudit(userId, "CREATE", "behavioral_profiles", userId.toString(), "Initial behavioral profile created")

      return NextResponse.json({
        message: "Behavioral profile created",
        isFirstLogin: true,
        isAnomaly: false,
      })
    }

    console.log("Stored profile found for user:", userId, "Detecting anomalies")

    // Detect anomaly
    const anomalyResult = detectAnomaly(behavioralProfile, storedProfile)
    console.log("Anomaly detection result:", anomalyResult)

    // Log the result
    await logAnomaly(
      userId,
      anomalyResult.isAnomaly,
      anomalyResult.confidenceScore,
      anomalyResult.isAnomaly ? "Suspicious behavior detected during login" : "Normal behavior during login",
    )

    // Log audit
    await logAudit(
      userId,
      "VERIFY",
      "behavioral_profiles",
      userId.toString(),
      `Behavior verification: ${anomalyResult.isAnomaly ? "Anomaly detected" : "Normal behavior"}`,
    )

    // Update profile with new data (gradual learning)
    // Only update if not anomalous to prevent poisoning
    if (!anomalyResult.isAnomaly) {
      await saveBehavioralProfile(userId, behavioralProfile)
    }

    return NextResponse.json({
      message: anomalyResult.isAnomaly ? "Suspicious behavior detected" : "Behavior verified",
      isAnomaly: anomalyResult.isAnomaly,
      confidenceScore: anomalyResult.confidenceScore,
    })
  } catch (error) {
    console.error("Behavior verification error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
