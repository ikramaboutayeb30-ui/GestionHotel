import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

const sessionClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

let accessToken = null
let refreshPromise = null
let authHandlers = {
  onSessionExpired: () => {},
  onSessionRefreshed: () => {},
}

export function setAccessToken(token) {
  accessToken = token || null
}

export function configureAuthHandlers(handlers) {
  authHandlers = { ...authHandlers, ...handlers }
}

export async function refreshSession() {
  const { data } = await sessionClient.post('/auth/refresh')
  setAccessToken(data.accessToken)
  return data
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isAuthEndpoint = originalRequest?.url?.startsWith('/auth/')

    if (error.response?.status !== 401 || originalRequest?._retry || isAuthEndpoint) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = refreshSession()
          .then((session) => {
            authHandlers.onSessionRefreshed(session)
            return session.accessToken
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      const token = await refreshPromise
      originalRequest.headers.Authorization = `Bearer ${token}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      setAccessToken(null)
      authHandlers.onSessionExpired()
      return Promise.reject(refreshError)
    }
  },
)

export default apiClient

