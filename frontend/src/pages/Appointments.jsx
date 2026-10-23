import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, CalendarClock, Check, X as XIcon, Ban } from 'lucide-react'
import { getAppointments, createAppointment, updateAppointmentStatus } from '../api/appointments.js'
import { getPatients } from '../api/patients.js'
import { getDoctors } from '../api/doctors.js'
import Modal from '../components/Modal.jsx'
import { Field, inputClass } from '../components/FormField.jsx'

const emptyForm = { patient_id: '', doctor_id: '', appointment_date: '', reason: '' }

const statusStyle = {
  scheduled: 'bg-primary/10 text-primary',
  completed: 'bg-primary-dark/10 text-primary-dark',
  cancelled: 'bg-pulse/10 text-pulse',
  no_show: 'bg-amber/10 text-amber',
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await getAppointments(statusFilter ? { status: statusFilter } : {})
      setAppointments(res.data.appointments)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  async function openCreate() {
    setError('')
    setForm(emptyForm)
    if (!patients.length) {
      const [pRes, dRes] = await Promise.all([getPatients(), getDoctors()])
      setPatients(pRes.data.patients)
      // Only offer active doctors for new bookings
      setDoctors((dRes.data.doctors || []).filter((d) => d.status === 'active'))
    }
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await createAppointment(form)
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not book appointment')
    }
  }

  async function setStatus(id, status) {
    await updateAppointmentStatus(id, status)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Appointments</h1>
          <p className="text-ink/50 text-sm mt-1">{appointments.length} shown</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} /> Book appointment
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['', 'scheduled', 'completed', 'cancelled', 'no_show'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-colors ${
              statusFilter === s ? 'bg-ink text-surface' : 'bg-card border border-line text-ink/60'
            }`}
          >
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/50 border-b border-line">
              <th className="px-5 py-3 font-medium">Patient</th>
              <th className="px-5 py-3 font-medium">Doctor</th>
              <th className="px-5 py-3 font-medium">Date & time</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-5 py-8 text-center text-ink/40">Loading…</td></tr>}
            {!loading && appointments.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-ink/40">No appointments found.</td></tr>
            )}
            {appointments.map((a, i) => (
              <motion.tr
                key={a.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="border-b border-line last:border-0 hover:bg-surface/60"
              >
                <td className="px-5 py-3 font-medium text-ink">{a.patient_name}</td>
                <td className="px-5 py-3 text-ink/70">{a.doctor_name}</td>
                <td className="px-5 py-3 text-ink/70">
                  <span className="flex items-center gap-1.5">
                    <CalendarClock size={14} className="text-ink/30" />
                    {new Date(a.appointment_date).toLocaleString()}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusStyle[a.status]}`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  {a.status === 'scheduled' && (
                    <>
                      <button onClick={() => setStatus(a.id, 'completed')} title="Mark completed" className="text-ink/40 hover:text-primary mr-2">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setStatus(a.id, 'no_show')} title="No-show" className="text-ink/40 hover:text-amber mr-2">
                        <Ban size={16} />
                      </button>
                      <button onClick={() => setStatus(a.id, 'cancelled')} title="Cancel" className="text-ink/40 hover:text-pulse">
                        <XIcon size={16} />
                      </button>
                    </>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Book appointment">
        <form onSubmit={handleSubmit}>
          <Field label="Patient">
            <select required className={inputClass} value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Doctor">
            <select required className={inputClass} value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}>
              <option value="">Select doctor</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
            </select>
          </Field>
          <Field label="Date & time">
            <input type="datetime-local" required className={inputClass} value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} />
          </Field>
          <Field label="Reason for visit">
            <input className={inputClass} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </Field>

          {error && <p className="text-pulse text-sm mb-3">{error}</p>}

          <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors">
            Book appointment
          </button>
        </form>
      </Modal>
    </div>
  )
}
