import mysql from "mysql2/promise"
import fs from "fs"
import path from "path"

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  })

  try {
    // Create database if it doesn't exist
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "behavioral_analysis"}`
    )

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME || "behavioral_analysis"}`)

    // Read and execute schema.sql
    const schemaPath = path.join(process.cwd(), "src", "lib", "schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf8")
    const statements = schema
      .split(";")
      .filter(statement => statement.trim().length > 0)

    for (const statement of statements) {
      await connection.query(statement)
    }

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  } finally {
    await connection.end()
  }
}

// Run the initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

export { initializeDatabase } 