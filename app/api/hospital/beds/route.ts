import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET /api/hospital/beds
export async function GET() {
  try {
    const rows = await query(`
      SELECT 
        b.*,
        w.name as ward_name,
        p.id as patient_id,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        a.admission_date,
        a.expected_discharge_date
      FROM beds b
      JOIN wards w ON b.ward_id = w.id
      LEFT JOIN admissions a ON b.id = a.bed_id AND a.status = 'active'
      LEFT JOIN patients p ON a.patient_id = p.id
      ORDER BY w.name, b.bed_number
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching beds:', error)
    return NextResponse.json(
      { error: "Failed to fetch beds" },
      { status: 500 }
    )
  }
}

// POST /api/hospital/beds
export async function POST(request: Request) {
  try {
    const {
      ward_id,
      bed_number,
      status
    } = await request.json()

    const result = await query(
      `INSERT INTO beds (
        ward_id,
        bed_number,
        status,
        created_at
      ) VALUES (?, ?, ?, NOW())`,
      [
        ward_id,
        bed_number,
        status
      ]
    ) as any

    // Log the action
    await query(
      `INSERT INTO audit_logs (user_id, timestamp, action, table_name, record_id, details) 
       VALUES (?, NOW(), ?, ?, ?, ?)`,
      [1, 'CREATE', 'beds', result.insertId, 'New bed created']
    )

    return NextResponse.json({ 
      success: true, 
      message: "Bed created successfully",
      id: result.insertId
    })
  } catch (error) {
    console.error('Error creating bed:', error)
    return NextResponse.json(
      { error: "Failed to create bed" },
      { status: 500 }
    )
  }
} 