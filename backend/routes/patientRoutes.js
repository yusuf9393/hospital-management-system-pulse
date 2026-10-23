import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  listPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
} from '../controllers/patientController.js'

const router = Router()

router.use(requireAuth) // every patient route needs a logged-in user

router.get('/', listPatients)
router.get('/:id', getPatient)
router.post('/', createPatient)
router.put('/:id', updatePatient)
router.delete('/:id', deletePatient)

export default router
