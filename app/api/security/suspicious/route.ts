import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        s.id,
        s.user_id,
        u.username,
        s.pattern,
        s.severity,
        s.timestamp,
        s.status
      FROM suspicious_activities s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.timestamp DESC
      LIMIT 50
    `)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching suspicious activities:', error)
    return NextResponse.json(
      { error: "Failed to fetch suspicious activities" },
      { status: 500 }
    )
  }
} 