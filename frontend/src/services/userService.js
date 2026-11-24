import apiClient from './apiClient'
export async function getUsers(params) { return (await apiClient.get('/users', { params })).data.data }
export async function getPermissions() { return (await apiClient.get('/users/permissions')).data.data }
export async function createUser(values) { return (await apiClient.post('/users', values)).data.data }
export async function updateUser({ id, values }) { return (await apiClient.put(`/users/${id}`, values)).data.data }
export async function deactivateUser(id) { return (await apiClient.delete(`/users/${id}`)).data }

