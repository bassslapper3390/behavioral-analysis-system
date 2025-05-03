import { NextResponse } from "next/server"
import { db } from "@/src/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      status,
      address,
    } = body

    const result = await db.query(
      `UPDATE doctors SET
        first_name = ?,
        last_name = ?,
        specialization = ?,
        qualification = ?,
        experience = ?,
        contact_number = ?,
        email = ?,
        available_days = ?,
        consultation_fee = ?,
        status = ?,
        address = ?
      WHERE id = ?`,
      [
        first_name,
        last_name,
        specialization,
        qualification,
        experience,
        contact_number,
        email,
        available_days,
        consultation_fee,
        status,
        address,
        params.id,
      ]
    )

    // Log the action
    await db.query(
      `INSERT INTO audit_logs (
        action,
        table_name,
        record_id,
        changes,
        performed_by
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        "UPDATE",
        "doctors",
        params.id,
        JSON.stringify(body),
        "system", // Replace with actual user ID when authentication is implemented
      ]
    )

    return NextResponse.json(
      { message: "Doctor updated successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating doctor:", error)
    return NextResponse.json(
      { error: "Failed to update doctor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current doctor data before deletion
    const doctors = await db.query(
      "SELECT * FROM doctors WHERE id = ?",
      [params.id]
    ) as any[]

    if (doctors.length === 0) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      )
    }

    await db.query("DELETE FROM doctors WHERE id = ?", [params.id])

    // Log the action
    await db.query(
      `INSERT INTO audit_logs (
        action,
        table_name,
        record_id,
        changes,
        performed_by
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        "DELETE",
        "doctors",
        params.id,
        JSON.stringify(doctors[0]),
        "system", // Replace with actual user ID when authentication is implemented
      ]
    )

    return NextResponse.json(
      { message: "Doctor deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting doctor:", error)
    return NextResponse.json(
      { error: "Failed to delete doctor" },
      { status: 500 }
    )
  }
} 