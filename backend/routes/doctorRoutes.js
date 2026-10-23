import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import {
  listDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController.js'

const router = Router()

router.use(requireAuth)

router.get('/', listDoctors)
router.get('/:id', getDoctor)
router.post('/', requireRole('admin'), createDoctor)
router.put('/:id', requireRole('admin'), updateDoctor)
router.delete('/:id', requireRole('admin'), deleteDoctor)

export default router
