const { Op } = require('sequelize')

const { AuditLog, Guest, Reservation, sequelize } = require('../models')

const editableFields = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'nationality',
  'identificationType',
  'identificationNumber',
  'address',
  'notes',
]

function guestPayload(body) {
  const payload = {}
  for (const field of editableFields) {
    if (Object.hasOwn(body, field)) {
      payload[field] = typeof body[field] === 'string' ? body[field].trim() || null : body[field]
    }
  }
  return payload
}

async function listGuests(request, response, next) {
  try {
    const page = Math.max(Number.parseInt(request.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(request.query.limit, 10) || 10, 1), 100)
    const search = request.query.search?.trim()
    const allowedSortFields = new Set([
      'firstName',
      'lastName',
      'email',
      'phone',
      'nationality',
      'identificationNumber',
      'createdAt',
    ])
    const sortBy = allowedSortFields.has(request.query.sortBy) ? request.query.sortBy : 'createdAt'
    const sortOrder = request.query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    const where = search
      ? {
          [Op.or]: [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
            { identificationNumber: { [Op.like]: `%${search}%` } },
          ],
        }
      : undefined

    const { count, rows } = await Guest.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset: (page - 1) * limit,
    })

    return response.status(200).json({
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    return next(error)
  }
}

async function getGuest(request, response, next) {
  try {
    const guest = await Guest.findByPk(request.params.id)
    if (!guest) return response.status(404).json({ message: 'Client introuvable' })
    return response.status(200).json({ data: guest })
  } catch (error) {
    return next(error)
  }
}

async function createGuest(request, response, next) {
  let transaction
  try {
    transaction = await sequelize.transaction()
    const guest = await Guest.create(guestPayload(request.body), { transaction })
    await AuditLog.create(
      {
        userId: request.auth.userId,
        action: 'GUEST_CREATE',
        entityType: 'Guest',
        entityId: String(guest.id),
        newValues: guest.toJSON(),
        ipAddress: request.ip,
      },
      { transaction },
    )
    await transaction.commit()
    return response.status(201).json({ message: 'Client créé', data: guest })
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback()
    return next(error)
  }
}

async function updateGuest(request, response, next) {
  let transaction
  try {
    transaction = await sequelize.transaction()
    const guest = await Guest.findByPk(request.params.id, { transaction })
    if (!guest) {
      await transaction.rollback()
      return response.status(404).json({ message: 'Client introuvable' })
    }

    const oldValues = guest.toJSON()
    await guest.update(guestPayload(request.body), { transaction })
    await AuditLog.create(
      {
        userId: request.auth.userId,
        action: 'GUEST_UPDATE',
        entityType: 'Guest',
        entityId: String(guest.id),
        oldValues,
        newValues: guest.toJSON(),
        ipAddress: request.ip,
      },
      { transaction },
    )
    await transaction.commit()
    return response.status(200).json({ message: 'Client mis à jour', data: guest })
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback()
    return next(error)
  }
}

async function deleteGuest(request, response, next) {
  let transaction
  try {
    transaction = await sequelize.transaction()
    const guest = await Guest.findByPk(request.params.id, { transaction })
    if (!guest) {
      await transaction.rollback()
      return response.status(404).json({ message: 'Client introuvable' })
    }

    const reservationCount = await Reservation.count({
      where: { guestId: guest.id },
      transaction,
    })
    if (reservationCount > 0) {
      await transaction.rollback()
      return response.status(409).json({
        message: 'Ce client ne peut pas être supprimé car un historique de réservation existe',
      })
    }

    const oldValues = guest.toJSON()
    await guest.destroy({ transaction })
    await AuditLog.create(
      {
        userId: request.auth.userId,
        action: 'GUEST_DELETE',
        entityType: 'Guest',
        entityId: String(guest.id),
        oldValues,
        ipAddress: request.ip,
      },
      { transaction },
    )
    await transaction.commit()
    return response.status(200).json({ message: 'Client supprimé' })
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback()
    return next(error)
  }
}

module.exports = { createGuest, deleteGuest, getGuest, listGuests, updateGuest }
