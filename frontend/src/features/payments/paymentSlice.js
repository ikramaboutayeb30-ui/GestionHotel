import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiErrorMessage } from '../../services/apiError'
import * as service from '../../services/paymentService'

const makeThunk = (name, fn) => createAsyncThunk(`payments/${name}`, async (payload, { rejectWithValue }) => { try { return await fn(payload) } catch (error) { return rejectWithValue(getApiErrorMessage(error)) } })
export const fetchPayments = makeThunk('fetch', service.getPayments)
export const addPayment = makeThunk('add', service.createPayment)
export const editPayment = makeThunk('edit', service.updatePayment)
export const refundPayment = makeThunk('refund', service.refundPayment)
export const removePayment = makeThunk('remove', async (id) => { await service.deletePayment(id); return id })
const slice = createSlice({
  name: 'payments', initialState: { rows: [], total: 0, loading: false, submitting: false, error: null, mutationError: null }, reducers: { clearPaymentError: (s) => { s.mutationError = null } },
  extraReducers: (b) => {
    b.addCase(fetchPayments.pending, (s) => { s.loading = true; s.error = null }).addCase(fetchPayments.fulfilled, (s, a) => { s.loading = false; s.rows = a.payload.data; s.total = a.payload.pagination.total }).addCase(fetchPayments.rejected, (s, a) => { s.loading = false; s.error = a.payload })
    for (const action of [addPayment, editPayment, refundPayment, removePayment]) b.addCase(action.pending, pending).addCase(action.rejected, rejected)
    b.addCase(addPayment.fulfilled, upsert).addCase(editPayment.fulfilled, upsert).addCase(refundPayment.fulfilled, (s, a) => { s.submitting = false; s.rows.unshift(a.payload); s.total += 1 })
      .addCase(removePayment.fulfilled, (s, a) => { s.submitting = false; s.rows = s.rows.filter((x) => x.id !== a.payload); s.total -= 1 })
  },
})
function pending(s) { s.submitting = true; s.mutationError = null }
function rejected(s, a) { s.submitting = false; s.mutationError = a.payload }
function upsert(s, a) { s.submitting = false; const i = s.rows.findIndex((x) => x.id === a.payload.id); if (i >= 0) s.rows[i] = a.payload; else { s.rows.unshift(a.payload); s.total += 1 } }
export const { clearPaymentError } = slice.actions
export default slice.reducer

