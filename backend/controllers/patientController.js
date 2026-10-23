import pool from '../config/db.js'

export async function listPatients(req, res) {
  try {
    const { search = '' } = req.query
    const [rows] = await pool.query(
      `SELECT * FROM patients
       WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?
       ORDER BY created_at DESC`,
      [`%${search}%`, `%${search}%`, `%${search}%`]
    )
    res.json({ patients: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch patients' })
  }
}

export async function getPatient(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM patients WHERE id = ?', [req.params.id])
    if (!rows[0]) return res.status(404).json({ message: 'Patient not found' })

    const [visits] = await pool.query(
      `SELECT a.*, d.name AS doctor_name FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       WHERE a.patient_id = ? ORDER BY a.appointment_date DESC`,
      [req.params.id]
    )

    res.json({ patient: rows[0], visits })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch patient' })
  }
}

export async function createPatient(req, res) {
  const { name, date_of_birth, gender, phone, email, address, blood_group, emergency_contact } = req.body
  if (!name) return res.status(400).json({ message: 'Name is required' })

  try {
    const [result] = await pool.query(
      `INSERT INTO patients (name, date_of_birth, gender, phone, email, address, blood_group, emergency_contact)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, date_of_birth || null, gender || null, phone || null, email || null, address || null, blood_group || null, emergency_contact || null]
    )
    res.status(201).json({ id: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to create patient' })
  }
}

export async function updatePatient(req, res) {
  const { name, date_of_birth, gender, phone, email, address, blood_group, emergency_contact } = req.body
  if (!name) return res.status(400).json({ message: 'Name is required' })

  try {
    const [result] = await pool.query(
      `UPDATE patients SET name=?, date_of_birth=?, gender=?, phone=?, email=?, address=?, blood_group=?, emergency_contact=?
       WHERE id = ?`,
      [name, date_of_birth || null, gender || null, phone || null, email || null, address || null, blood_group || null, emergency_contact || null, req.params.id]
    )
    if (!result.affectedRows) return res.status(404).json({ message: 'Patient not found' })
    res.json({ message: 'Patient updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update patient' })
  }
}

export async function deletePatient(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM patients WHERE id = ?', [req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Patient not found' })
    res.json({ message: 'Patient deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to delete patient' })
  }
}
