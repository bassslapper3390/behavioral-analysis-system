import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// PUT /api/hospital/wards/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const {
      name,
      type,
      capacity,
      charge_per_day,
      status,
      description
    } = await request.json()

    await query(
      `UPDATE wards 
       SET name = ?,
           type = ?,
           capacity = ?,
           charge_per_day = ?,
           status = ?,
           description = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        name,
        type,
        capacity,
        charge_per_day,
        status,
        description,
        params.id
      ]
    )

    // Log the action
    await query(
      `INSERT INTO audit_logs (user_id, timestamp, action, table_name, record_id, details) 
       VALUES (?, NOW(), ?, ?, ?, ?)`,
      [1, 'UPDATE', 'wards', params.id, 'Ward updated']
    )

    return NextResponse.json({ 
      success: true, 
      message: "Ward updated successfully"
    })
  } catch (error) {
    console.error('Error updating ward:', error)
    return NextResponse.json(
      { error: "Failed to update ward" },
      { status: 500 }
    )
  }
} 