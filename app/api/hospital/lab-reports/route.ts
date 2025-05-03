import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

// GET /api/hospital/lab-reports
export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "behavioral_analysis"
    });

    const [rows] = await connection.execute(`
      SELECT 
        lr.id,
        lr.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        lr.test_type,
        lr.test_date,
        lr.result_date,
        lr.results,
        lr.reference_range,
        lr.status,
        lr.notes
      FROM lab_reports lr
      JOIN patients p ON lr.patient_id = p.id
      ORDER BY lr.test_date DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching lab reports:', error);
    return NextResponse.json(
      { error: "Failed to fetch lab reports" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST /api/hospital/lab-reports
export async function POST(request: Request) {
  let connection;
  try {
    const {
      patient_id,
      test_type,
      test_date,
      result_date,
      results,
      reference_range,
      status,
      notes
    } = await request.json();

    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "behavioral_analysis"
    });

    const [result] = await connection.execute(
      `INSERT INTO lab_reports (
        patient_id,
        test_type,
        test_date,
        result_date,
        results,
        reference_range,
        status,
        notes,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        patient_id,
        test_type,
        test_date,
        result_date,
        results,
        reference_range,
        status,
        notes
      ]
    );

    // Log the action
    await connection.execute(
      `INSERT INTO audit_logs (user_id, timestamp, action, table_name, record_id, details) 
       VALUES (?, NOW(), ?, ?, ?, ?)`,
      [1, 'CREATE', 'lab_reports', (result as any).insertId, 'New lab report created']
    );

    return NextResponse.json({ 
      success: true, 
      message: "Lab report added successfully",
      id: (result as any).insertId
    });
  } catch (error) {
    console.error('Error adding lab report:', error);
    return NextResponse.json(
      { error: "Failed to add lab report" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
} 