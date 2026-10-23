import pool from '../config/db.js'

export async function listAppointments(req, res) {
  try {
    const { date, doctor_id, status } = req.query
    const conditions = []
    const params = []

    if (date) {
      conditions.push('DATE(a.appointment_date) = ?')
      params.push(date)
    }
    if (doctor_id) {
      conditions.push('a.doctor_id = ?')
      params.push(doctor_id)
    }
    if (status) {
      conditions.push('a.status = ?')
      params.push(status)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [rows] = await pool.query(
      `SELECT a.*, p.name AS patient_name, d.name AS doctor_name, d.specialization
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       ${where}
       ORDER BY a.appointment_date DESC`,
      params
    )
    res.json({ appointments: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch appointments' })
  }
}

export async function createAppointment(req, res) {
  const { patient_id, doctor_id, appointment_date, reason } = req.body
  if (!patient_id || !doctor_id || !appointment_date) {
    return res.status(400).json({ message: 'Patient, doctor, and date/time are required' })
  }

  try {
    // Prevent double-booking the same doctor at the same slot
    const [clash] = await pool.query(
      `SELECT id FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND status = 'scheduled'`,
      [doctor_id, appointment_date]
    )
    if (clash.length) {
      return res.status(409).json({ message: 'This doctor already has an appointment at that time' })
    }

    const [result] = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason)
       VALUES (?, ?, ?, ?)`,
      [patient_id, doctor_id, appointment_date, reason || null]
    )
    res.status(201).json({ id: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to create appointment' })
  }
}

export async function updateAppointmentStatus(req, res) {
  const { status } = req.body
  const allowed = ['scheduled', 'completed', 'cancelled', 'no_show']
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` })
  }

  try {
    const [result] = await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Appointment not found' })
    res.json({ message: 'Status updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update status' })
  }
}

export async function updateAppointment(req, res) {
  const { appointment_date, reason, notes } = req.body
  try {
    const [result] = await pool.query(
      `UPDATE appointments SET appointment_date = COALESCE(?, appointment_date), reason = ?, notes = ? WHERE id = ?`,
      [appointment_date || null, reason || null, notes || null, req.params.id]
    )
    if (!result.affectedRows) return res.status(404).json({ message: 'Appointment not found' })
    res.json({ message: 'Appointment updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update appointment' })
  }
}

export async function deleteAppointment(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM appointments WHERE id = ?', [req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Appointment not found' })
    res.json({ message: 'Appointment deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to delete appointment' })
  }
}
