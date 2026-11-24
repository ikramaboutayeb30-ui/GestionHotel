const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')

const { AuditLog, Permission, RefreshToken, User, sequelize } = require('../models')

const includePermissions = [{ model: Permission, as: 'permissions', through: { attributes: [] } }]
const safeUser = (user) => ({ ...user.toSafeJSON(), permissions: user.role === 'ADMIN' ? ['*'] : user.permissions.map((permission) => permission.code), permissionIds: user.permissions.map((permission) => permission.id) })

async function listUsers(request, response, next) {
  try {
    const where = {}
    if (request.query.status) where.status = request.query.status
    if (request.query.search) where[Op.or] = [
      { firstName: { [Op.like]: `%${request.query.search.trim()}%` } },
      { lastName: { [Op.like]: `%${request.query.search.trim()}%` } },
      { email: { [Op.like]: `%${request.query.search.trim()}%` } },
    ]
    const rows = await User.findAll({ where, include: includePermissions, order: [['firstName', 'ASC'], ['lastName', 'ASC']] })
    return response.status(200).json({ data: rows.map(safeUser) })
  } catch (error) { return next(error) }
}

async function getUser(request, response, next) {
  try {
    const row = await User.findByPk(request.params.id, { include: includePermissions })
    if (!row) return response.status(404).json({ message: 'Utilisateur introuvable' })
    return response.status(200).json({ data: safeUser(row) })
  } catch (error) { return next(error) }
}

async function createUser(request, response, next) {
  let transaction
  try {
    transaction = await sequelize.transaction()
    const row = await User.create({
      firstName: request.body.firstName.trim(), lastName: request.body.lastName.trim(),
      email: request.body.email.trim().toLowerCase(), passwordHash: await bcrypt.hash(request.body.password, 12),
      phone: request.body.phone?.trim() || null, role: request.body.role, status: 'ACTIVE',
    }, { transaction })
    if (row.role === 'USER' && request.body.permissionIds?.length) {
      const permissions = await Permission.findAll({ where: { id: request.body.permissionIds }, transaction })
      await row.setPermissions(permissions, { transaction })
    }
    await AuditLog.create({ userId: request.auth.userId, action: 'USER_CREATE', entityType: 'User', entityId: String(row.id), newValues: { email: row.email, role: row.role }, ipAddress: request.ip }, { transaction })
    await transaction.commit()
    return response.status(201).json({ message: 'Utilisateur créé', data: safeUser(await User.findByPk(row.id, { include: includePermissions })) })
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback()
    return next(error)
  }
}

async function updateUser(request, response, next) {
  let transaction
  try {
    transaction = await sequelize.transaction()
    const row = await User.findByPk(request.params.id, { transaction })
    if (!row) { await transaction.rollback(); return response.status(404).json({ message: 'Utilisateur introuvable' }) }
    if (String(row.id) === String(request.auth.userId) && ((request.body.status && request.body.status !== 'ACTIVE') || (request.body.role && request.body.role !== 'ADMIN'))) {
      await transaction.rollback(); return response.status(409).json({ message: 'Vous ne pouvez pas retirer vos propres droits administrateur' })
    }
    const oldValues = { email: row.email, role: row.role, status: row.status }
    const allowed = ['firstName', 'lastName', 'email', 'phone', 'role', 'status']
    const values = Object.fromEntries(allowed.filter((field) => Object.hasOwn(request.body, field)).map((field) => [field, typeof request.body[field] === 'string' ? request.body[field].trim() || null : request.body[field]]))
    if (values.email) values.email = values.email.toLowerCase()
    if (request.body.password) {
      if (request.body.password.length < 8) { await transaction.rollback(); return response.status(422).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' }) }
      values.passwordHash = await bcrypt.hash(request.body.password, 12)
    }
    await row.update(values, { transaction })
    if (row.role === 'USER' && Array.isArray(request.body.permissionIds)) {
      const permissions = await Permission.findAll({ where: { id: request.body.permissionIds }, transaction })
      await row.setPermissions(permissions, { transaction })
    } else if (row.role === 'ADMIN') await row.setPermissions([], { transaction })
    if (request.body.password || row.status !== 'ACTIVE') await RefreshToken.update({ revokedAt: new Date() }, { where: { userId: row.id, revokedAt: null }, transaction })
    await AuditLog.create({ userId: request.auth.userId, action: 'USER_UPDATE', entityType: 'User', entityId: String(row.id), oldValues, newValues: { email: row.email, role: row.role, status: row.status }, ipAddress: request.ip }, { transaction })
    await transaction.commit()
    return response.status(200).json({ message: 'Utilisateur mis à jour', data: safeUser(await User.findByPk(row.id, { include: includePermissions })) })
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback()
    return next(error)
  }
}

async function deactivateUser(request, response, next) {
  try {
    if (String(request.params.id) === String(request.auth.userId)) return response.status(409).json({ message: 'Vous ne pouvez pas désactiver votre propre compte' })
    const row = await User.findByPk(request.params.id)
    if (!row) return response.status(404).json({ message: 'Utilisateur introuvable' })
    await row.update({ status: 'INACTIVE' })
    await RefreshToken.update({ revokedAt: new Date() }, { where: { userId: row.id, revokedAt: null } })
    await AuditLog.create({ userId: request.auth.userId, action: 'USER_DEACTIVATE', entityType: 'User', entityId: String(row.id), ipAddress: request.ip })
    return response.status(200).json({ message: 'Utilisateur désactivé' })
  } catch (error) { return next(error) }
}

async function listPermissions(_request, response, next) {
  try {
    return response.status(200).json({ data: await Permission.findAll({ order: [['code', 'ASC']] }) })
  } catch (error) { return next(error) }
}

module.exports = { createUser, deactivateUser, getUser, listPermissions, listUsers, updateUser }

