import pool from '../config/db.js'

export async function listBills(req, res) {
  try {
    const { status, patient_id } = req.query
    const conditions = []
    const params = []

    if (status) {
      conditions.push('b.status = ?')
      params.push(status)
    }
    if (patient_id) {
      conditions.push('b.patient_id = ?')
      params.push(patient_id)
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [rows] = await pool.query(
      `SELECT b.*, p.name AS patient_name FROM bills b
       JOIN patients p ON p.id = b.patient_id
       ${where}
       ORDER BY b.issued_at DESC`,
      params
    )
    res.json({ bills: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch bills' })
  }
}

export async function createBill(req, res) {
  const { patient_id, appointment_id, amount, description } = req.body
  if (!patient_id || !amount) {
    return res.status(400).json({ message: 'Patient and amount are required' })
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO bills (patient_id, appointment_id, amount, description) VALUES (?, ?, ?, ?)`,
      [patient_id, appointment_id || null, amount, description || null]
    )
    res.status(201).json({ id: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to create bill' })
  }
}

export async function markBillPaid(req, res) {
  try {
    const [result] = await pool.query(
      `UPDATE bills SET status = 'paid', paid_at = NOW() WHERE id = ?`,
      [req.params.id]
    )
    if (!result.affectedRows) return res.status(404).json({ message: 'Bill not found' })
    res.json({ message: 'Bill marked as paid' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update bill' })
  }
}

export async function cancelBill(req, res) {
  try {
    const [result] = await pool.query(`UPDATE bills SET status = 'cancelled' WHERE id = ?`, [req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Bill not found' })
    res.json({ message: 'Bill cancelled' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to cancel bill' })
  }
}

export async function deleteBill(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM bills WHERE id = ?', [req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Bill not found' })
    res.json({ message: 'Bill deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to delete bill' })
  }
}
