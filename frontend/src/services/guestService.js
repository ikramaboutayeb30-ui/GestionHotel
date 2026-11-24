import apiClient from './apiClient'

export async function getGuests(params) {
  const { data } = await apiClient.get('/guests', { params })
  return data
}

export async function getGuest(id) {
  const { data } = await apiClient.get(`/guests/${id}`)
  return data.data
}

export async function createGuest(payload) {
  const { data } = await apiClient.post('/guests', payload)
  return data.data
}

export async function updateGuest({ id, values }) {
  const { data } = await apiClient.put(`/guests/${id}`, values)
  return data.data
}

export async function deleteGuest(id) {
  const { data } = await apiClient.delete(`/guests/${id}`)
  return data
}

