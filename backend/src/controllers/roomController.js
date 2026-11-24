const { Op } = require('sequelize')

const { AuditLog, Reservation, Room, RoomType } = require('../models')

const fields = ['roomTypeId', 'roomNumber', 'floor', 'operationalStatus', 'housekeepingStatus', 'notes']
const payload = (body) => Object.fromEntries(fields.filter((field) => Object.hasOwn(body, field)).map((field) => [field, body[field] === '' ? null : body[field]]))

async function listRooms(request, response, next) {
  try {
    const page = Math.max(Number.parseInt(request.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(request.query.limit, 10) || 25, 1), 100)
    const where = {}
    if (request.query.roomTypeId) where.roomTypeId = request.query.roomTypeId
    if (request.query.operationalStatus) where.operationalStatus = request.query.operationalStatus
    if (request.query.housekeepingStatus) where.housekeepingStatus = request.query.housekeepingStatus
    if (request.query.search) where.roomNumber = { [Op.like]: `%${request.query.search.trim()}%` }
    const { count, rows } = await Room.findAndCountAll({
      where,
      include: [{ model: RoomType, as: 'roomType', attributes: ['id', 'name', 'basePrice'] }],
      order: [['roomNumber', 'ASC']],
      limit,
      offset: (page - 1) * limit,
    })
    return response.status(200).json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } })
  } catch (error) { return next(error) }
}

async function getRoom(request, response, next) {
  try {
    const row = await Room.findByPk(request.params.id, { include: [{ model: RoomType, as: 'roomType' }] })
    if (!row) return response.status(404).json({ message: 'Chambre introuvable' })
    return response.status(200).json({ data: row })
  } catch (error) { return next(error) }
}

async function createRoom(request, response, next) {
  try {
    const type = await RoomType.findByPk(request.body.roomTypeId)
    if (!type) return response.status(422).json({ message: 'Type de chambre introuvable' })
    const row = await Room.create(payload(request.body))
    const data = await Room.findByPk(row.id, { include: [{ model: RoomType, as: 'roomType' }] })
    await AuditLog.create({ userId: request.auth.userId, action: 'ROOM_CREATE', entityType: 'Room', entityId: String(row.id), newValues: row.toJSON(), ipAddress: request.ip })
    return response.status(201).json({ message: 'Chambre créée', data })
  } catch (error) { return next(error) }
}

async function updateRoom(request, response, next) {
  try {
    const row = await Room.findByPk(request.params.id)
    if (!row) return response.status(404).json({ message: 'Chambre introuvable' })
    if (request.body.roomTypeId && !(await RoomType.findByPk(request.body.roomTypeId))) {
      return response.status(422).json({ message: 'Type de chambre introuvable' })
    }
    const oldValues = row.toJSON()
    await row.update(payload(request.body))
    const data = await Room.findByPk(row.id, { include: [{ model: RoomType, as: 'roomType' }] })
    await AuditLog.create({ userId: request.auth.userId, action: 'ROOM_UPDATE', entityType: 'Room', entityId: String(row.id), oldValues, newValues: row.toJSON(), ipAddress: request.ip })
    return response.status(200).json({ message: 'Chambre mise à jour', data })
  } catch (error) { return next(error) }
}

async function deleteRoom(request, response, next) {
  try {
    const row = await Room.findByPk(request.params.id)
    if (!row) return response.status(404).json({ message: 'Chambre introuvable' })
    if (await Reservation.count({ where: { roomId: row.id } })) {
      return response.status(409).json({ message: 'Cette chambre possède un historique de réservations et ne peut pas être supprimée' })
    }
    const oldValues = row.toJSON()
    await row.destroy()
    await AuditLog.create({ userId: request.auth.userId, action: 'ROOM_DELETE', entityType: 'Room', entityId: String(row.id), oldValues, ipAddress: request.ip })
    return response.status(200).json({ message: 'Chambre supprimée' })
  } catch (error) { return next(error) }
}

module.exports = { createRoom, deleteRoom, getRoom, listRooms, updateRoom }

