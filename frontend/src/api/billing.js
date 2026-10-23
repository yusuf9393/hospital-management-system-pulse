import api from './axios.js'

export const getBills = (params = {}) => api.get('/billing', { params })
export const createBill = (data) => api.post('/billing', data)
export const markBillPaid = (id) => api.patch(`/billing/${id}/paid`)
export const cancelBill = (id) => api.patch(`/billing/${id}/cancel`)
export const deleteBill = (id) => api.delete(`/billing/${id}`)
