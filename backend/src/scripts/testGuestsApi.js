require('dotenv').config()

async function testGuestsApi() {
  const baseUrl = process.argv[2] || `http://127.0.0.1:${process.env.PORT || 5000}/api`
  const unique = Date.now()
  let accessToken
  let cookie
  let guestId

  const loginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }),
  })
  const loginBody = await loginResponse.json()
  if (!loginResponse.ok) throw new Error(`Login failed: ${loginResponse.status}`)
  accessToken = loginBody.accessToken
  cookie = loginResponse.headers.get('set-cookie')?.split(';')[0]

  const request = (path, options = {}) =>
    fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
        ...options.headers,
      },
    })

  try {
    const createResponse = await request('/guests', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'API',
        lastName: 'Test Guest',
        email: `guest-${unique}@example.test`,
        phone: `+212600${String(unique).slice(-6)}`,
        nationality: 'Moroccan',
      }),
    })
    const createBody = await createResponse.json()
    if (createResponse.status !== 201) throw new Error(`Create failed: ${createResponse.status}`)
    guestId = createBody.data.id

    const listResponse = await request(`/guests?search=${unique}&page=1&limit=10`)
    const listBody = await listResponse.json()
    if (!listResponse.ok || listBody.pagination.total < 1) {
      throw new Error(`List/search failed: ${listResponse.status}`)
    }

    const getResponse = await request(`/guests/${guestId}`)
    if (!getResponse.ok) throw new Error(`Get failed: ${getResponse.status}`)

    const updateResponse = await request(`/guests/${guestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ nationality: 'Moroccan / Test' }),
    })
    const updateBody = await updateResponse.json()
    if (!updateResponse.ok || updateBody.data.nationality !== 'Moroccan / Test') {
      throw new Error(`Update failed: ${updateResponse.status}`)
    }

    const deleteResponse = await request(`/guests/${guestId}`, { method: 'DELETE' })
    if (!deleteResponse.ok) throw new Error(`Delete failed: ${deleteResponse.status}`)
    guestId = null

    console.log(`Create: ${createResponse.status}`)
    console.log(`List/search: ${listResponse.status}`)
    console.log(`Get: ${getResponse.status}`)
    console.log(`Update: ${updateResponse.status}`)
    console.log(`Delete: ${deleteResponse.status}`)
  } finally {
    if (guestId) await request(`/guests/${guestId}`, { method: 'DELETE' })
    if (cookie) {
      await fetch(`${baseUrl}/auth/logout`, { method: 'POST', headers: { cookie } })
    }
  }
}

testGuestsApi().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})

