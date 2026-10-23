import pool from '../config/db.js'

export async function listDoctors(req, res) {
  try {
    const { specialization = '' } = req.query
    const [rows] = await pool.query(
      `SELECT * FROM doctors WHERE specialization LIKE ? ORDER BY name`,
      [`%${specialization}%`]
    )
    res.json({ doctors: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch doctors' })
  }
}

export async function getDoctor(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM doctors WHERE id = ?', [req.params.id])
    if (!rows[0]) return res.status(404).json({ message: 'Doctor not found' })

    const [upcoming] = await pool.query(
      `SELECT a.*, p.name AS patient_name FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       WHERE a.doctor_id = ? AND a.appointment_date >= NOW()
       ORDER BY a.appointment_date ASC LIMIT 20`,
      [req.params.id]
    )

    res.json({ doctor: rows[0], upcoming })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch doctor' })
  }
}

export async function createDoctor(req, res) {
  const { name, specialization, phone, email, consultation_fee, status } = req.body
  if (!name || !specialization) {
    return res.status(400).json({ message: 'Name and specialization are required' })
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO doctors (name, specialization, phone, email, consultation_fee, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, specialization, phone || null, email || null, consultation_fee || 0, status || 'active']
    )
    res.status(201).json({ id: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to create doctor' })
  }
}

export async function updateDoctor(req, res) {
  const { name, specialization, phone, email, consultation_fee, status } = req.body
  if (!name || !specialization) {
    return res.status(400).json({ message: 'Name and specialization are required' })
  }

  try {
    const [result] = await pool.query(
      `UPDATE doctors SET name=?, specialization=?, phone=?, email=?, consultation_fee=?, status=?
       WHERE id = ?`,
      [name, specialization, phone || null, email || null, consultation_fee || 0, status || 'active', req.params.id]
    )
    if (!result.affectedRows) return res.status(404).json({ message: 'Doctor not found' })
    res.json({ message: 'Doctor updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update doctor' })
  }
}

export async function deleteDoctor(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM doctors WHERE id = ?', [req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Doctor not found' })
    res.json({ message: 'Doctor deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to delete doctor' })
  }
}
