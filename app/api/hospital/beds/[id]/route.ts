import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// PUT /api/hospital/beds/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const {
      ward_id,
      bed_number,
      status
    } = await request.json()

    await query(
      `UPDATE beds 
       SET ward_id = ?,
           bed_number = ?,
           status = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        ward_id,
        bed_number,
        status,
        params.id
      ]
    )

    // Log the action
    await query(
      `INSERT INTO audit_logs (user_id, timestamp, action, table_name, record_id, details) 
       VALUES (?, NOW(), ?, ?, ?, ?)`,
      [1, 'UPDATE', 'beds', params.id, 'Bed updated']
    )

    return NextResponse.json({ 
      success: true, 
      message: "Bed updated successfully"
    })
  } catch (error) {
    console.error('Error updating bed:', error)
    return NextResponse.json(
      { error: "Failed to update bed" },
      { status: 500 }
    )
  }
} 