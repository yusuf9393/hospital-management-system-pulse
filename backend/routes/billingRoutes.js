import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  listBills,
  createBill,
  markBillPaid,
  cancelBill,
  deleteBill,
} from '../controllers/billingController.js'

const router = Router()

router.use(requireAuth)

router.get('/', listBills)
router.post('/', createBill)
router.patch('/:id/paid', markBillPaid)
router.patch('/:id/cancel', cancelBill)
router.delete('/:id', deleteBill)

export default router
