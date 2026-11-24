import apiClient from './apiClient'
export async function getPayments(params) { return (await apiClient.get('/payments', { params })).data }
export async function createPayment(values) { return (await apiClient.post('/payments', values)).data.data }
export async function updatePayment({ id, values }) { return (await apiClient.put(`/payments/${id}`, values)).data.data }
export async function refundPayment({ id, amount, notes }) { return (await apiClient.post(`/payments/${id}/refund`, { amount, notes })).data.data }
export async function deletePayment(id) { return (await apiClient.delete(`/payments/${id}`)).data }

