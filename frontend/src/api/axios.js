import axios from 'axios'

// VITE_API_URL lets the frontend point at a backend on a different domain
// (e.g. Vercel frontend + Render backend). Leave unset when frontend and
// backend share an origin (Docker/nginx setup, or the Vite dev proxy).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

// Attach the stored JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pulse_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If the token is rejected, clear it and bounce to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pulse_token')
      localStorage.removeItem('pulse_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
