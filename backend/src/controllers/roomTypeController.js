const { AuditLog, Reservation, ReservationRequest, Room, RoomType } = require('../models')

const fields = ['name', 'description', 'capacityAdults', 'capacityChildren', 'basePrice', 'status']
const payload = (body) => Object.fromEntries(fields.filter((field) => Object.hasOwn(body, field)).map((field) => [field, body[field] === '' ? null : body[field]]))

async function listRoomTypes(request, response, next) {
  try {
    const where = request.query.status ? { status: request.query.status } : undefined
    const rows = await RoomType.findAll({
      where,
      include: [{ model: Room, as: 'rooms', attributes: ['id', 'operationalStatus'] }],
      order: [['name', 'ASC']],
    })
    const data = rows.map((row) => ({
      ...row.toJSON(),
      roomCount: row.rooms.length,
      activeRoomCount: row.rooms.filter((room) => room.operationalStatus === 'ACTIVE').length,
      rooms: undefined,
    }))
    return response.status(200).json({ data })
  } catch (error) {
    return next(error)
  }
}

async function getRoomType(request, response, next) {
  try {
    const row = await RoomType.findByPk(request.params.id, { include: [{ model: Room, as: 'rooms' }] })
    if (!row) return response.status(404).json({ message: 'Type de chambre introuvable' })
    return response.status(200).json({ data: row })
  } catch (error) { return next(error) }
}

async function createRoomType(request, response, next) {
  try {
    const row = await RoomType.create(payload(request.body))
    await AuditLog.create({ userId: request.auth.userId, action: 'ROOM_TYPE_CREATE', entityType: 'RoomType', entityId: String(row.id), newValues: row.toJSON(), ipAddress: request.ip })
    return response.status(201).json({ message: 'Type de chambre créé', data: row })
  } catch (error) { return next(error) }
}

async function updateRoomType(request, response, next) {
  try {
    const row = await RoomType.findByPk(request.params.id)
    if (!row) return response.status(404).json({ message: 'Type de chambre introuvable' })
    const oldValues = row.toJSON()
    await row.update(payload(request.body))
    await AuditLog.create({ userId: request.auth.userId, action: 'ROOM_TYPE_UPDATE', entityType: 'RoomType', entityId: String(row.id), oldValues, newValues: row.toJSON(), ipAddress: request.ip })
    return response.status(200).json({ message: 'Type de chambre mis à jour', data: row })
  } catch (error) { return next(error) }
}

async function deleteRoomType(request, response, next) {
  try {
    const row = await RoomType.findByPk(request.params.id)
    if (!row) return response.status(404).json({ message: 'Type de chambre introuvable' })
    const [roomCount, reservationCount, requestCount] = await Promise.all([
      Room.count({ where: { roomTypeId: row.id } }),
      Reservation.count({ where: { roomTypeId: row.id } }),
      ReservationRequest.count({ where: { roomTypeId: row.id } }),
    ])
    if (roomCount + reservationCount + requestCount > 0) {
      return response.status(409).json({ message: 'Ce type ne peut pas être supprimé car il est déjà utilisé' })
    }
    const oldValues = row.toJSON()
    await row.destroy()
    await AuditLog.create({ userId: request.auth.userId, action: 'ROOM_TYPE_DELETE', entityType: 'RoomType', entityId: String(row.id), oldValues, ipAddress: request.ip })
    return response.status(200).json({ message: 'Type de chambre supprimé' })
  } catch (error) { return next(error) }
}

module.exports = { createRoomType, deleteRoomType, getRoomType, listRoomTypes, updateRoomType }

