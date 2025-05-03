import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        al.id,
        al.user_id,
        u.username,
        al.start_time,
        al.end_time,
        al.duration,
        al.file_path,
        al.status,
        COALESCE(
          JSON_ARRAYAGG(
            DISTINCT sp.pattern
          ),
          JSON_ARRAY()
        ) as suspicious_patterns
      FROM audio_logs al
      JOIN users u ON al.user_id = u.id
      LEFT JOIN suspicious_patterns sp ON al.id = sp.audio_log_id
      GROUP BY al.id, al.user_id, u.username, al.start_time, al.end_time, al.duration, al.file_path, al.status
      ORDER BY al.start_time DESC
      LIMIT 50
    `)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching audio logs:', error)
    return NextResponse.json(
      { error: "Failed to fetch audio logs" },
      { status: 500 }
    )
  }
} 