import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiErrorMessage } from '../../services/apiError'
import * as service from '../../services/reservationService'

const makeThunk = (name, fn) => createAsyncThunk(`reservations/${name}`, async (payload, { rejectWithValue }) => { try { return await fn(payload) } catch (error) { return rejectWithValue(getApiErrorMessage(error)) } })
export const fetchReservations = makeThunk('fetch', service.getReservations)
export const addReservation = makeThunk('add', service.createReservation)
export const editReservation = makeThunk('edit', service.updateReservation)
export const setReservationStatus = makeThunk('status', service.changeReservationStatus)
export const removeReservation = makeThunk('remove', async (id) => { await service.deleteReservation(id); return id })
const slice = createSlice({
  name: 'reservations', initialState: { rows: [], total: 0, loading: false, submitting: false, error: null, mutationError: null }, reducers: { clearReservationError: (s) => { s.mutationError = null } },
  extraReducers: (b) => {
    b.addCase(fetchReservations.pending, (s) => { s.loading = true; s.error = null }).addCase(fetchReservations.fulfilled, (s, a) => { s.loading = false; s.rows = a.payload.data; s.total = a.payload.pagination.total }).addCase(fetchReservations.rejected, (s, a) => { s.loading = false; s.error = a.payload })
    for (const action of [addReservation, editReservation, setReservationStatus, removeReservation]) b.addCase(action.pending, (s) => { s.submitting = true; s.mutationError = null }).addCase(action.rejected, (s, a) => { s.submitting = false; s.mutationError = a.payload })
    b.addCase(addReservation.fulfilled, success).addCase(editReservation.fulfilled, success).addCase(setReservationStatus.fulfilled, success)
      .addCase(removeReservation.fulfilled, (s, a) => { s.submitting = false; s.rows = s.rows.filter((x) => x.id !== a.payload); s.total -= 1 })
  },
})
function success(s, a) { s.submitting = false; const i = s.rows.findIndex((x) => x.id === a.payload.id); if (i >= 0) s.rows[i] = a.payload; else { s.rows.unshift(a.payload); s.total += 1 } }
export const { clearReservationError } = slice.actions
export default slice.reducer

