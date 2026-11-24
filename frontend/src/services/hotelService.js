import apiClient from './apiClient'
export async function getHotel() { return (await apiClient.get('/hotel')).data.data }
export async function updateHotel(values) { return (await apiClient.put('/hotel', values)).data.data }

