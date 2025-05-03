import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT id, user_id, timestamp, is_anomaly, confidence_score, details
      FROM anomalies
      ORDER BY timestamp DESC
      LIMIT 100
    `)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching anomalies:', error)
    return NextResponse.json({ error: 'Failed to fetch anomalies' }, { status: 500 })
  }
} 