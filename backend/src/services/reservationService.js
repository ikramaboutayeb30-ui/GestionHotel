const { Op } = require('sequelize')

const { HotelSetting, Reservation, Room } = require('../models')

const blockingStatuses = ['CONFIRMED', 'CHECKED_IN']

function numberOfNights(arrivalDate, departureDate) {
  const arrival = new Date(`${arrivalDate}T00:00:00.000Z`)
  const departure = new Date(`${departureDate}T00:00:00.000Z`)
  return Math.round((departure - arrival) / 86400000)
}

async function calculateTotals({ arrivalDate, departureDate, nightlyRate, discountAmount = 0 }) {
  const nights = numberOfNights(arrivalDate, departureDate)
  if (!Number.isInteger(nights) || nights < 1) throw new Error('La date de départ doit suivre la date d’arrivée')

  const rate = Number(nightlyRate)
  const discount = Number(discountAmount || 0)
  if (!Number.isFinite(rate) || rate < 0 || !Number.isFinite(discount) || discount < 0) {
    throw new Error('Les montants de la réservation sont invalides')
  }

  const subtotal = rate * nights
  if (discount > subtotal) throw new Error('La remise ne peut pas dépasser le sous-total')
  const settings = await HotelSetting.findOne()
  const taxableAmount = subtotal - discount
  const taxRate = Number(settings?.taxPercentage || 0)
  const taxAmount = taxableAmount * (taxRate / 100)

  return {
    nights,
    subtotal: subtotal.toFixed(2),
    discountAmount: discount.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    totalAmount: (taxableAmount + taxAmount).toFixed(2),
  }
}

async function roomIsAvailable({ roomId, arrivalDate, departureDate, excludeReservationId, transaction }) {
  const where = {
    roomId,
    status: { [Op.in]: blockingStatuses },
    arrivalDate: { [Op.lt]: departureDate },
    departureDate: { [Op.gt]: arrivalDate },
  }
  if (excludeReservationId) where.id = { [Op.ne]: excludeReservationId }
  return (await Reservation.count({ where, transaction })) === 0
}

async function findAvailableRoom({ roomTypeId, arrivalDate, departureDate, excludeReservationId, transaction }) {
  const rooms = await Room.findAll({
    where: { roomTypeId, operationalStatus: 'ACTIVE' },
    order: [['roomNumber', 'ASC']],
    transaction,
    lock: transaction ? transaction.LOCK.UPDATE : undefined,
  })

  for (const room of rooms) {
    if (await roomIsAvailable({ roomId: room.id, arrivalDate, departureDate, excludeReservationId, transaction })) {
      return room
    }
  }
  return null
}

module.exports = { blockingStatuses, calculateTotals, findAvailableRoom, numberOfNights, roomIsAvailable }

