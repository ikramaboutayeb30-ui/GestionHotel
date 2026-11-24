import apiClient from './apiClient'
export async function getRequests(params) { return (await apiClient.get('/requests', { params })).data }
export async function createRequest(values) { return (await apiClient.post('/requests', values)).data.data }
export async function updateRequest({ id, values }) { return (await apiClient.put(`/requests/${id}`, values)).data.data }
export async function setRequestStatus({ id, status, reason }) { return (await apiClient.patch(`/requests/${id}/status`, { status, reason })).data.data }
export async function approveRequest({ id, nightlyRate, discountAmount }) { return (await apiClient.post(`/requests/${id}/approve`, { nightlyRate, discountAmount })).data.data }
export async function deleteRequest(id) { return (await apiClient.delete(`/requests/${id}`)).data }

