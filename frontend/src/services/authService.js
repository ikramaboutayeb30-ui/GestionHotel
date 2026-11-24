import apiClient, { refreshSession, setAccessToken } from './apiClient'

export async function login(credentials) {
  const { data } = await apiClient.post('/auth/login', credentials)
  setAccessToken(data.accessToken)
  return data
}

export async function restoreSession() {
  return refreshSession()
}

export async function logout() {
  try {
    await apiClient.post('/auth/logout')
  } finally {
    setAccessToken(null)
  }
}

