import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { ResultSetHeader, RowDataPacket } from "mysql2"

interface EmergencyCase extends RowDataPacket {
  id: number
  patient_name: string
  age: number
  contact_number: string
  emergency_type: string
  severity: string
  status: string
  notes: string
  created_at: string
  updated_at: string
}

// GET /api/hospital/emergency
export async function GET() {
  try {
    const emergencyCases = await query(
      "SELECT * FROM emergency_cases ORDER BY created_at DESC"
    ) as EmergencyCase[]

    return NextResponse.json(emergencyCases)
  } catch (error) {
    console.error("Error fetching emergency cases:", error)
    return NextResponse.json(
      { error: "Failed to fetch emergency cases" },
      { status: 500 }
    )
  }
}

// POST /api/hospital/emergency
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      patient_id,
      condition,
      severity,
      doctor_id,
      notes
    } = body;

    // Validate required fields
    if (!patient_id || !condition || !severity || !doctor_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO emergency_cases (
        patient_id,
        \`condition\`,
        severity,
        arrival_time,
        status,
        doctor_id,
        notes
      ) VALUES (?, ?, ?, NOW(), 'waiting', ?, ?)`,
      [
        patient_id,
        condition,
        severity,
        doctor_id,
        notes || null
      ]
    ) as [ResultSetHeader, any];

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
        "emergency_cases",
        result[0].insertId,
        JSON.stringify(body),
        "system"
      ]
    );

    return NextResponse.json(
      { message: "Emergency case added successfully", id: result[0].insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding emergency case:", error);
    return NextResponse.json(
      { error: "Failed to add emergency case" },
      { status: 500 }
    );
  }
} 