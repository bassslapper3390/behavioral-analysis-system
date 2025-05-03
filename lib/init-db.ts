import { query } from './db';

export async function initializeDatabase() {
  try {
    // Create behavioral_profiles table
    await query(`
      CREATE TABLE IF NOT EXISTS behavioral_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        typing_speed FLOAT,
        typing_rhythm JSON,
        mouse_movement_pattern JSON,
        click_pattern JSON,
        mouse_speed FLOAT,
        mouse_acceleration JSON,
        click_frequency FLOAT,
        scroll_pattern JSON,
        idle_time INT,
        session_duration INT,
        focus_time INT,
        created_at DATETIME,
        updated_at DATETIME,
        INDEX idx_user_id (user_id)
      )
    `);

    // Create significant_events table
    await query(`
      CREATE TABLE IF NOT EXISTS significant_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        element_id VARCHAR(255),
        details JSON,
        timestamp DATETIME,
        INDEX idx_user_id (user_id)
      )
    `);

    // Create anomalies table
    await query(`
      CREATE TABLE IF NOT EXISTS anomalies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        timestamp DATETIME NOT NULL,
        is_anomaly BOOLEAN NOT NULL,
        confidence_score FLOAT,
        details TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database tables:', error);
    return false;
  }
} 