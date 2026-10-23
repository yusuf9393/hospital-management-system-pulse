import { Router } from 'express'
import { login, register, me } from '../controllers/authController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.post('/login', login)
// Registration is restricted to admins so random visitors cannot create accounts.
// First admin is created via: node seed.js
router.post('/register', requireAuth, requireRole('admin'), register)
router.get('/me', requireAuth, me)

export default router
