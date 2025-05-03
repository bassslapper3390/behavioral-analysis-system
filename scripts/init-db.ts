import { query } from "@/lib/db"

async function initializeDatabase() {
  try {
    // Insert sample wards
    await query(`
      INSERT INTO wards (name, type, capacity, charge_per_day, status, description)
      VALUES 
        ('General Ward A', 'General', 20, 1000.00, 'active', 'General ward for basic care'),
        ('ICU', 'Intensive Care', 10, 5000.00, 'active', 'Intensive Care Unit'),
        ('Pediatric Ward', 'Pediatric', 15, 1500.00, 'active', 'Ward for children'),
        ('Maternity Ward', 'Maternity', 12, 2000.00, 'active', 'Ward for maternity care')
    `)

    // Insert sample beds for each ward
    const wards = await query('SELECT id FROM wards') as any[]
    for (const ward of wards) {
      const capacity = ward.id === 2 ? 10 : (ward.id === 3 ? 15 : (ward.id === 4 ? 12 : 20))
      for (let i = 1; i <= capacity; i++) {
        await query(`
          INSERT INTO beds (ward_id, bed_number, status)
          VALUES (?, ?, 'available')
        `, [ward.id, `${ward.id}-${i.toString().padStart(2, '0')}`])
      }
    }

    // Insert sample doctors
    await query(`
      INSERT INTO doctors (first_name, last_name, specialization, qualification, experience, contact_number, email, available_days, consultation_fee, status, address)
      VALUES 
        ('John', 'Doe', 'General Medicine', 'MD', 10, '1234567890', 'john.doe@hospital.com', 'Mon,Tue,Wed,Thu,Fri', 500.00, 'active', '123 Medical St'),
        ('Jane', 'Smith', 'Pediatrics', 'MD', 8, '0987654321', 'jane.smith@hospital.com', 'Mon,Wed,Fri', 600.00, 'active', '456 Health Ave'),
        ('Mike', 'Johnson', 'Cardiology', 'MD', 15, '5555555555', 'mike.johnson@hospital.com', 'Tue,Thu', 800.00, 'active', '789 Care Blvd')
    `)

    // Insert sample patients
    await query(`
      INSERT INTO patients (first_name, last_name, date_of_birth, gender, blood_group, contact_number, email, address, medical_history)
      VALUES 
        ('Alice', 'Brown', '1990-05-15', 'Female', 'O+', '1111111111', 'alice.brown@email.com', '321 Patient St', 'No major issues'),
        ('Bob', 'Wilson', '1985-08-22', 'Male', 'A+', '2222222222', 'bob.wilson@email.com', '654 Health St', 'Hypertension'),
        ('Carol', 'Davis', '1995-03-10', 'Female', 'B+', '3333333333', 'carol.davis@email.com', '987 Care St', 'Asthma')
    `)

    // Insert sample appointments
    await query(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status)
      VALUES 
        (1, 1, CURDATE(), '10:00:00', 'Regular checkup', 'scheduled'),
        (2, 2, CURDATE(), '11:00:00', 'Follow-up', 'scheduled'),
        (3, 3, CURDATE(), '14:00:00', 'Consultation', 'scheduled')
    `)

    // Insert sample lab reports
    await query(`
      INSERT INTO lab_reports (patient_id, test_type, test_date, results, reference_range, status)
      VALUES 
        (1, 'Blood Test', CURDATE(), 'Normal', '4.5-11.0 x10^9/L', 'pending'),
        (2, 'X-Ray', CURDATE(), 'Clear', 'N/A', 'pending'),
        (3, 'ECG', CURDATE(), 'Normal sinus rhythm', '60-100 bpm', 'pending')
    `)

    console.log('Database initialized with sample data')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}

initializeDatabase() 