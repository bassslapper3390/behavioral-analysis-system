import { NextResponse } from "next/server"
import { query } from "@/lib/db"

interface Ward {
  id: number
  name: string
  type: string
  capacity: number
  charge_per_day: number
  status: string
  description: string
  occupied_beds: number
}

// GET /api/hospital/wards
export async function GET() {
  try {
    const rows = await query(`
      SELECT 
        w.id,
        w.name,
        w.type,
        w.capacity,
        w.charge_per_day,
        w.status,
        w.description,
        COUNT(a.id) as occupied_beds
      FROM wards w
      LEFT JOIN admissions a ON w.id = a.ward_id AND a.status = 'active'
      GROUP BY w.id, w.name, w.type, w.capacity, w.charge_per_day, w.status, w.description
      ORDER BY w.name
    `) as Ward[]

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching wards:', error)
    return NextResponse.json(
      { error: "Failed to fetch wards" },
      { status: 500 }
    )
  }
}

// POST /api/hospital/wards
export async function POST(request: Request) {
  try {
    const {
      name,
      type,
      capacity,
      charge_per_day,
      status,
      description
    } = await request.json()

    const result = await query(
      `INSERT INTO wards (
        name,
        type,
        capacity,
        charge_per_day,
        status,
        description,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        name,
        type,
        capacity,
        charge_per_day,
        status,
        description
      ]
    ) as any

    // Automatically create beds for the new ward
    const wardId = result.insertId
    for (let i = 1; i <= capacity; i++) {
      await query(
        `INSERT INTO beds (ward_id, bed_number, status, created_at) VALUES (?, ?, 'available', NOW())`,
        [wardId, i.toString()]
      )
    }

    // Log the action
    await query(
      `INSERT INTO audit_logs (user_id, timestamp, action, table_name, record_id, details) 
       VALUES (?, NOW(), ?, ?, ?, ?)`,
      [1, 'CREATE', 'wards', result.insertId, 'New ward created']
    )

    return NextResponse.json({ 
      success: true, 
      message: "Ward created successfully",
      id: result.insertId
    })
  } catch (error) {
    console.error('Error creating ward:', error)
    return NextResponse.json(
      { error: "Failed to create ward" },
      { status: 500 }
    )
  }
} 