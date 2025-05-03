import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET /api/hospital/appointments
export async function GET() {
  try {
    const rows = await query(`
      SELECT 
        a.id,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.reason
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    )
  }
}

// POST /api/hospital/appointments
export async function POST(request: Request) {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, reason } = await request.json()

    const result = await query(
      `INSERT INTO appointments (
        patient_id, 
        doctor_id, 
        appointment_date, 
        appointment_time, 
        reason,
        status
      ) VALUES (?, ?, ?, ?, ?, 'Scheduled')`,
      [patient_id, doctor_id, appointment_date, appointment_time, reason]
    ) as any

    // Log the action
    await query(
      `INSERT INTO audit_logs (user_id, timestamp, action, table_name, record_id, details) 
       VALUES (?, NOW(), ?, ?, ?, ?)`,
      [1, 'CREATE', 'appointments', result.insertId, 'New appointment scheduled']
    )

    return NextResponse.json({ 
      success: true, 
      message: "Appointment scheduled successfully",
      id: result.insertId
    })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: "Failed to schedule appointment" },
      { status: 500 }
    )
  }
}

// PATCH /api/hospital/appointments
export async function PATCH(request: Request) {
  try {
    const { id, appointment_date, appointment_time, reason, status } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing appointment id" }, { status: 400 });
    }
    await query(
      `UPDATE appointments SET appointment_date = ?, appointment_time = ?, reason = ?, status = ? WHERE id = ?`,
      [appointment_date, appointment_time, reason, status, id]
    );
    return NextResponse.json({ success: true, message: "Appointment updated successfully" });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
} 