import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiErrorMessage } from '../../services/apiError'
import { getDashboard } from '../../services/dashboardService'

export const fetchDashboard = createAsyncThunk('dashboard/fetch', async (_, { rejectWithValue }) => {
  try { return await getDashboard() } catch (error) { return rejectWithValue(getApiErrorMessage(error, 'Impossible de charger le tableau de bord')) }
})

const slice = createSlice({
  name: 'dashboard', initialState: { data: null, loading: false, error: null }, reducers: {},
  extraReducers: (builder) => builder
    .addCase(fetchDashboard.pending, (state) => { state.loading = true; state.error = null })
    .addCase(fetchDashboard.fulfilled, (state, action) => { state.loading = false; state.data = action.payload })
    .addCase(fetchDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload }),
})
export default slice.reducer

