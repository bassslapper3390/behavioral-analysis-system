import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET /api/hospital/medical-records
export async function GET() {
  try {
    const rows = await query(`
      SELECT 
        mr.id,
        mr.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        mr.doctor_id,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
        mr.visit_date,
        mr.diagnosis,
        mr.treatment,
        mr.prescription,
        mr.notes,
        mr.follow_up_date
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      JOIN doctors d ON mr.doctor_id = d.id
      ORDER BY mr.visit_date DESC
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching medical records:', error)
    return NextResponse.json(
      { error: "Failed to fetch medical records" },
      { status: 500 }
    )
  }
}

// POST /api/hospital/medical-records
export async function POST(request: Request) {
  try {
    const {
      patient_id,
      doctor_id,
      visit_date,
      diagnosis,
      treatment,
      prescription,
      notes,
      follow_up_date
    } = await request.json()

    const result = await query(
      `INSERT INTO medical_records (
        patient_id,
        doctor_id,
        visit_date,
        diagnosis,
        treatment,
        prescription,
        notes,
        follow_up_date,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        patient_id,
        doctor_id,
        visit_date,
        diagnosis,
        treatment,
        prescription,
        notes,
        follow_up_date
      ]
    ) as any

    // Log the action
    await query(
      `INSERT INTO audit_logs (user_id, timestamp, action, table_name, record_id, details) 
       VALUES (?, NOW(), ?, ?, ?, ?)`,
      [1, 'CREATE', 'medical_records', result.insertId, 'New medical record created']
    )

    return NextResponse.json({ 
      success: true, 
      message: "Medical record added successfully",
      id: result.insertId
    })
  } catch (error) {
    console.error('Error adding medical record:', error)
    return NextResponse.json(
      { error: "Failed to add medical record" },
      { status: 500 }
    )
  }
} 