import jwt from "jsonwebtoken"
import { query, getBehavioralProfile, logAnomaly } from "./db"
import { type BehavioralProfile, detectAnomalies } from "./behavior-tracker"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Verify JWT token
export async function verifyAuth(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "Unauthorized: Missing or invalid token" }
    }

    // Extract the token
    const token = authHeader.split(" ")[1]

    if (!token) {
      return { success: false, error: "Unauthorized: Missing token" }
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Check if user exists in database
    const users = (await query("SELECT id, username, email FROM users WHERE id = ?", [decoded.id])) as any[]

    if (users.length === 0) {
      return { success: false, error: "Unauthorized: User not found" }
    }

    return {
      success: true,
      user: {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
      },
    }
  } catch (error) {
    console.error("Auth verification error:", error)
    return { success: false, error: "Unauthorized: Invalid token" }
  }
}

// Create JWT token
export function createToken(user: { id: number; username: string }) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" })
}

// Log audit event
export async function logAudit(userId: number, action: string, tableName: string, recordId: string, details: string) {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ")
    await query(
      "INSERT INTO audit_logs (user_id, timestamp, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, timestamp, action, tableName, recordId, details],
    )
  } catch (error) {
    console.error("Error logging audit:", error)
  }
}

// Verify user behavior against stored profile
export async function verifyBehavior(userId: number, currentProfile: BehavioralProfile) {
  try {
    // Get stored profile
    const storedProfile = await getBehavioralProfile(userId)

    if (!storedProfile) {
      // No stored profile, can't verify
      return { success: true, isFirstLogin: true }
    }

    // Cast to EnhancedBehavioralProfile for anomaly detection
    const enhancedCurrent = currentProfile as any; // Should match EnhancedBehavioralProfile
    const enhancedStored = storedProfile as any;

    // Detect anomaly
    const anomalyResult = detectAnomalies(enhancedCurrent, [enhancedStored])

    // Log the result
    await logAnomaly(
      userId,
      anomalyResult.isAnomaly,
      anomalyResult.confidence,
      anomalyResult.isAnomaly ? "Suspicious behavior detected" : "Normal behavior",
    )

    return {
      success: !anomalyResult.isAnomaly,
      isFirstLogin: false,
      confidenceScore: anomalyResult.confidence,
    }
  } catch (error) {
    console.error("Error verifying behavior:", error)
    // Default to success if there's an error
    return { success: true, isFirstLogin: false, error: "Error verifying behavior" }
  }
}
