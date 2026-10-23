import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      // error already surfaced via context
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface">
      {/* Left: brand + EKG signature line */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-surface p-12 relative overflow-hidden">
        <div className="relative z-10">
          <span className="font-display text-2xl font-semibold">Pulse</span>
          <p className="text-surface/50 text-sm mt-1">Hospital Management System</p>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-4xl leading-tight max-w-md">
            Every vital sign,<br />one steady line.
          </h1>
          <p className="text-surface/50 mt-4 max-w-sm text-sm">
            Patients, doctors, appointments and billing — kept in rhythm.
          </p>
        </div>

        {/* Animated EKG trace, drawn once on load then loops faintly */}
        <svg
          className="absolute bottom-0 left-0 w-full h-40 opacity-70"
          viewBox="0 0 800 160"
          fill="none"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0 90 L140 90 L165 40 L195 130 L225 90 L340 90 L365 60 L395 110 L425 90 L800 90"
            stroke="#FF5D5D"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
          />
        </svg>
      </div>

      {/* Right: login form */}
      <div className="flex items-center justify-center p-8">
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm"
        >
          <h2 className="font-display text-2xl font-semibold text-ink mb-1">Welcome back</h2>
          <p className="text-ink/50 text-sm mb-8">Sign in to your Pulse account.</p>

          <label className="block text-sm font-medium text-ink/70 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-line bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary mb-4"
            placeholder="you@hospital.com"
          />

          <label className="block text-sm font-medium text-ink/70 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-line bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary mb-2"
            placeholder="••••••••"
          />

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-pulse text-sm mt-2"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  )
}
