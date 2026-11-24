import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiErrorMessage } from '../../services/apiError'
import * as authService from '../../services/authService'

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await authService.login(credentials)
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Connexion impossible'))
  }
})

export const restoreUserSession = createAsyncThunk('auth/restoreSession', async (_, { rejectWithValue }) => {
  try {
    return await authService.restoreSession()
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Aucune session active'))
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout()
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Échec de la déconnexion'))
  }
})

const initialState = {
  user: null,
  authenticated: false,
  initialized: false,
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null
    },
    sessionRefreshed: (state, action) => {
      state.user = action.payload
      state.authenticated = true
      state.initialized = true
      state.status = 'authenticated'
      state.error = null
    },
    sessionExpired: (state) => {
      state.user = null
      state.authenticated = false
      state.initialized = true
      state.status = 'unauthenticated'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.authenticated = true
        state.initialized = true
        state.status = 'authenticated'
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.user = null
        state.authenticated = false
        state.initialized = true
        state.status = 'unauthenticated'
        state.error = action.payload || 'Connexion impossible'
      })
      .addCase(restoreUserSession.pending, (state) => {
        state.status = 'checking'
      })
      .addCase(restoreUserSession.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.authenticated = true
        state.initialized = true
        state.status = 'authenticated'
        state.error = null
      })
      .addCase(restoreUserSession.rejected, (state) => {
        state.user = null
        state.authenticated = false
        state.initialized = true
        state.status = 'unauthenticated'
        state.error = null
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = 'signingOut'
      })
      .addCase(logoutUser.fulfilled, (state) => {
        Object.assign(state, { ...initialState, initialized: true, status: 'unauthenticated' })
      })
      .addCase(logoutUser.rejected, (state, action) => {
        Object.assign(state, {
          ...initialState,
          initialized: true,
          status: 'unauthenticated',
          error: action.payload || null,
        })
      })
  },
})

export const { clearAuthError, sessionExpired, sessionRefreshed } = authSlice.actions

export const selectAuth = (state) => state.auth
export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.authenticated
export const selectHasPermission = (permission) => (state) => {
  const user = state.auth.user
  return Boolean(
    user &&
      (user.role === 'ADMIN' || user.permissions?.includes('*') || user.permissions?.includes(permission)),
  )
}

export function userHasPermission(user, permission) {
  return Boolean(
    user &&
      (!permission ||
        user.role === 'ADMIN' ||
        user.permissions?.includes('*') ||
        user.permissions?.includes(permission)),
  )
}

export default authSlice.reducer
