const { Op, fn, col } = require('sequelize')

const { Guest, Payment, Reservation, ReservationRequest, Room } = require('../models')

async function getDashboard(_request, response, next) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const [roomTotal, roomActive, roomReady, guestTotal, pendingRequests, arrivals, departures, occupied, revenue, recentArrivals] = await Promise.all([
      Room.count(), Room.count({ where: { operationalStatus: 'ACTIVE' } }),
      Room.count({ where: { operationalStatus: 'ACTIVE', housekeepingStatus: { [Op.in]: ['CLEAN', 'INSPECTED'] } } }),
      Guest.count(), ReservationRequest.count({ where: { status: { [Op.in]: ['PENDING', 'CONTACTED'] } } }),
      Reservation.count({ where: { arrivalDate: today, status: { [Op.in]: ['CONFIRMED', 'CHECKED_IN'] } } }),
      Reservation.count({ where: { departureDate: today, status: { [Op.in]: ['CHECKED_IN', 'CHECKED_OUT'] } } }),
      Reservation.count({ where: { status: 'CHECKED_IN' } }),
      Payment.findOne({ attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'total']], where: { status: 'COMPLETED', paidAt: { [Op.between]: [new Date(`${today}T00:00:00`), new Date(`${today}T23:59:59`)] } }, raw: true }),
      Reservation.findAll({ where: { arrivalDate: today, status: { [Op.in]: ['CONFIRMED', 'CHECKED_IN'] } }, include: ['guest', 'room', 'roomType'], order: [['arrivalDate', 'ASC']], limit: 5 }),
    ])
    return response.status(200).json({ data: {
      roomTotal, roomActive, roomReady, guestTotal, pendingRequests, arrivals, departures, occupied,
      occupancyRate: roomActive ? Math.round((occupied / roomActive) * 100) : 0,
      revenueToday: Number(revenue?.total || 0), recentArrivals,
    } })
  } catch (error) { return next(error) }
}

module.exports = { getDashboard }

