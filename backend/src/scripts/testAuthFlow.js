require('dotenv').config()

async function testAuthFlow() {
  const baseUrl = process.argv[2] || `http://127.0.0.1:${process.env.PORT || 5000}/api`

  const healthResponse = await fetch(`${baseUrl}/health`)
  if (!healthResponse.ok) {
    throw new Error(`Health check failed with status ${healthResponse.status}`)
  }

  const loginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    }),
  })
  const loginBody = await loginResponse.json()
  if (!loginResponse.ok || !loginBody.accessToken) {
    throw new Error(`Login failed with status ${loginResponse.status}`)
  }

  const loginCookie = loginResponse.headers.get('set-cookie')?.split(';')[0]
  const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: loginCookie ? { cookie: loginCookie } : {},
  })
  const refreshBody = await refreshResponse.json()
  if (!refreshResponse.ok || !refreshBody.accessToken) {
    throw new Error(`Session refresh failed with status ${refreshResponse.status}`)
  }

  const refreshedCookie = refreshResponse.headers.get('set-cookie')?.split(';')[0]
  const logoutResponse = await fetch(`${baseUrl}/auth/logout`, {
    method: 'POST',
    headers: refreshedCookie ? { cookie: refreshedCookie } : {},
  })
  if (!logoutResponse.ok) {
    throw new Error(`Logout failed with status ${logoutResponse.status}`)
  }

  console.log(`Health: ${healthResponse.status}`)
  console.log(`Login: ${loginResponse.status} (${loginBody.user.role}, ${loginBody.user.permissions[0]})`)
  console.log(`Refresh: ${refreshResponse.status} (token rotated)`)
  console.log(`Logout: ${logoutResponse.status}`)
}

testAuthFlow().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
