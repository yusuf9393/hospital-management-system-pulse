import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Check, Ban } from 'lucide-react'
import { getBills, createBill, markBillPaid, cancelBill } from '../api/billing.js'
import { getPatients } from '../api/patients.js'
import Modal from '../components/Modal.jsx'
import { Field, inputClass } from '../components/FormField.jsx'

const emptyForm = { patient_id: '', amount: '', description: '' }
const statusStyle = { pending: 'bg-amber/10 text-amber', paid: 'bg-primary/10 text-primary', cancelled: 'bg-pulse/10 text-pulse' }

export default function Billing() {
  const [bills, setBills] = useState([])
  const [patients, setPatients] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await getBills(statusFilter ? { status: statusFilter } : {})
      setBills(res.data.bills)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  const totalPending = bills.filter((b) => b.status === 'pending').reduce((sum, b) => sum + Number(b.amount), 0)

  async function openCreate() {
    setError('')
    setForm(emptyForm)
    if (!patients.length) {
      const res = await getPatients()
      setPatients(res.data.patients)
    }
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await createBill(form)
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create bill')
    }
  }

  async function handlePaid(id) {
    await markBillPaid(id)
    load()
  }

  async function handleCancel(id) {
    if (!confirm('Cancel this bill?')) return
    await cancelBill(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Billing</h1>
          <p className="text-ink/50 text-sm mt-1">₹{totalPending.toFixed(0)} pending across {bills.filter(b => b.status === 'pending').length} invoices</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} /> New invoice
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['', 'pending', 'paid', 'cancelled'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-colors ${
              statusFilter === s ? 'bg-ink text-surface' : 'bg-card border border-line text-ink/60'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/50 border-b border-line">
              <th className="px-5 py-3 font-medium">Patient</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Issued</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-5 py-8 text-center text-ink/40">Loading…</td></tr>}
            {!loading && bills.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-ink/40">No invoices found.</td></tr>
            )}
            {bills.map((b, i) => (
              <motion.tr
                key={b.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="border-b border-line last:border-0 hover:bg-surface/60"
              >
                <td className="px-5 py-3 font-medium text-ink">{b.patient_name}</td>
                <td className="px-5 py-3 text-ink/70">{b.description || '—'}</td>
                <td className="px-5 py-3 text-ink font-medium">₹{Number(b.amount).toFixed(0)}</td>
                <td className="px-5 py-3 text-ink/50">{new Date(b.issued_at).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusStyle[b.status]}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  {b.status === 'pending' && (
                    <>
                      <button onClick={() => handlePaid(b.id)} title="Mark paid" className="text-ink/40 hover:text-primary mr-2">
                        <Check size={16} />
                      </button>
                      <button onClick={() => handleCancel(b.id)} title="Cancel" className="text-ink/40 hover:text-pulse">
                        <Ban size={16} />
                      </button>
                    </>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New invoice">
        <form onSubmit={handleSubmit}>
          <Field label="Patient">
            <select required className={inputClass} value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Amount (₹)">
            <input type="number" min="0" step="0.01" required className={inputClass} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
          <Field label="Description">
            <input className={inputClass} placeholder="e.g. Consultation + lab tests" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>

          {error && <p className="text-pulse text-sm mb-3">{error}</p>}

          <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors">
            Create invoice
          </button>
        </form>
      </Modal>
    </div>
  )
}
