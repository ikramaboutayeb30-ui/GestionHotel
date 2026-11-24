import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiErrorMessage } from '../../services/apiError'
import * as service from '../../services/requestService'

const makeThunk = (name, fn) => createAsyncThunk(`requests/${name}`, async (payload, { rejectWithValue }) => { try { return await fn(payload) } catch (error) { return rejectWithValue(getApiErrorMessage(error)) } })
export const fetchRequests = makeThunk('fetch', service.getRequests)
export const addRequest = makeThunk('add', service.createRequest)
export const editRequest = makeThunk('edit', service.updateRequest)
export const changeRequestStatus = makeThunk('status', service.setRequestStatus)
export const approveRequest = makeThunk('approve', service.approveRequest)
export const removeRequest = makeThunk('remove', async (id) => { await service.deleteRequest(id); return id })
const slice = createSlice({
  name: 'requests', initialState: { rows: [], total: 0, loading: false, submitting: false, error: null, mutationError: null }, reducers: { clearRequestError: (s) => { s.mutationError = null } },
  extraReducers: (b) => {
    b.addCase(fetchRequests.pending, (s) => { s.loading = true; s.error = null }).addCase(fetchRequests.fulfilled, (s, a) => { s.loading = false; s.rows = a.payload.data; s.total = a.payload.pagination.total }).addCase(fetchRequests.rejected, (s, a) => { s.loading = false; s.error = a.payload })
    for (const action of [addRequest, editRequest, changeRequestStatus, approveRequest, removeRequest]) b.addCase(action.pending, pending).addCase(action.rejected, rejected)
    b.addCase(addRequest.fulfilled, upsert).addCase(editRequest.fulfilled, upsert).addCase(changeRequestStatus.fulfilled, upsert)
      .addCase(approveRequest.fulfilled, (s, a) => { s.submitting = false; s.rows = s.rows.map((x) => x.id === a.meta.arg.id ? { ...x, status: 'CONVERTED' } : x) })
      .addCase(removeRequest.fulfilled, (s, a) => { s.submitting = false; s.rows = s.rows.filter((x) => x.id !== a.payload); s.total -= 1 })
  },
})
function pending(s) { s.submitting = true; s.mutationError = null }
function rejected(s, a) { s.submitting = false; s.mutationError = a.payload }
function upsert(s, a) { s.submitting = false; const i = s.rows.findIndex((x) => x.id === a.payload.id); if (i >= 0) s.rows[i] = a.payload; else { s.rows.unshift(a.payload); s.total += 1 } }
export const { clearRequestError } = slice.actions
export default slice.reducer

