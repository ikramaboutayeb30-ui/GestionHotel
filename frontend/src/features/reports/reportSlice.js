import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiErrorMessage } from '../../services/apiError'
import { getReport } from '../../services/reportService'

export const fetchReport = createAsyncThunk('reports/fetch', async (params, { rejectWithValue }) => {
  try { return await getReport(params) } catch (error) { return rejectWithValue(getApiErrorMessage(error, 'Impossible de générer le rapport')) }
})

const slice = createSlice({
  name: 'reports', initialState: { data: null, loading: false, error: null }, reducers: {},
  extraReducers: (builder) => builder
    .addCase(fetchReport.pending, (state) => { state.loading = true; state.error = null })
    .addCase(fetchReport.fulfilled, (state, action) => { state.loading = false; state.data = action.payload })
    .addCase(fetchReport.rejected, (state, action) => { state.loading = false; state.error = action.payload }),
})
export default slice.reducer
