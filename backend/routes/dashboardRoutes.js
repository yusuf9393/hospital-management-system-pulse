import { Router } from 'express'
import pool from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [[{ patients }]] = await pool.query('SELECT COUNT(*) AS patients FROM patients')
    const [[{ doctors }]] = await pool.query(
      `SELECT COUNT(*) AS doctors FROM doctors WHERE status = 'active'`
    )
    const [[{ appointmentsToday }]] = await pool.query(
      `SELECT COUNT(*) AS appointmentsToday FROM appointments
       WHERE DATE(appointment_date) = CURDATE() AND status != 'cancelled'`
    )
    const [[{ pendingBills }]] = await pool.query(
      `SELECT COUNT(*) AS pendingBills FROM bills WHERE status = 'pending'`
    )

    // Last 7 days (including today), one row per calendar day so the chart is stable
    const [rawTrend] = await pool.query(
      `SELECT DATE(appointment_date) AS d, COUNT(*) AS appointments
       FROM appointments
       WHERE appointment_date >= CURDATE() - INTERVAL 6 DAY
         AND appointment_date < CURDATE() + INTERVAL 1 DAY
         AND status != 'cancelled'
       GROUP BY DATE(appointment_date)
       ORDER BY d`
    )

    const byDate = Object.fromEntries(
      rawTrend.map((r) => {
        const key = r.d instanceof Date
          ? r.d.toISOString().slice(0, 10)
          : String(r.d).slice(0, 10)
        return [key, Number(r.appointments)]
      })
    )

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const trend = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      trend.push({
        day: dayNames[d.getDay()],
        appointments: byDate[key] || 0,
      })
    }

    res.json({
      stats: { patients, doctors, appointmentsToday, pendingBills },
      trend,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to load dashboard stats' })
  }
})

export default router
