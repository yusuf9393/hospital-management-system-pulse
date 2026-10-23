import api from './axios.js'

export const getAppointments = (params = {}) => api.get('/appointments', { params })
export const createAppointment = (data) => api.post('/appointments', data)
export const updateAppointment = (id, data) => api.put(`/appointments/${id}`, data)
export const updateAppointmentStatus = (id, status) => api.patch(`/appointments/${id}/status`, { status })
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`)
