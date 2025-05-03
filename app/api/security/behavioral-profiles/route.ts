import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT id, user_id, typing_speed, typing_rhythm, mouse_movement_pattern, click_pattern, created_at, updated_at
      FROM behavioral_profiles
      ORDER BY created_at DESC
      LIMIT 100
    `)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching behavioral profiles:', error)
    return NextResponse.json({ error: 'Failed to fetch behavioral profiles' }, { status: 500 })
  }
} 