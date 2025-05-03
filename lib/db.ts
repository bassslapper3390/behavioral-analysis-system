import mysql from "mysql2/promise"

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "behavioral_analysis",
  port: Number(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create a connection pool
let pool: mysql.Pool | null = null

// Initialize the connection pool
export async function initDb() {
  try {
    if (!pool) {
      pool = mysql.createPool(dbConfig)
      // Test the connection
      const connection = await pool.getConnection()
      await connection.ping()
      connection.release()
      console.log("MySQL connection pool created and tested successfully")
    }
    return true
  } catch (error) {
    console.error("Error initializing database connection:", error)
    return false
  }
}

// Get a connection from the pool
export async function getConnection() {
  if (!pool) {
    const initialized = await initDb()
    if (!initialized) {
      throw new Error("Failed to initialize database connection")
    }
  }
  return pool!.getConnection()
}

// Execute a query
export async function query(sql: string, params: any[] = []) {
  let connection
  try {
    connection = await getConnection()
    const [results] = await connection.execute(sql, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

// Close the connection pool
export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
    console.log("MySQL connection pool closed")
  }
}

// Save behavioral profile to database
export async function saveBehavioralProfile(userId: number, profile: any) {
  try {
    console.log(
      "Saving behavioral profile for user:",
      userId,
      "Profile:",
      JSON.stringify(profile).substring(0, 100) + "...",
    )

    // Check if profile already exists
    const existingProfiles = (await query("SELECT id FROM behavioral_profiles WHERE user_id = ?", [userId])) as any[]

    if (existingProfiles.length > 0) {
      // Update existing profile
      console.log("Updating existing profile for user:", userId)
      await query(
        `UPDATE behavioral_profiles 
         SET typing_speed = ?, 
             typing_rhythm = ?, 
             mouse_movement_pattern = ?, 
             click_pattern = ?, 
             mouse_speed = ?,
             mouse_acceleration = ?,
             click_frequency = ?,
             scroll_pattern = ?,
             idle_time = ?,
             session_duration = ?,
             focus_time = ?,
             updated_at = NOW() 
         WHERE user_id = ?`,
        [
          profile.typingSpeed || 0,
          JSON.stringify(profile.typingRhythm || []),
          JSON.stringify(profile.mouseMovementPattern || []),
          JSON.stringify(profile.clickPattern || []),
          profile.mouseSpeed || 0,
          JSON.stringify(profile.mouseAcceleration || []),
          profile.clickFrequency || 0,
          JSON.stringify(profile.scrollPattern || []),
          profile.idleTime || 0,
          profile.sessionDuration || 0,
          profile.focusTime || 0,
          userId,
        ],
      )
    } else {
      // Insert new profile
      console.log("Inserting new profile for user:", userId)
      await query(
        `INSERT INTO behavioral_profiles 
         (user_id, typing_speed, typing_rhythm, mouse_movement_pattern, click_pattern,
          mouse_speed, mouse_acceleration, click_frequency, scroll_pattern,
          idle_time, session_duration, focus_time) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          profile.typingSpeed || 0,
          JSON.stringify(profile.typingRhythm || []),
          JSON.stringify(profile.mouseMovementPattern || []),
          JSON.stringify(profile.clickPattern || []),
          profile.mouseSpeed || 0,
          JSON.stringify(profile.mouseAcceleration || []),
          profile.clickFrequency || 0,
          JSON.stringify(profile.scrollPattern || []),
          profile.idleTime || 0,
          profile.sessionDuration || 0,
          profile.focusTime || 0
        ],
      )
    }

    return true
  } catch (error) {
    console.error("Error saving behavioral profile:", error)
    return false
  }
}

// Get behavioral profile from database
export async function getBehavioralProfile(userId: number) {
  try {
    console.log("Getting behavioral profile for user:", userId)
    const profiles = (await query("SELECT * FROM behavioral_profiles WHERE user_id = ?", [userId])) as any[]

    if (profiles.length === 0) {
      console.log("No profile found for user:", userId)
      return null
    }

    const profile = profiles[0]
    console.log("Profile found for user:", userId)

    return {
      typingSpeed: profile.typing_speed,
      typingRhythm: JSON.parse(profile.typing_rhythm || "[]"),
      mouseMovementPattern: JSON.parse(profile.mouse_movement_pattern || "[]"),
      clickPattern: JSON.parse(profile.click_pattern || "[]"),
      mouseSpeed: profile.mouse_speed,
      mouseAcceleration: JSON.parse(profile.mouse_acceleration || "[]"),
      clickFrequency: profile.click_frequency,
      scrollPattern: JSON.parse(profile.scroll_pattern || "[]"),
      idleTime: profile.idle_time,
      sessionDuration: profile.session_duration,
      focusTime: profile.focus_time
    }
  } catch (error) {
    console.error("Error getting behavioral profile:", error)
    return null
  }
}

// Log anomaly to database
export async function logAnomaly(userId: number, isAnomaly: boolean, confidenceScore: number, details: string) {
  try {
    console.log("Logging anomaly for user:", userId, "isAnomaly:", isAnomaly, "confidenceScore:", confidenceScore)
    await query(
      "INSERT INTO anomalies (user_id, timestamp, is_anomaly, confidence_score, details) VALUES (?, NOW(), ?, ?, ?)",
      [userId, isAnomaly ? 1 : 0, confidenceScore, details],
    )
    return true
  } catch (error) {
    console.error("Error logging anomaly:", error)
    return false
  }
}

// Save login history with behavioral data
export async function saveLoginHistory(userId: number, profile: any) {
  try {
    console.log("Saving login history for user:", userId)
    
    await query(
      `INSERT INTO login_history 
       (user_id, timestamp, typing_speed, typing_rhythm, mouse_movement_pattern, 
        click_pattern, mouse_speed, mouse_acceleration, click_frequency, 
        scroll_pattern, idle_time, session_duration, focus_time) 
       VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        profile.typingSpeed || 0,
        JSON.stringify(profile.typingRhythm || []),
        JSON.stringify(profile.mouseMovementPattern || []),
        JSON.stringify(profile.clickPattern || []),
        profile.mouseSpeed || 0,
        JSON.stringify(profile.mouseAcceleration || []),
        profile.clickFrequency || 0,
        JSON.stringify(profile.scrollPattern || []),
        profile.idleTime || 0,
        profile.sessionDuration || 0,
        profile.focusTime || 0
      ]
    )

    // Get last 3 logins for this user
    const recentLogins = await query(
      `SELECT * FROM login_history 
       WHERE user_id = ? 
       ORDER BY timestamp DESC 
       LIMIT 3`,
      [userId]
    ) as any[]

    if (recentLogins.length > 0) {
      // Calculate aggregated values
      const aggregatedProfile = {
        typingSpeed: recentLogins.reduce((sum, login) => sum + (login.typing_speed || 0), 0) / recentLogins.length,
        typingRhythm: recentLogins.reduce((acc, login) => {
          const rhythm = JSON.parse(login.typing_rhythm || "[]")
          return acc.concat(rhythm)
        }, []),
        mouseMovementPattern: recentLogins.reduce((acc, login) => {
          const pattern = JSON.parse(login.mouse_movement_pattern || "[]")
          return acc.concat(pattern)
        }, []),
        clickPattern: recentLogins.reduce((acc, login) => {
          const pattern = JSON.parse(login.click_pattern || "[]")
          return acc.concat(pattern)
        }, []),
        mouseSpeed: recentLogins.reduce((sum, login) => sum + (login.mouse_speed || 0), 0) / recentLogins.length,
        mouseAcceleration: recentLogins.reduce((acc, login) => {
          const acceleration = JSON.parse(login.mouse_acceleration || "[]")
          return acc.concat(acceleration)
        }, []),
        clickFrequency: recentLogins.reduce((sum, login) => sum + (login.click_frequency || 0), 0) / recentLogins.length,
        scrollPattern: recentLogins.reduce((acc, login) => {
          const pattern = JSON.parse(login.scroll_pattern || "[]")
          return acc.concat(pattern)
        }, []),
        idleTime: recentLogins.reduce((sum, login) => sum + (login.idle_time || 0), 0) / recentLogins.length,
        sessionDuration: recentLogins.reduce((sum, login) => sum + (login.session_duration || 0), 0) / recentLogins.length,
        focusTime: recentLogins.reduce((sum, login) => sum + (login.focus_time || 0), 0) / recentLogins.length
      }

      // Update the behavioral profile with aggregated data
      await saveBehavioralProfile(userId, aggregatedProfile)
    }

    return true
  } catch (error) {
    console.error("Error saving login history:", error)
    return false
  }
}

export default dbConfig
