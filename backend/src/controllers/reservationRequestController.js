const { Op } = require('sequelize')

const { AuditLog, Guest, Reservation, ReservationRequest, ReservationStatusHistory, RoomType, User, sequelize } = require('../models')
const { calculateTotals, findAvailableRoom } = require('../services/reservationService')
const generateReference = require('../utils/reference')

const include = [
  { model: Guest, as: 'guest' },
  { model: RoomType, as: 'roomType' },
  { model: User, as: 'handler', attributes: ['id', 'firstName', 'lastName'] },
]
const fields = ['guestId', 'roomTypeId', 'arrivalDate', 'departureDate', 'adults', 'children', 'specialRequests', 'quotedAmount', 'source']
const payload = (body) => Object.fromEntries(fields.filter((field) => Object.hasOwn(body, field)).map((field) => [field, body[field] === '' ? null : body[field]]))

async function listRequests(request, response, next) {
  try {
    const page = Math.max(Number.parseInt(request.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(request.query.limit, 10) || 10, 1), 100)
    const where = {}
    if (request.query.status) where.status = request.query.status
    if (request.query.search) where[Op.or] = [
      { requestNumber: { [Op.like]: `%${request.query.search.trim()}%` } },
      { '$guest.first_name$': { [Op.like]: `%${request.query.search.trim()}%` } },
      { '$guest.last_name$': { [Op.like]: `%${request.query.search.trim()}%` } },
    ]
    const { count, rows } = await ReservationRequest.findAndCountAll({ where, include, distinct: true, subQuery: false, order: [['createdAt', 'DESC']], limit, offset: (page - 1) * limit })
    return response.status(200).json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } })
  } catch (error) { return next(error) }
}

async function getRequest(request, response, next) {
  try {
    const row = await ReservationRequest.findByPk(request.params.id, { include })
    if (!row) return response.status(404).json({ message: 'Demande introuvable' })
    return response.status(200).json({ data: row })
  } catch (error) { return next(error) }
}

async function createRequest(request, response, next) {
  try {
    const [guest, roomType] = await Promise.all([Guest.findByPk(request.body.guestId), RoomType.findByPk(request.body.roomTypeId)])
    if (!guest || !roomType) return response.status(422).json({ message: 'Client ou type de chambre introuvable' })
    const row = await ReservationRequest.create({ ...payload(request.body), requestNumber: generateReference('DEM'), status: 'PENDING' })
    await AuditLog.create({ userId: request.auth.userId, action: 'REQUEST_CREATE', entityType: 'ReservationRequest', entityId: String(row.id), newValues: row.toJSON(), ipAddress: request.ip })
    return response.status(201).json({ message: 'Demande créée', data: await ReservationRequest.findByPk(row.id, { include }) })
  } catch (error) { return next(error) }
}

async function updateRequest(request, response, next) {
  try {
    const row = await ReservationRequest.findByPk(request.params.id)
    if (!row) return response.status(404).json({ message: 'Demande introuvable' })
    if (!['PENDING', 'CONTACTED'].includes(row.status)) return response.status(409).json({ message: 'Cette demande ne peut plus être modifiée' })
    const oldValues = row.toJSON()
    await row.update(payload(request.body))
    await AuditLog.create({ userId: request.auth.userId, action: 'REQUEST_UPDATE', entityType: 'ReservationRequest', entityId: String(row.id), oldValues, newValues: row.toJSON(), ipAddress: request.ip })
    return response.status(200).json({ message: 'Demande mise à jour', data: await ReservationRequest.findByPk(row.id, { include }) })
  } catch (error) { return next(error) }
}

async function setRequestStatus(request, response, next) {
  try {
    const row = await ReservationRequest.findByPk(request.params.id)
    if (!row) return response.status(404).json({ message: 'Demande introuvable' })
    if (!['CONTACTED', 'REJECTED', 'EXPIRED'].includes(request.body.status)) return response.status(422).json({ message: 'Statut invalide' })
    await row.update({ status: request.body.status, handledBy: request.auth.userId, handledAt: new Date(), rejectionReason: request.body.reason || null })
    await AuditLog.create({ userId: request.auth.userId, action: `REQUEST_${request.body.status}`, entityType: 'ReservationRequest', entityId: String(row.id), newValues: row.toJSON(), ipAddress: request.ip })
    return response.status(200).json({ message: 'Statut de la demande mis à jour', data: await ReservationRequest.findByPk(row.id, { include }) })
  } catch (error) { return next(error) }
}

async function approveRequest(request, response, next) {
  let transaction
  try {
    transaction = await sequelize.transaction()
    const row = await ReservationRequest.findByPk(request.params.id, { transaction, lock: transaction.LOCK.UPDATE })
    if (!row) { await transaction.rollback(); return response.status(404).json({ message: 'Demande introuvable' }) }
    if (!['PENDING', 'CONTACTED', 'APPROVED'].includes(row.status)) { await transaction.rollback(); return response.status(409).json({ message: 'Cette demande ne peut pas être approuvée' }) }
    const roomType = await RoomType.findByPk(row.roomTypeId, { transaction })
    const room = await findAvailableRoom({ roomTypeId: row.roomTypeId, arrivalDate: row.arrivalDate, departureDate: row.departureDate, transaction })
    if (!room) { await transaction.rollback(); return response.status(409).json({ message: 'Aucune chambre disponible pour cette période' }) }
    const nightlyRate = request.body.nightlyRate ?? row.quotedAmount ?? roomType.basePrice
    const totals = await calculateTotals({ arrivalDate: row.arrivalDate, departureDate: row.departureDate, nightlyRate, discountAmount: request.body.discountAmount || 0 })
    const reservation = await Reservation.create({
      confirmationNumber: generateReference('RES'), guestId: row.guestId, reservationRequestId: row.id,
      roomTypeId: row.roomTypeId, roomId: room.id, arrivalDate: row.arrivalDate, departureDate: row.departureDate,
      adults: row.adults, children: row.children, source: row.source, nightlyRate, ...totals,
      notes: row.specialRequests, createdBy: request.auth.userId, status: 'CONFIRMED',
    }, { transaction })
    await ReservationStatusHistory.create({ reservationId: reservation.id, newStatus: 'CONFIRMED', changedBy: request.auth.userId, reason: 'Demande approuvée' }, { transaction })
    await row.update({ status: 'CONVERTED', handledBy: request.auth.userId, handledAt: new Date() }, { transaction })
    await AuditLog.create({ userId: request.auth.userId, action: 'REQUEST_APPROVE', entityType: 'ReservationRequest', entityId: String(row.id), newValues: { reservationId: reservation.id }, ipAddress: request.ip }, { transaction })
    await transaction.commit()
    return response.status(201).json({ message: 'Demande convertie en réservation', data: reservation })
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback()
    return next(error)
  }
}

async function deleteRequest(request, response, next) {
  try {
    const row = await ReservationRequest.findByPk(request.params.id)
    if (!row) return response.status(404).json({ message: 'Demande introuvable' })
    if (!['PENDING', 'REJECTED', 'EXPIRED'].includes(row.status)) return response.status(409).json({ message: 'Cette demande doit être conservée' })
    const oldValues = row.toJSON()
    await row.destroy()
    await AuditLog.create({ userId: request.auth.userId, action: 'REQUEST_DELETE', entityType: 'ReservationRequest', entityId: String(row.id), oldValues, ipAddress: request.ip })
    return response.status(200).json({ message: 'Demande supprimée' })
  } catch (error) { return next(error) }
}

module.exports = { approveRequest, createRequest, deleteRequest, getRequest, listRequests, setRequestStatus, updateRequest }

