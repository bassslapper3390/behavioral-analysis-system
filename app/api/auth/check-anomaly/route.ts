import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ isAnomaly: false })
    }

    const userId = (authResult.user as any).id
    const { currentBehavior } = await request.json()

    // Get user's last 3 logins
    const [user] = (await query(
      `SELECT anomaly_warnings, force_logout, 
       (SELECT JSON_ARRAYAGG(behavior_data) 
        FROM (SELECT behavior_data 
              FROM user_logins 
              WHERE user_id = ? 
              ORDER BY login_time DESC 
              LIMIT 3) as recent_logins) as recent_behaviors
       FROM users WHERE id = ?`,
      [userId, userId]
    )) as any[]

    if (user?.force_logout) {
      return NextResponse.json({ isAnomaly: true, forceLogout: true })
    }

    const recentBehaviors = JSON.parse(user?.recent_behaviors || '[]')
    if (recentBehaviors.length < 3) {
      return NextResponse.json({ isAnomaly: false })
    }

    // Calculate average behavior
    const avgBehavior = recentBehaviors.reduce((acc: any, curr: any) => {
      Object.keys(curr).forEach(key => {
        acc[key] = (acc[key] || 0) + curr[key]
      })
      return acc
    }, {})

    Object.keys(avgBehavior).forEach(key => {
      avgBehavior[key] = avgBehavior[key] / recentBehaviors.length
    })

    // Check for anomalies
    let isAnomaly = false
    Object.keys(currentBehavior).forEach(key => {
      const threshold = 0.3 // 30% deviation threshold
      const deviation = Math.abs(currentBehavior[key] - avgBehavior[key]) / avgBehavior[key]
      if (deviation > threshold) {
        isAnomaly = true
      }
    })

    if (isAnomaly) {
      // Increment warning count
      const newWarnings = (user?.anomaly_warnings || 0) + 1
      await query(
        "UPDATE users SET anomaly_warnings = ?, force_logout = ? WHERE id = ?",
        [newWarnings, newWarnings >= 3, userId]
      )

      return NextResponse.json({ 
        isAnomaly: true, 
        forceLogout: newWarnings >= 3,
        warnings: newWarnings
      })
    }

    return NextResponse.json({ isAnomaly: false })
  } catch (error) {
    console.error("Error checking anomaly:", error)
    return NextResponse.json({ isAnomaly: false })
  }
} 