require('dotenv').config()

const {
  AuditLog, Guest, Payment, Reservation, ReservationRequest, ReservationStatusHistory,
  Room, RoomType, sequelize,
} = require('../models')

const baseUrl = `http://127.0.0.1:${process.env.PORT || 5000}/api`
let token
const created = {}

async function api(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${path}: ${response.status} ${body.message || ''}`)
  return body
}

function futureDate(days) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

async function run() {
  const login = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }) })
  token = login.accessToken
  if (!token) throw new Error('La connexion n’a pas renvoyé de jeton')

  await Promise.all([api('/dashboard'), api('/hotel'), api('/users'), api('/users/permissions'), api(`/reports/summary?from=${futureDate(-30)}&to=${futureDate(1)}`)])

  const suffix = Date.now().toString().slice(-7)
  const roomType = await api('/room-types', { method: 'POST', body: JSON.stringify({ name: `Test Suite ${suffix}`, description: 'Créée par le test automatisé', capacityAdults: 2, capacityChildren: 1, basePrice: 650, status: 'ACTIVE' }) })
  created.roomTypeId = roomType.data.id
  const room = await api('/rooms', { method: 'POST', body: JSON.stringify({ roomTypeId: created.roomTypeId, roomNumber: `T${suffix}`, floor: 'Test', operationalStatus: 'ACTIVE', housekeepingStatus: 'CLEAN' }) })
  created.roomId = room.data.id
  const guest = await api('/guests', { method: 'POST', body: JSON.stringify({ firstName: 'Client', lastName: `Test ${suffix}`, phone: '+212600000000', nationality: 'Marocaine', identificationType: 'National ID', identificationNumber: `TEST${suffix}` }) })
  created.guestId = guest.data.id

  const requestPayload = { guestId: created.guestId, roomTypeId: created.roomTypeId, arrivalDate: futureDate(30), departureDate: futureDate(32), adults: 2, children: 0, quotedAmount: 650, source: 'PHONE', specialRequests: 'Test automatisé' }
  const reservationRequest = await api('/requests', { method: 'POST', body: JSON.stringify(requestPayload) })
  created.requestId = reservationRequest.data.id
  await api(`/requests?search=${encodeURIComponent(reservationRequest.data.requestNumber)}`)
  const approved = await api(`/requests/${created.requestId}/approve`, { method: 'POST', body: JSON.stringify({ nightlyRate: 650, discountAmount: 50 }) })
  created.reservationId = approved.data.id

  await api(`/reservations?search=${encodeURIComponent(approved.data.confirmationNumber)}`)
  const availability = await api(`/reservations/availability?roomTypeId=${created.roomTypeId}&arrivalDate=${futureDate(30)}&departureDate=${futureDate(32)}`)
  if (availability.data.some((item) => String(item.id) === String(created.roomId))) throw new Error('Le contrôle de disponibilité n’exclut pas la chambre réservée')

  const payment = await api('/payments', { method: 'POST', body: JSON.stringify({ reservationId: created.reservationId, amount: 400, paymentMethod: 'CASH', paymentType: 'DEPOSIT', status: 'COMPLETED', notes: 'Test automatisé' }) })
  created.paymentId = payment.data.id
  const refund = await api(`/payments/${created.paymentId}/refund`, { method: 'POST', body: JSON.stringify({ amount: 100, notes: 'Test automatisé' }) })
  created.refundId = refund.data.id
  await Promise.all([api(`/payments?reservationId=${created.reservationId}`), api('/dashboard')])

  console.log('Parcours API complet validé : authentification, hôtel, utilisateurs, chambres, client, demande, réservation, disponibilité, paiement, remboursement, rapports et tableau de bord.')
}

async function cleanup() {
  try {
    if (created.reservationId) {
      await Payment.destroy({ where: { reservationId: created.reservationId } })
      await ReservationStatusHistory.destroy({ where: { reservationId: created.reservationId } })
      await Reservation.destroy({ where: { id: created.reservationId } })
    }
    if (created.requestId) await ReservationRequest.destroy({ where: { id: created.requestId } })
    if (created.roomId) await Room.destroy({ where: { id: created.roomId } })
    if (created.roomTypeId) await RoomType.destroy({ where: { id: created.roomTypeId } })
    if (created.guestId) await Guest.destroy({ where: { id: created.guestId } })
    await AuditLog.destroy({ where: { entityId: Object.values(created).map(String) } })
  } finally {
    await sequelize.close()
  }
}

run().catch((error) => { console.error(error.message); process.exitCode = 1 }).finally(cleanup)
