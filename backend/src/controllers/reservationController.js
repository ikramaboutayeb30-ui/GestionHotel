const { Op } = require('sequelize')

const {
  AuditLog, Guest, Payment, Reservation, ReservationStatusHistory, Room, RoomType, sequelize,
} = require('../models')
const { calculateTotals, findAvailableRoom, roomIsAvailable } = require('../services/reservationService')
const generateReference = require('../utils/reference')

const reservationInclude = [
  { model: Guest, as: 'guest' },
  { model: RoomType, as: 'roomType' },
  { model: Room, as: 'room' },
]

function reservationPayload(body) {
  const fields = ['guestId', 'roomTypeId', 'roomId', 'arrivalDate', 'departureDate', 'adults', 'children', 'nightlyRate', 'discountAmount', 'source', 'notes']
  return Object.fromEntries(fields.filter((field) => Object.hasOwn(body, field)).map((field) => [field, body[field] === '' ? null : body[field]]))
}

async function validateEntitiesAndRoom(values, transaction, excludeReservationId) {
  const [guest, roomType] = await Promise.all([
    Guest.findByPk(values.guestId, { transaction }),
    RoomType.findByPk(values.roomTypeId, { transaction }),
  ])
  if (!guest) return { error: 'Client introuvable' }
  if (!roomType || roomType.status !== 'ACTIVE') return { error: 'Type de chambre indisponible' }
  if (Number(values.adults) > roomType.capacityAdults || Number(values.children || 0) > roomType.capacityChildren) {
    return { error: 'La capacité du type de chambre est dépassée' }
  }

  let room
  if (values.roomId) {
    room = await Room.findByPk(values.roomId, { transaction, lock: transaction.LOCK.UPDATE })
    if (!room || String(room.roomTypeId) !== String(roomType.id) || room.operationalStatus !== 'ACTIVE') {
      return { error: 'La chambre sélectionnée est indisponible' }
    }
    if (!(await roomIsAvailable({ roomId: room.id, arrivalDate: values.arrivalDate, departureDate: values.departureDate, excludeReservationId, transaction }))) {
      return { error: 'La chambre est déjà réservée sur cette période', status: 409 }
    }
  } else {
    room = await findAvailableRoom({ roomTypeId: roomType.id, arrivalDate: values.arrivalDate, departureDate: values.departureDate, excludeReservationId, transaction })
    if (!room) return { error: 'Aucune chambre disponible pour cette période', status: 409 }
  }
  return { guest, roomType, room }
}

async function listReservations(request, response, next) {
  try {
    const page = Math.max(Number.parseInt(request.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(request.query.limit, 10) || 10, 1), 100)
    const where = {}
    if (request.query.status) where.status = request.query.status
    if (request.query.from) where.arrivalDate = { [Op.gte]: request.query.from }
    if (request.query.to) where.departureDate = { [Op.lte]: request.query.to }
    if (request.query.search) {
      const search = request.query.search.trim()
      where[Op.or] = [
        { confirmationNumber: { [Op.like]: `%${search}%` } },
        { '$guest.first_name$': { [Op.like]: `%${search}%` } },
        { '$guest.last_name$': { [Op.like]: `%${search}%` } },
        { '$room.room_number$': { [Op.like]: `%${search}%` } },
      ]
    }
    const { count, rows } = await Reservation.findAndCountAll({
      where,
      include: reservationInclude,
      distinct: true,
      order: [['arrivalDate', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      subQuery: false,
    })
    return response.status(200).json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } })
  } catch (error) { return next(error) }
}

async function getReservation(request, response, next) {
  try {
    const row = await Reservation.findByPk(request.params.id, {
      include: [...reservationInclude, { model: Payment, as: 'payments' }, { model: ReservationStatusHistory, as: 'statusHistory' }],
    })
    if (!row) return response.status(404).json({ message: 'Réservation introuvable' })
    return response.status(200).json({ data: row })
  } catch (error) { return next(error) }
}

async function createReservation(request, response, next) {
  let transaction
  try {
    transaction = await sequelize.transaction()
    const values = reservationPayload(request.body)
    const validation = await validateEntitiesAndRoom(values, transaction)
    if (validation.error) {
      await transaction.rollback()
      return response.status(validation.status || 422).json({ message: validation.error })
    }
    const totals = await calculateTotals(values)
    const row = await Reservation.create({
      ...values,
      roomId: validation.room.id,
      ...totals,
      confirmationNumber: generateReference('RES'),
      createdBy: request.auth.userId,
      status: 'CONFIRMED',
    }, { transaction })
    await ReservationStatusHistory.create({ reservationId: row.id, previousStatus: null, newStatus: 'CONFIRMED', changedBy: request.auth.userId, reason: 'Création de la réservation' }, { transaction })
    await AuditLog.create({ userId: request.auth.userId, action: 'RESERVATION_CREATE', entityType: 'Reservation', entityId: String(row.id), newValues: row.toJSON(), ipAddress: request.ip }, { transaction })
    await transaction.commit()
    const data = await Reservation.findByPk(row.id, { include: reservationInclude })
    return response.status(201).json({ message: 'Réservation créée', data })
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback()
    return next(error)
  }
}

async function updateReservation(request, response, next) {
  let transaction
  try {
    transaction = await sequelize.transaction()
    const row = await Reservation.findByPk(request.params.id, { transaction, lock: transaction.LOCK.UPDATE })
    if (!row) { await transaction.rollback(); return response.status(404).json({ message: 'Réservation introuvable' }) }
    if (row.status !== 'CONFIRMED') { await transaction.rollback(); return response.status(409).json({ message: 'Seule une réservation confirmée peut être modifiée' }) }
    const values = { ...row.toJSON(), ...reservationPayload(request.body) }
    const validation = await validateEntitiesAndRoom(values, transaction, row.id)
    if (validation.error) { await transaction.rollback(); return response.status(validation.status || 422).json({ message: validation.error }) }
    const totals = await calculateTotals(values)
    const oldValues = row.toJSON()
    await row.update({ ...reservationPayload(request.body), roomId: validation.room.id, ...totals }, { transaction })
    await AuditLog.create({ userId: request.auth.userId, action: 'RESERVATION_UPDATE', entityType: 'Reservation', entityId: String(row.id), oldValues, newValues: row.toJSON(), ipAddress: request.ip }, { transaction })
    await transaction.commit()
    const data = await Reservation.findByPk(row.id, { include: reservationInclude })
    return response.status(200).json({ message: 'Réservation mise à jour', data })
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback()
    return next(error)
  }
}

const transitions = {
  CONFIRMED: ['CHECKED_IN', 'CANCELLED', 'NO_SHOW'],
  CHECKED_IN: ['CHECKED_OUT'],
  CHECKED_OUT: [], CANCELLED: [], NO_SHOW: [],
}

async function changeReservationStatus(request, response, next) {
  let transaction
  try {
    transaction = await sequelize.transaction()
    const row = await Reservation.findByPk(request.params.id, { transaction, lock: transaction.LOCK.UPDATE })
    if (!row) { await transaction.rollback(); return response.status(404).json({ message: 'Réservation introuvable' }) }
    const newStatus = request.body.status
    if (newStatus === 'CANCELLED' && request.auth.role !== 'ADMIN' && !request.auth.permissions.includes('reservation.cancel')) {
      await transaction.rollback()
      return response.status(403).json({ message: 'Vous n’avez pas la permission d’annuler une réservation' })
    }
    if (!transitions[row.status]?.includes(newStatus)) {
      await transaction.rollback()
      return response.status(409).json({ message: `Passage de ${row.status} vers ${newStatus} non autorisé` })
    }
    const previousStatus = row.status
    await row.update({ status: newStatus }, { transaction })
    if (newStatus === 'CHECKED_OUT' && row.roomId) {
      await Room.update({ housekeepingStatus: 'DIRTY' }, { where: { id: row.roomId }, transaction })
    }
    await ReservationStatusHistory.create({ reservationId: row.id, previousStatus, newStatus, changedBy: request.auth.userId, reason: request.body.reason || null }, { transaction })
    await AuditLog.create({ userId: request.auth.userId, action: `RESERVATION_${newStatus}`, entityType: 'Reservation', entityId: String(row.id), oldValues: { status: previousStatus }, newValues: { status: newStatus }, ipAddress: request.ip }, { transaction })
    await transaction.commit()
    const data = await Reservation.findByPk(row.id, { include: reservationInclude })
    return response.status(200).json({ message: 'Statut de la réservation mis à jour', data })
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback()
    return next(error)
  }
}

async function deleteReservation(request, response, next) {
  try {
    const row = await Reservation.findByPk(request.params.id)
    if (!row) return response.status(404).json({ message: 'Réservation introuvable' })
    if (!['CANCELLED', 'NO_SHOW'].includes(row.status) || await Payment.count({ where: { reservationId: row.id } })) {
      return response.status(409).json({ message: 'Cette réservation doit être conservée dans l’historique' })
    }
    const oldValues = row.toJSON()
    await row.destroy()
    await AuditLog.create({ userId: request.auth.userId, action: 'RESERVATION_DELETE', entityType: 'Reservation', entityId: String(row.id), oldValues, ipAddress: request.ip })
    return response.status(200).json({ message: 'Réservation supprimée' })
  } catch (error) { return next(error) }
}

async function availability(request, response, next) {
  try {
    const rooms = await Room.findAll({ where: { roomTypeId: request.query.roomTypeId, operationalStatus: 'ACTIVE' }, include: [{ model: RoomType, as: 'roomType' }], order: [['roomNumber', 'ASC']] })
    const available = []
    for (const room of rooms) {
      if (await roomIsAvailable({ roomId: room.id, arrivalDate: request.query.arrivalDate, departureDate: request.query.departureDate })) available.push(room)
    }
    return response.status(200).json({ data: available })
  } catch (error) { return next(error) }
}

module.exports = { availability, changeReservationStatus, createReservation, deleteReservation, getReservation, listReservations, updateReservation }
