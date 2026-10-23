import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { getPatients, createPatient, updatePatient, deletePatient } from '../api/patients.js'
import Modal from '../components/Modal.jsx'
import { Field, inputClass } from '../components/FormField.jsx'

const emptyForm = {
  name: '', date_of_birth: '', gender: '', phone: '', email: '', address: '', blood_group: '', emergency_contact: '',
}

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await getPatients(search)
      setPatients(res.data.patients)
    } catch {
      setError('Could not load patients.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300) // debounce search
    return () => clearTimeout(t)
  }, [search])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  function openEdit(patient) {
    setEditing(patient)
    setForm({ ...emptyForm, ...patient, date_of_birth: patient.date_of_birth?.slice(0, 10) || '' })
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editing) {
        await updatePatient(editing.id, form)
      } else {
        await createPatient(form)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this patient record? This also removes their appointment history.')) return
    await deletePatient(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Patients</h1>
          <p className="text-ink/50 text-sm mt-1">{patients.length} on record</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} /> Add patient
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or email"
          className={`${inputClass} pl-9`}
        />
      </div>

      <div className="bg-card rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/50 border-b border-line">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Gender</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Blood group</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-ink/40">Loading…</td></tr>
            )}
            {!loading && patients.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-ink/40">No patients found.</td></tr>
            )}
            {patients.map((p, i) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="border-b border-line last:border-0 hover:bg-surface/60"
              >
                <td className="px-5 py-3 font-medium text-ink">{p.name}</td>
                <td className="px-5 py-3 text-ink/70 capitalize">{p.gender || '—'}</td>
                <td className="px-5 py-3 text-ink/70">{p.phone || '—'}</td>
                <td className="px-5 py-3 text-ink/70">{p.blood_group || '—'}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="text-ink/40 hover:text-primary mr-3">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-ink/40 hover:text-pulse">
                    <Trash2 size={16} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit patient' : 'Add patient'}>
        <form onSubmit={handleSubmit}>
          <Field label="Full name">
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date of birth">
              <input type="date" className={inputClass} value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
            </Field>
            <Field label="Gender">
              <select className={inputClass} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone">
              <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Blood group">
              <input className={inputClass} placeholder="e.g. O+" value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} />
            </Field>
          </div>
          <Field label="Email">
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Address">
            <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <Field label="Emergency contact">
            <input className={inputClass} value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} />
          </Field>

          {error && <p className="text-pulse text-sm mb-3">{error}</p>}

          <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors">
            {editing ? 'Save changes' : 'Add patient'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
