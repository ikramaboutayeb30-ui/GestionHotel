const { Op } = require('sequelize')

const { AuditLog, Guest, Payment, Reservation, User, sequelize } = require('../models')

const include = [
  { model: Reservation, as: 'reservation', include: [{ model: Guest, as: 'guest' }] },
  { model: User, as: 'receiver', attributes: ['id', 'firstName', 'lastName'] },
]

async function listPayments(request, response, next) {
  try {
    const page = Math.max(Number.parseInt(request.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(request.query.limit, 10) || 10, 1), 100)
    const where = {}
    if (request.query.status) where.status = request.query.status
    if (request.query.paymentMethod) where.paymentMethod = request.query.paymentMethod
    if (request.query.reservationId) where.reservationId = request.query.reservationId
    if (request.query.from || request.query.to) {
      where.paidAt = {}
      if (request.query.from) where.paidAt[Op.gte] = new Date(`${request.query.from}T00:00:00`)
      if (request.query.to) where.paidAt[Op.lte] = new Date(`${request.query.to}T23:59:59`)
    }
    const { count, rows } = await Payment.findAndCountAll({ where, include, distinct: true, order: [['paidAt', 'DESC'], ['createdAt', 'DESC']], limit, offset: (page - 1) * limit })
    return response.status(200).json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } })
  } catch (error) { return next(error) }
}

async function getPayment(request, response, next) {
  try {
    const row = await Payment.findByPk(request.params.id, { include })
    if (!row) return response.status(404).json({ message: 'Paiement introuvable' })
    return response.status(200).json({ data: row })
  } catch (error) { return next(error) }
}

async function createPayment(request, response, next) {
  try {
    const reservation = await Reservation.findByPk(request.body.reservationId)
    if (!reservation) return response.status(422).json({ message: 'Réservation introuvable' })
    if (['CANCELLED', 'NO_SHOW'].includes(reservation.status)) return response.status(409).json({ message: 'Impossible d’encaisser sur cette réservation' })
    const row = await Payment.create({
      reservationId: reservation.id,
      amount: Number(request.body.amount).toFixed(2),
      currencyCode: 'MAD',
      paymentMethod: request.body.paymentMethod,
      paymentType: request.body.paymentType || 'PAYMENT',
      status: request.body.status || 'COMPLETED',
      transactionReference: request.body.transactionReference || null,
      receivedBy: request.auth.userId,
      paidAt: request.body.paidAt || (request.body.status === 'PENDING' ? null : new Date()),
      notes: request.body.notes || null,
    })
    await AuditLog.create({ userId: request.auth.userId, action: 'PAYMENT_CREATE', entityType: 'Payment', entityId: String(row.id), newValues: row.toJSON(), ipAddress: request.ip })
    return response.status(201).json({ message: 'Paiement enregistré', data: await Payment.findByPk(row.id, { include }) })
  } catch (error) { return next(error) }
}

async function updatePayment(request, response, next) {
  try {
    const row = await Payment.findByPk(request.params.id)
    if (!row) return response.status(404).json({ message: 'Paiement introuvable' })
    if (row.status !== 'PENDING') return response.status(409).json({ message: 'Seul un paiement en attente peut être modifié' })
    const allowed = ['amount', 'paymentMethod', 'status', 'transactionReference', 'paidAt', 'notes']
    const values = Object.fromEntries(allowed.filter((field) => Object.hasOwn(request.body, field)).map((field) => [field, request.body[field] === '' ? null : request.body[field]]))
    if (values.status === 'COMPLETED' && !values.paidAt) values.paidAt = new Date()
    const oldValues = row.toJSON()
    await row.update(values)
    await AuditLog.create({ userId: request.auth.userId, action: 'PAYMENT_UPDATE', entityType: 'Payment', entityId: String(row.id), oldValues, newValues: row.toJSON(), ipAddress: request.ip })
    return response.status(200).json({ message: 'Paiement mis à jour', data: await Payment.findByPk(row.id, { include }) })
  } catch (error) { return next(error) }
}

async function refundPayment(request, response, next) {
  let transaction
  try {
    transaction = await sequelize.transaction()
    const original = await Payment.findByPk(request.params.id, { transaction, lock: transaction.LOCK.UPDATE })
    if (!original || original.status !== 'COMPLETED' || original.paymentType === 'REFUND') {
      await transaction.rollback()
      return response.status(409).json({ message: 'Ce paiement ne peut pas être remboursé' })
    }
    const amount = Number(request.body.amount)
    const alreadyRefunded = Math.abs(Number(await Payment.sum('amount', { where: { transactionReference: `REFUND:${original.id}`, paymentType: 'REFUND', status: 'COMPLETED' }, transaction }) || 0))
    if (!Number.isFinite(amount) || amount <= 0 || amount + alreadyRefunded > Number(original.amount)) {
      await transaction.rollback()
      return response.status(422).json({ message: 'Montant de remboursement invalide' })
    }
    const refund = await Payment.create({
      reservationId: original.reservationId, amount: (-amount).toFixed(2), currencyCode: original.currencyCode,
      paymentMethod: original.paymentMethod, paymentType: 'REFUND', status: 'COMPLETED',
      transactionReference: `REFUND:${original.id}`, receivedBy: request.auth.userId, paidAt: new Date(), notes: request.body.notes || null,
    }, { transaction })
    if (amount + alreadyRefunded === Number(original.amount)) await original.update({ status: 'REFUNDED' }, { transaction })
    await AuditLog.create({ userId: request.auth.userId, action: 'PAYMENT_REFUND', entityType: 'Payment', entityId: String(original.id), newValues: refund.toJSON(), ipAddress: request.ip }, { transaction })
    await transaction.commit()
    return response.status(201).json({ message: 'Remboursement enregistré', data: refund })
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback()
    return next(error)
  }
}

async function deletePayment(request, response, next) {
  try {
    const row = await Payment.findByPk(request.params.id)
    if (!row) return response.status(404).json({ message: 'Paiement introuvable' })
    if (!['PENDING', 'FAILED', 'CANCELLED'].includes(row.status)) return response.status(409).json({ message: 'Un paiement comptabilisé ne peut pas être supprimé' })
    const oldValues = row.toJSON()
    await row.destroy()
    await AuditLog.create({ userId: request.auth.userId, action: 'PAYMENT_DELETE', entityType: 'Payment', entityId: String(row.id), oldValues, ipAddress: request.ip })
    return response.status(200).json({ message: 'Paiement supprimé' })
  } catch (error) { return next(error) }
}

module.exports = { createPayment, deletePayment, getPayment, listPayments, refundPayment, updatePayment }

