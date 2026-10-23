import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Stethoscope, CalendarClock, Receipt, RefreshCw } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'

const fallbackTrend = [
  { day: 'Mon', appointments: 0 },
  { day: 'Tue', appointments: 0 },
  { day: 'Wed', appointments: 0 },
  { day: 'Thu', appointments: 0 },
  { day: 'Fri', appointments: 0 },
  { day: 'Sat', appointments: 0 },
  { day: 'Sun', appointments: 0 },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [trend, setTrend] = useState(fallbackTrend)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const res = await api.get('/dashboard/stats')
      setStats(res.data.stats)
      if (Array.isArray(res.data.trend) && res.data.trend.length) {
        setTrend(res.data.trend)
      }
    } catch {
      setError('Could not load live stats. Showing placeholders.')
      setStats({ patients: 0, doctors: 0, appointmentsToday: 0, pendingBills: 0 })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Load on mount and whenever the user returns to this tab / page
  useEffect(() => {
    load()
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [load])

  const cards = [
    { label: 'Total Patients', value: stats?.patients ?? '—', icon: Users, accent: 'text-primary' },
    { label: 'Active Doctors', value: stats?.doctors ?? '—', icon: Stethoscope, accent: 'text-primary' },
    { label: "Today's Appointments", value: stats?.appointmentsToday ?? '—', icon: CalendarClock, accent: 'text-amber' },
    { label: 'Pending Bills', value: stats?.pendingBills ?? '—', icon: Receipt, accent: 'text-pulse' },
  ]

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Good to see you, {user?.name?.split(' ')[0] || 'there'}.
          </h1>
          <p className="text-ink/50 text-sm mt-1">Here's what's happening across the hospital today.</p>
          {error && <p className="text-pulse text-xs mt-1">{error}</p>}
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 text-sm text-ink/60 hover:text-primary border border-line bg-card px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh stats"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {cards.map(({ label, value, icon: Icon, accent }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="bg-card rounded-xl border border-line p-5"
          >
            <Icon className={accent} size={20} />
            <p className="text-2xl font-semibold text-ink mt-3">
              {loading && value === '—' ? '…' : value}
            </p>
            <p className="text-ink/50 text-sm">{label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="bg-card rounded-xl border border-line p-6 mt-6"
      >
        <h2 className="font-medium text-ink mb-4">Appointments this week</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trend}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F6E6A" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#0F6E6A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#0B1E2D80' }} />
            <YAxis hide />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8E7' }} />
            <Area type="monotone" dataKey="appointments" stroke="#0F6E6A" strokeWidth={2} fill="url(#trendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
