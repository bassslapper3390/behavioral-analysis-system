import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET /api/hospital/audit-logs
export async function GET() {
  try {
    const rows = await query(`
      SELECT 
        al.id,
        u.username,
        al.timestamp,
        al.action,
        al.table_name,
        al.record_id,
        al.details
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      ORDER BY al.timestamp DESC
      LIMIT 1000
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    )
  }
} 