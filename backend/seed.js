// Creates the first admin login. Run once after `npm install`:
//   node seed.js
// Edit the values below first if you want a different name/email/password.
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import pool from './config/db.js'

dotenv.config()

const ADMIN = {
  name: 'System Admin',
  email: 'admin@pulse.com',
  password: 'Admin@123', // change this after first login
  role: 'admin',
}

async function seed() {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [ADMIN.email])
  if (existing.length) {
    console.log('Admin already exists — nothing to do.')
    process.exit(0)
  }

  const password_hash = await bcrypt.hash(ADMIN.password, 10)
  await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [ADMIN.name, ADMIN.email, password_hash, ADMIN.role]
  )

  console.log(`Admin created: ${ADMIN.email} / ${ADMIN.password}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
