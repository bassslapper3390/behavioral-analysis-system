import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { ResultSetHeader } from "mysql2"

// GET /api/hospital/doctors
export async function GET() {
  try {
    const doctors = await query("SELECT * FROM doctors ORDER BY first_name, last_name")
    return NextResponse.json(doctors)
  } catch (error) {
    console.error("Error fetching doctors:", error)
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    )
  }
}

// POST /api/hospital/doctors
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      first_name,
      last_name,
      specialization,
      qualification,
      experience,
      contact_number,
      email,
      available_days,
      consultation_fee,
      status
    } = body

    if (!first_name || !last_name || !specialization || !contact_number) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO doctors (
        first_name,
        last_name,
        specialization,
        qualification,
        experience,
        contact_number,
        email,
        available_days,
        consultation_fee,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        specialization,
        qualification || null,
        experience || null,
        contact_number,
        email || null,
        available_days || null,
        consultation_fee || null,
        status || 'active'
      ]
    ) as [ResultSetHeader, any]

    // Log the action
    await query(
      `INSERT INTO audit_logs (
        action,
        table_name,
        record_id,
        changes,
        performed_by
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        "INSERT",
        "doctors",
        result[0].insertId,
        JSON.stringify(body),
        "system"
      ]
    )

    return NextResponse.json(
      { message: "Doctor added successfully", id: result[0].insertId },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error adding doctor:", error)
    return NextResponse.json(
      { error: "Failed to add doctor" },
      { status: 500 }
    )
  }
} 