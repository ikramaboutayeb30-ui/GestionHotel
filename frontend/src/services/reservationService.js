import apiClient from './apiClient'
export async function getReservations(params) { return (await apiClient.get('/reservations', { params })).data }
export async function getReservation(id) { return (await apiClient.get(`/reservations/${id}`)).data.data }
export async function createReservation(values) { return (await apiClient.post('/reservations', values)).data.data }
export async function updateReservation({ id, values }) { return (await apiClient.put(`/reservations/${id}`, values)).data.data }
export async function changeReservationStatus({ id, status, reason }) { return (await apiClient.patch(`/reservations/${id}/status`, { status, reason })).data.data }
export async function deleteReservation(id) { return (await apiClient.delete(`/reservations/${id}`)).data }
export async function getAvailability(params) { return (await apiClient.get('/reservations/availability', { params })).data.data }

