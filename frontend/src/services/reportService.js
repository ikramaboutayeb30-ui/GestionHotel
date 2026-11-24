import apiClient from './apiClient'

export async function getReport(params) {
  return (await apiClient.get('/reports/summary', { params })).data.data
}
