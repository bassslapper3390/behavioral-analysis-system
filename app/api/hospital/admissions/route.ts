import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET /api/hospital/admissions
export async function GET() {
  try {
    const rows = await query(`
      SELECT 
        a.id,
        a.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        a.ward_id,
        w.name as ward_name,
        a.bed_id,
        b.bed_number,
        a.admission_date,
        a.expected_discharge_date,
        a.status,
        a.diagnosis,
        a.notes
      FROM admissions a
      JOIN patients p ON a.patient_id = p.id
      JOIN wards w ON a.ward_id = w.id
      JOIN beds b ON a.bed_id = b.id
      ORDER BY a.admission_date DESC
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching admissions:', error)
    return NextResponse.json(
      { error: "Failed to fetch admissions" },
      { status: 500 }
    )
  }
}

// POST /api/hospital/admissions
export async function POST(request: Request) {
  try {
    const {
      patient_id,
      ward_id,
      bed_id,
      expected_discharge_date,
      diagnosis,
      notes
    } = await request.json()

    // Start a transaction
    await query('START TRANSACTION')

    // Insert the admission
    const result = await query(
      `INSERT INTO admissions (
        patient_id,
        ward_id,
        bed_id,
        admission_date,
        expected_discharge_date,
        status,
        diagnosis,
        notes,
        created_at
      ) VALUES (?, ?, ?, NOW(), ?, 'active', ?, ?, NOW())`,
      [
        patient_id,
        ward_id,
        bed_id,
        expected_discharge_date,
        diagnosis,
        notes
      ]
    ) as any

    // Update bed status
    await query(
      `UPDATE beds SET status = 'occupied' WHERE id = ?`,
      [bed_id]
    )

    // Update ward occupancy
    await query(
      `UPDATE wards SET current_occupancy = current_occupancy + 1 WHERE id = ?`,
      [ward_id]
    )

    // Log the action
    await query(
      `INSERT INTO audit_logs (user_id, timestamp, action, table_name, record_id, details) 
       VALUES (?, NOW(), ?, ?, ?, ?)`,
      [1, 'CREATE', 'admissions', result.insertId, 'New admission created']
    )

    // Commit the transaction
    await query('COMMIT')

    return NextResponse.json({ 
      success: true, 
      message: "Admission created successfully",
      id: result.insertId
    })
  } catch (error) {
    // Rollback the transaction in case of error
    await query('ROLLBACK')
    console.error('Error creating admission:', error)
    return NextResponse.json(
      { error: "Failed to create admission" },
      { status: 500 }
    )
  }
} 