import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ forceLogout: false, warnings: 0 })
    }

    const userId = (authResult.user as any).id
    const [user] = (await query(
      "SELECT anomaly_warnings, force_logout FROM users WHERE id = ?",
      [userId]
    )) as any[]

    return NextResponse.json({
      forceLogout: !!user?.force_logout,
      warnings: user?.anomaly_warnings || 0
    })
  } catch (error) {
    console.error("Error checking warnings:", error)
    return NextResponse.json({ forceLogout: false, warnings: 0 })
  }
} 