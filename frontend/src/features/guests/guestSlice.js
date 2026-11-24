import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiErrorMessage } from '../../services/apiError'
import * as guestService from '../../services/guestService'

export const fetchGuests = createAsyncThunk('guests/fetchAll', async (params, { rejectWithValue }) => {
  try {
    return await guestService.getGuests(params)
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Impossible de charger les clients'))
  }
})

export const createGuest = createAsyncThunk('guests/create', async (values, { rejectWithValue }) => {
  try {
    return await guestService.createGuest(values)
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Impossible de créer le client'))
  }
})

export const updateGuest = createAsyncThunk('guests/update', async (payload, { rejectWithValue }) => {
  try {
    return await guestService.updateGuest(payload)
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Impossible de modifier le client'))
  }
})

export const deleteGuest = createAsyncThunk('guests/delete', async (id, { rejectWithValue }) => {
  try {
    await guestService.deleteGuest(id)
    return id
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Impossible de supprimer le client'))
  }
})

const guestSlice = createSlice({
  name: 'guests',
  initialState: {
    rows: [],
    total: 0,
    loading: false,
    submitting: false,
    error: null,
    mutationError: null,
  },
  reducers: {
    clearGuestMutationError: (state) => {
      state.mutationError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.loading = false
        state.rows = action.payload.data
        state.total = action.payload.pagination.total
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Impossible de charger les clients'
      })
      .addCase(createGuest.pending, mutationPending)
      .addCase(createGuest.fulfilled, (state, action) => {
        state.submitting = false
        state.rows.unshift(action.payload)
        state.total += 1
      })
      .addCase(createGuest.rejected, mutationRejected)
      .addCase(updateGuest.pending, mutationPending)
      .addCase(updateGuest.fulfilled, (state, action) => {
        state.submitting = false
        const index = state.rows.findIndex((guest) => guest.id === action.payload.id)
        if (index !== -1) state.rows[index] = action.payload
      })
      .addCase(updateGuest.rejected, mutationRejected)
      .addCase(deleteGuest.pending, mutationPending)
      .addCase(deleteGuest.fulfilled, (state, action) => {
        state.submitting = false
        state.rows = state.rows.filter((guest) => guest.id !== action.payload)
        state.total = Math.max(0, state.total - 1)
      })
      .addCase(deleteGuest.rejected, mutationRejected)
  },
})

function mutationPending(state) {
  state.submitting = true
  state.mutationError = null
}

function mutationRejected(state, action) {
  state.submitting = false
  state.mutationError = action.payload || 'L’opération n’a pas pu être effectuée'
}

export const { clearGuestMutationError } = guestSlice.actions
export default guestSlice.reducer
