import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Get available beds
    const wardsResult = await query(`
      SELECT COUNT(b.id) as available_beds
      FROM beds b
      WHERE b.status = 'available'
    `) as any[]

    // Get doctors on duty
    const doctorsResult = await query(`
      SELECT COUNT(*) as doctors_on_duty
      FROM doctors
      WHERE status = 'active'
    `) as any[]

    // Get today's appointments
    const appointmentsResult = await query(`
      SELECT COUNT(*) as today_appointments
      FROM appointments
      WHERE DATE(appointment_date) = CURDATE()
      AND status = 'scheduled'
    `) as any[]

    // Get pending reports
    const reportsResult = await query(`
      SELECT COUNT(*) as pending_reports
      FROM lab_reports
      WHERE status = 'pending'
    `) as any[]

    // Get recent activity from audit_logs
    const recentLogs = await query(`
      SELECT al.action, al.details, al.timestamp, u.username, al.table_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.timestamp DESC
      LIMIT 10
    `) as any[]

    // Format recent activity
    const now = Date.now()
    const recentActivity = recentLogs.map(log => {
      const logTime = new Date(log.timestamp).getTime()
      const minutesAgo = Math.floor((now - logTime) / 60000)
      return {
        type: log.action.toLowerCase(),
        message: `${log.username || 'User'}: ${log.action} on ${log.table_name} - ${log.details}`,
        minutes_ago: minutesAgo
      }
    })

    return NextResponse.json({
      availableBeds: wardsResult?.[0]?.available_beds ?? 0,
      doctorsOnDuty: doctorsResult?.[0]?.doctors_on_duty ?? 0,
      todayAppointments: appointmentsResult?.[0]?.today_appointments ?? 0,
      pendingReports: reportsResult?.[0]?.pending_reports ?? 0,
      recentActivity
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: "Failed to fetch stats. Please check the database connection and try again." },
      { status: 500 }
    )
  }
} 