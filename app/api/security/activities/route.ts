import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        a.id,
        a.user_id,
        u.username,
        a.action,
        a.timestamp,
        a.ip_address,
        a.status
      FROM user_activities a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.timestamp DESC
      LIMIT 100
    `)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching user activities:', error)
    return NextResponse.json(
      { error: "Failed to fetch user activities" },
      { status: 500 }
    )
  }
} 