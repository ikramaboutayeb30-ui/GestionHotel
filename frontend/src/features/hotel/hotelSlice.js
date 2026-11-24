import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiErrorMessage } from '../../services/apiError'
import * as service from '../../services/hotelService'

export const fetchHotel = createAsyncThunk('hotel/fetch', async (_, { rejectWithValue }) => { try { return await service.getHotel() } catch (error) { return rejectWithValue(getApiErrorMessage(error)) } })
export const saveHotel = createAsyncThunk('hotel/save', async (values, { rejectWithValue }) => { try { return await service.updateHotel(values) } catch (error) { return rejectWithValue(getApiErrorMessage(error)) } })
const slice = createSlice({
  name: 'hotel', initialState: { data: null, loading: false, saving: false, error: null }, reducers: {},
  extraReducers: (builder) => builder
    .addCase(fetchHotel.pending, (s) => { s.loading = true; s.error = null }).addCase(fetchHotel.fulfilled, (s, a) => { s.loading = false; s.data = a.payload }).addCase(fetchHotel.rejected, (s, a) => { s.loading = false; s.error = a.payload })
    .addCase(saveHotel.pending, (s) => { s.saving = true; s.error = null }).addCase(saveHotel.fulfilled, (s, a) => { s.saving = false; s.data = a.payload }).addCase(saveHotel.rejected, (s, a) => { s.saving = false; s.error = a.payload }),
})
export default slice.reducer

