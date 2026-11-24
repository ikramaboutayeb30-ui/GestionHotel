import apiClient from './apiClient'

export async function getRoomTypes(params) { return (await apiClient.get('/room-types', { params })).data.data }
export async function createRoomType(values) { return (await apiClient.post('/room-types', values)).data.data }
export async function updateRoomType({ id, values }) { return (await apiClient.put(`/room-types/${id}`, values)).data.data }
export async function deleteRoomType(id) { return (await apiClient.delete(`/room-types/${id}`)).data }
export async function getRooms(params) { return (await apiClient.get('/rooms', { params })).data }
export async function createRoom(values) { return (await apiClient.post('/rooms', values)).data.data }
export async function updateRoom({ id, values }) { return (await apiClient.patch(`/rooms/${id}`, values)).data.data }
export async function deleteRoom(id) { return (await apiClient.delete(`/rooms/${id}`)).data }

