-- Create the database
CREATE DATABASE behavioral_analysis;

-- Use the database
USE behavioral_analysis;

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  anomaly_warnings INT DEFAULT 0,
  force_logout BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create behavioral_profiles table
CREATE TABLE behavioral_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  typing_speed FLOAT,
  typing_rhythm TEXT,
  mouse_movement_pattern TEXT,
  click_pattern TEXT,
  mouse_speed FLOAT,
  click_frequency FLOAT,
  idle_time INT,
  session_duration INT,
  focus_time INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Drop anomalies table if exists to recreate with correct schema
DROP TABLE IF EXISTS anomalies;

-- Create anomalies table with correct schema
CREATE TABLE anomalies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  timestamp DATETIME NOT NULL,
  is_anomaly TINYINT(1) NOT NULL DEFAULT 0,
  confidence_score FLOAT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_timestamp (user_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create audit_logs table
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  timestamp DATETIME NOT NULL,
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id VARCHAR(50) NOT NULL,
  details TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create suspicious_activities table
CREATE TABLE suspicious_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pattern VARCHAR(255) NOT NULL,
  severity ENUM('low', 'medium', 'high') NOT NULL,
  timestamp DATETIME NOT NULL,
  status ENUM('pending', 'investigated', 'resolved') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create login_history table
CREATE TABLE login_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  timestamp DATETIME NOT NULL,
  typing_speed FLOAT,
  typing_rhythm TEXT,
  mouse_movement_pattern TEXT,
  click_pattern TEXT,
  mouse_speed FLOAT,
  mouse_acceleration TEXT,
  click_frequency FLOAT,
  scroll_pattern TEXT,
  idle_time INT,
  session_duration INT,
  focus_time INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  qualification VARCHAR(100) NOT NULL,
  experience INT NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  available_days VARCHAR(50) NOT NULL,
  consultation_fee DECIMAL(10,2) NOT NULL,
  address TEXT NOT NULL,
  status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  blood_group VARCHAR(5) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  address TEXT NOT NULL,
  medical_history TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create appointments table
CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Create medical_records table
CREATE TABLE medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  visit_date DATE NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NOT NULL,
  prescription TEXT NOT NULL,
  notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Create wards table
CREATE TABLE wards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  capacity INT NOT NULL,
  charge_per_day DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create beds table
CREATE TABLE beds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ward_id INT NOT NULL,
  bed_number VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ward_id) REFERENCES wards(id)
);

-- Create admissions table
CREATE TABLE admissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  ward_id INT NOT NULL,
  bed_id INT NOT NULL,
  admission_date DATE NOT NULL,
  expected_discharge_date DATE,
  actual_discharge_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  diagnosis TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  FOREIGN KEY (bed_id) REFERENCES beds(id)
);

-- Create lab_reports table
CREATE TABLE lab_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  test_type VARCHAR(100) NOT NULL,
  test_date DATE NOT NULL,
  result_date DATE,
  results TEXT NOT NULL,
  reference_range TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Create emergency_cases table
CREATE TABLE emergency_cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  condition TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL,
  arrival_time DATETIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  doctor_id INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Insert a demo user
INSERT INTO users (username, email, password) 
VALUES ('demo', 'demo@example.com', 'password');

-- Insert some sample anomalies
INSERT INTO anomalies (user_id, timestamp, is_anomaly, confidence_score, details) VALUES 
(1, '2023-04-08 10:30:00', 1, 0.85, 'Unusual typing pattern detected'),
(1, '2023-04-08 11:15:00', 0, 0.25, 'Normal activity'),
(1, '2023-04-08 12:00:00', 1, 0.92, 'Multiple unusual mouse movements'),
(1, '2023-04-08 12:45:00', 0, 0.15, 'Normal activity'),
(1, '2023-04-08 13:30:00', 0, 0.30, 'Normal activity'),
(1, '2023-04-08 14:15:00', 1, 0.78, 'Unusual click pattern detected');

-- Insert some sample audit logs
INSERT INTO audit_logs (user_id, timestamp, action, table_name, record_id, details) VALUES
(1, '2023-04-08 10:30:00', 'LOGIN', 'users', '1', 'User login successful'),
(1, '2023-04-08 11:15:00', 'CREATE', 'patients', '101', 'New patient record created'),
(1, '2023-04-08 12:00:00', 'UPDATE', 'appointments', '201', 'Appointment rescheduled'),
(1, '2023-04-08 12:45:00', 'READ', 'patients', '102', 'Patient record accessed'),
(1, '2023-04-08 13:30:00', 'DELETE', 'appointments', '202', 'Appointment cancelled'),
(1, '2023-04-08 14:15:00', 'LOGOUT', 'users', '1', 'User logout');

-- Insert some sample suspicious activities
INSERT INTO suspicious_activities (user_id, pattern, severity, timestamp, status) VALUES
(1, 'Multiple failed login attempts', 'high', '2023-04-08 10:30:00', 'investigated'),
(1, 'Unusual mouse movement pattern', 'medium', '2023-04-08 11:15:00', 'pending'),
(1, 'Rapid typing speed variation', 'low', '2023-04-08 12:00:00', 'resolved'),
(1, 'Multiple account access attempts', 'high', '2023-04-08 12:45:00', 'investigated'),
(1, 'Unusual click pattern', 'medium', '2023-04-08 13:30:00', 'pending'),
(1, 'Suspicious navigation pattern', 'low', '2023-04-08 14:15:00', 'resolved');

