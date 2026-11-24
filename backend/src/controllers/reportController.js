const { Op } = require('sequelize')

const { Payment, Reservation, Room } = require('../models')

function daysBetween(from, to) {
  return Math.max(1, Math.round((new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86400000) + 1)
}

async function getSummary(request, response, next) {
  try {
    const today = new Date()
    const defaultFrom = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)).toISOString().slice(0, 10)
    const defaultTo = today.toISOString().slice(0, 10)
    const from = request.query.from || defaultFrom
    const to = request.query.to || defaultTo
    if (from > to) return response.status(422).json({ message: 'La date de début doit précéder la date de fin' })

    const [payments, reservations, activeRooms] = await Promise.all([
      Payment.findAll({
        attributes: ['amount', 'paymentMethod', 'paymentType', 'status', 'paidAt'],
        where: { status: { [Op.in]: ['COMPLETED', 'REFUNDED'] }, paidAt: { [Op.between]: [new Date(`${from}T00:00:00`), new Date(`${to}T23:59:59`)] } },
        raw: true,
      }),
      Reservation.findAll({
        attributes: ['arrivalDate', 'departureDate', 'status', 'totalAmount'],
        where: { arrivalDate: { [Op.lte]: to }, departureDate: { [Op.gt]: from } },
        raw: true,
      }),
      Room.count({ where: { operationalStatus: 'ACTIVE' } }),
    ])

    const revenueByDay = {}
    const revenueByMethod = {}
    let totalRevenue = 0
    for (const payment of payments) {
      const amount = Number(payment.amount)
      totalRevenue += amount
      const day = new Date(payment.paidAt).toISOString().slice(0, 10)
      revenueByDay[day] = (revenueByDay[day] || 0) + amount
      revenueByMethod[payment.paymentMethod] = (revenueByMethod[payment.paymentMethod] || 0) + amount
    }

    const reservationsByStatus = {}
    let soldRoomNights = 0
    for (const reservation of reservations) {
      reservationsByStatus[reservation.status] = (reservationsByStatus[reservation.status] || 0) + 1
      if (['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].includes(reservation.status)) {
        const start = reservation.arrivalDate < from ? from : reservation.arrivalDate
        const end = reservation.departureDate > to ? to : reservation.departureDate
        soldRoomNights += Math.max(0, Math.round((new Date(`${end}T00:00:00Z`) - new Date(`${start}T00:00:00Z`)) / 86400000))
      }
    }
    const capacity = activeRooms * daysBetween(from, to)

    return response.status(200).json({ data: {
      from, to, totalRevenue: Number(totalRevenue.toFixed(2)), paymentCount: payments.length,
      reservationCount: reservations.length, activeRooms, soldRoomNights,
      occupancyRate: capacity ? Math.min(100, Math.round((soldRoomNights / capacity) * 100)) : 0,
      revenueByDay: Object.entries(revenueByDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, amount]) => ({ date, amount: Number(amount.toFixed(2)) })),
      revenueByMethod: Object.entries(revenueByMethod).map(([method, amount]) => ({ method, amount: Number(amount.toFixed(2)) })),
      reservationsByStatus: Object.entries(reservationsByStatus).map(([status, count]) => ({ status, count })),
    } })
  } catch (error) { return next(error) }
}

module.exports = { getSummary }
