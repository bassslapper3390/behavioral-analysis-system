import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET /api/hospital/patients
export async function GET() {
  try {
    const rows = await query(`
      SELECT 
        id,
        first_name,
        last_name,
        date_of_birth,
        gender,
        blood_group,
        contact_number,
        email,
        address,
        medical_history
      FROM patients
      ORDER BY first_name, last_name
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    )
  }
}

// POST /api/hospital/patients
export async function POST(request: Request) {
  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      blood_group,
      contact_number,
      email,
      address,
      medical_history
    } = await request.json()

    const result = await query(
      `INSERT INTO patients (
        first_name,
        last_name,
        date_of_birth,
        gender,
        blood_group,
        contact_number,
        email,
        address,
        medical_history,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        first_name,
        last_name,
        date_of_birth,
        gender,
        blood_group,
        contact_number,
        email,
        address,
        medical_history
      ]
    ) as any

    // Log the action
    await query(
      `INSERT INTO audit_logs (user_id, timestamp, action, table_name, record_id, details) 
       VALUES (?, NOW(), ?, ?, ?, ?)`,
      [1, 'CREATE', 'patients', result.insertId, 'New patient registered']
    )

    return NextResponse.json({ 
      success: true, 
      message: "Patient added successfully",
      id: result.insertId
    })
  } catch (error) {
    console.error('Error adding patient:', error)
    return NextResponse.json(
      { error: "Failed to add patient" },
      { status: 500 }
    )
  }
} 