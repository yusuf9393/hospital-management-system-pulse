import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} from '../controllers/appointmentController.js'

const router = Router()

router.use(requireAuth)

router.get('/', listAppointments)
router.post('/', createAppointment)
router.put('/:id', updateAppointment)
router.patch('/:id/status', updateAppointmentStatus)
router.delete('/:id', deleteAppointment)

export default router
