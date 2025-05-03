import { NextResponse } from "next/server"
import { query, saveLoginHistory } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { username, password, behavioralProfile } = await request.json()

    // Get user from database
    const users = await query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    ) as any[]

    const user = users[0]

    if (!user || user.password !== password) { // In production, use proper password hashing
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }

    // Save behavioral profile if provided
    if (behavioralProfile) {
      console.log("Saving behavioral profile for user:", user.id)
      await saveLoginHistory(user.id, behavioralProfile)
    }

    // Log successful login
    await query(
      "INSERT INTO audit_logs (user_id, timestamp, action, table_name, record_id, details) VALUES (?, NOW(), ?, ?, ?, ?)",
      [user.id, "LOGIN", "users", user.id, "User logged in successfully"]
    )

    return NextResponse.json({
      userId: user.id,
      username: user.username,
    })
  } catch (error) {
    console.error("Login API Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
