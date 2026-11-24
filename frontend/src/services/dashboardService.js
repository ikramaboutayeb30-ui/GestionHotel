import apiClient from './apiClient'
export async function getDashboard() { return (await apiClient.get('/dashboard')).data.data }

