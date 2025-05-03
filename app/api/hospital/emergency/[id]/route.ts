import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { RowDataPacket } from "mysql2"

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

// PATCH /api/hospital/emergency/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()

    await query(
      `UPDATE emergency_cases SET status = ? WHERE id = ?`,
      [status, params.id]
    )

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
        "UPDATE",
        "emergency_cases",
        params.id,
        JSON.stringify({ status }),
        "system", // Replace with actual user ID when authentication is implemented
      ]
    )

    return NextResponse.json({ 
      message: "Emergency case status updated successfully" 
    })
  } catch (error) {
    console.error("Error updating emergency case:", error)
    return NextResponse.json(
      { error: "Failed to update emergency case" },
      { status: 500 }
    )
  }
}

// GET /api/hospital/emergency/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rows = await query(
      "SELECT * FROM emergency_cases WHERE id = ?",
      [params.id]
    ) as EmergencyCase[]

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Emergency case not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error fetching emergency case:", error)
    return NextResponse.json(
      { error: "Failed to fetch emergency case" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      patient_name,
      age,
      contact_number,
      emergency_type,
      severity,
      status,
      notes,
    } = body

    const result = await query(
      `UPDATE emergency_cases SET
        patient_name = ?,
        age = ?,
        contact_number = ?,
        emergency_type = ?,
        severity = ?,
        status = ?,
        notes = ?
      WHERE id = ?`,
      [
        patient_name,
        age,
        contact_number,
        emergency_type,
        severity,
        status,
        notes,
        params.id,
      ]
    )

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
        "UPDATE",
        "emergency_cases",
        params.id,
        JSON.stringify(body),
        "system", // Replace with actual user ID when authentication is implemented
      ]
    )

    return NextResponse.json(
      { message: "Emergency case updated successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating emergency case:", error)
    return NextResponse.json(
      { error: "Failed to update emergency case" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current emergency case data before deletion
    const rows = await query(
      "SELECT * FROM emergency_cases WHERE id = ?",
      [params.id]
    ) as EmergencyCase[]

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Emergency case not found" },
        { status: 404 }
      )
    }

    await query("DELETE FROM emergency_cases WHERE id = ?", [params.id])

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
        "DELETE",
        "emergency_cases",
        params.id,
        JSON.stringify(rows[0]),
        "system", // Replace with actual user ID when authentication is implemented
      ]
    )

    return NextResponse.json(
      { message: "Emergency case deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting emergency case:", error)
    return NextResponse.json(
      { error: "Failed to delete emergency case" },
      { status: 500 }
    )
  }
} 