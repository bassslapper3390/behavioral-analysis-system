import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const wardId = parseInt(params.id)
    
    const rows = await query(`
      SELECT 
        b.id,
        b.ward_id,
        b.bed_number,
        b.status
      FROM beds b
      WHERE b.ward_id = ?
      AND b.status = 'available'
      ORDER BY b.bed_number
    `, [wardId])

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching beds:', error)
    return NextResponse.json(
      { error: "Failed to fetch beds" },
      { status: 500 }
    )
  }
} 