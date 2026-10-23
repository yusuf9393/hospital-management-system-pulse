import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Stethoscope } from 'lucide-react'
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../api/doctors.js'
import { useAuth } from '../context/AuthContext.jsx'
import Modal from '../components/Modal.jsx'
import { Field, inputClass } from '../components/FormField.jsx'

const emptyForm = { name: '', specialization: '', phone: '', email: '', consultation_fee: '', status: 'active' }

export default function Doctors() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await getDoctors()
      setDoctors(res.data.doctors)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  function openEdit(doc) {
    setEditing(doc)
    setForm({ ...emptyForm, ...doc })
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editing) await updateDoctor(editing.id, form)
      else await createDoctor(form)
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this doctor from the roster?')) return
    await deleteDoctor(id)
    load()
  }

  const statusColor = { active: 'bg-primary/10 text-primary', on_leave: 'bg-amber/10 text-amber', inactive: 'bg-ink/10 text-ink/50' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Doctors</h1>
          <p className="text-ink/50 text-sm mt-1">{doctors.length} on the roster</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add doctor
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <p className="text-ink/40 text-sm">Loading…</p>}
        {!loading && doctors.length === 0 && <p className="text-ink/40 text-sm">No doctors added yet.</p>}
        {doctors.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-card rounded-xl border border-line p-5"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Stethoscope className="text-primary" size={18} />
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor[d.status]}`}>
                {d.status?.replace('_', ' ')}
              </span>
            </div>
            <h3 className="font-medium text-ink mt-3">{d.name}</h3>
            <p className="text-ink/50 text-sm">{d.specialization}</p>
            <p className="text-ink/50 text-sm mt-2">{d.phone || 'No phone on file'}</p>
            <p className="text-ink font-medium text-sm mt-1">₹{Number(d.consultation_fee).toFixed(0)} / consult</p>

            {isAdmin && (
              <div className="flex gap-3 mt-4 pt-3 border-t border-line">
                <button onClick={() => openEdit(d)} className="text-ink/50 hover:text-primary text-sm flex items-center gap-1">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(d.id)} className="text-ink/50 hover:text-pulse text-sm flex items-center gap-1">
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit doctor' : 'Add doctor'}>
        <form onSubmit={handleSubmit}>
          <Field label="Full name">
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Specialization">
            <input required className={inputClass} placeholder="e.g. Cardiology" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone">
              <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Consultation fee (₹)">
              <input type="number" min="0" className={inputClass} value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} />
            </Field>
          </div>
          <Field label="Email">
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="on_leave">On leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>

          {error && <p className="text-pulse text-sm mb-3">{error}</p>}

          <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors">
            {editing ? 'Save changes' : 'Add doctor'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
