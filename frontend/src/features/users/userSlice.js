import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiErrorMessage } from '../../services/apiError'
import * as service from '../../services/userService'

const makeThunk = (name, fn) => createAsyncThunk(`users/${name}`, async (payload, { rejectWithValue }) => { try { return await fn(payload) } catch (error) { return rejectWithValue(getApiErrorMessage(error)) } })
export const fetchUsers = makeThunk('fetch', service.getUsers)
export const fetchPermissions = makeThunk('permissions', service.getPermissions)
export const addUser = makeThunk('add', service.createUser)
export const editUser = makeThunk('edit', service.updateUser)
export const deactivateUser = makeThunk('deactivate', async (id) => { await service.deactivateUser(id); return id })
const slice = createSlice({
  name: 'users', initialState: { rows: [], permissions: [], loading: false, submitting: false, error: null, mutationError: null }, reducers: { clearUserError: (s) => { s.mutationError = null } },
  extraReducers: (b) => {
    for (const action of [fetchUsers, fetchPermissions]) b.addCase(action.pending, (s) => { s.loading = true; s.error = null }).addCase(action.rejected, (s, a) => { s.loading = false; s.error = a.payload })
    b.addCase(fetchUsers.fulfilled, (s, a) => { s.loading = false; s.rows = a.payload }).addCase(fetchPermissions.fulfilled, (s, a) => { s.loading = false; s.permissions = a.payload })
    for (const action of [addUser, editUser, deactivateUser]) b.addCase(action.pending, (s) => { s.submitting = true; s.mutationError = null }).addCase(action.rejected, (s, a) => { s.submitting = false; s.mutationError = a.payload })
    b.addCase(addUser.fulfilled, upsert).addCase(editUser.fulfilled, upsert).addCase(deactivateUser.fulfilled, (s, a) => { s.submitting = false; const row = s.rows.find((x) => x.id === a.payload); if (row) row.status = 'INACTIVE' })
  },
})
function upsert(s, a) { s.submitting = false; const i = s.rows.findIndex((x) => x.id === a.payload.id); if (i >= 0) s.rows[i] = a.payload; else s.rows.push(a.payload) }
export const { clearUserError } = slice.actions
export default slice.reducer

