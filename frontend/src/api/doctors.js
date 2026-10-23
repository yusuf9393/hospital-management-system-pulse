import api from './axios.js'

export const getDoctors = (specialization = '') => api.get('/doctors', { params: { specialization } })
export const getDoctor = (id) => api.get(`/doctors/${id}`)
export const createDoctor = (data) => api.post('/doctors', data)
export const updateDoctor = (id, data) => api.put(`/doctors/${id}`, data)
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`)
