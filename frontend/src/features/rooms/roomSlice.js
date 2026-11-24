import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiErrorMessage } from '../../services/apiError'
import * as service from '../../services/roomService'

const thunk = (name, fn) => createAsyncThunk(`rooms/${name}`, async (payload, { rejectWithValue }) => { try { return await fn(payload) } catch (error) { return rejectWithValue(getApiErrorMessage(error)) } })
export const fetchRoomTypes = thunk('fetchTypes', service.getRoomTypes)
export const addRoomType = thunk('addType', service.createRoomType)
export const editRoomType = thunk('editType', service.updateRoomType)
export const removeRoomType = thunk('removeType', async (id) => { await service.deleteRoomType(id); return id })
export const fetchRooms = thunk('fetchRooms', service.getRooms)
export const addRoom = thunk('addRoom', service.createRoom)
export const editRoom = thunk('editRoom', service.updateRoom)
export const removeRoom = thunk('removeRoom', async (id) => { await service.deleteRoom(id); return id })

const slice = createSlice({
  name: 'rooms', initialState: { roomTypes: [], rooms: [], total: 0, loading: false, submitting: false, error: null, mutationError: null },
  reducers: { clearRoomError: (s) => { s.mutationError = null } },
  extraReducers: (builder) => {
    for (const action of [fetchRoomTypes, fetchRooms]) {
      builder.addCase(action.pending, (s) => { s.loading = true; s.error = null }).addCase(action.rejected, (s, a) => { s.loading = false; s.error = a.payload })
    }
    builder.addCase(fetchRoomTypes.fulfilled, (s, a) => { s.loading = false; s.roomTypes = a.payload })
      .addCase(fetchRooms.fulfilled, (s, a) => { s.loading = false; s.rooms = a.payload.data; s.total = a.payload.pagination.total })
    for (const action of [addRoomType, editRoomType, removeRoomType, addRoom, editRoom, removeRoom]) {
      builder.addCase(action.pending, (s) => { s.submitting = true; s.mutationError = null }).addCase(action.rejected, (s, a) => { s.submitting = false; s.mutationError = a.payload })
    }
    builder.addCase(addRoomType.fulfilled, (s, a) => { s.submitting = false; s.roomTypes.push(a.payload) })
      .addCase(editRoomType.fulfilled, (s, a) => { s.submitting = false; const i = s.roomTypes.findIndex((x) => x.id === a.payload.id); if (i >= 0) s.roomTypes[i] = a.payload })
      .addCase(removeRoomType.fulfilled, (s, a) => { s.submitting = false; s.roomTypes = s.roomTypes.filter((x) => x.id !== a.payload) })
      .addCase(addRoom.fulfilled, (s, a) => { s.submitting = false; s.rooms.unshift(a.payload); s.total += 1 })
      .addCase(editRoom.fulfilled, (s, a) => { s.submitting = false; const i = s.rooms.findIndex((x) => x.id === a.payload.id); if (i >= 0) s.rooms[i] = a.payload })
      .addCase(removeRoom.fulfilled, (s, a) => { s.submitting = false; s.rooms = s.rooms.filter((x) => x.id !== a.payload); s.total -= 1 })
  },
})
export const { clearRoomError } = slice.actions
export default slice.reducer

