const { Op } = require('sequelize')

const { AuditLog, Permission, RefreshToken, User } = require('../models')
const {
  createSession,
  getRefreshCookieOptions,
  hashToken,
} = require('../services/tokenService')

async function login(request, response, next) {
  try {
    const email = request.body.email.trim().toLowerCase()
    const user = await User.findOne({
      where: { email },
      include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
    })

    if (!user || !(await user.comparePassword(request.body.password))) {
      return response.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect' })
    }

    if (user.status !== 'ACTIVE') {
      return response.status(403).json({ message: 'Ce compte utilisateur est inactif' })
    }

    const { accessToken, refreshToken, refreshDuration } = await createSession(user, request)
    await user.update({ lastLoginAt: new Date() })

    await AuditLog.create({
      userId: user.id,
      action: 'AUTH_LOGIN',
      entityType: 'User',
      entityId: String(user.id),
      ipAddress: request.ip,
    })

    response.cookie('refreshToken', refreshToken, getRefreshCookieOptions(refreshDuration))

    return response.status(200).json({
      message: 'Connexion réussie',
      accessToken,
      user: {
        ...user.toSafeJSON(),
        permissions:
          user.role === 'ADMIN' ? ['*'] : user.permissions.map((permission) => permission.code),
      },
    })
  } catch (error) {
    return next(error)
  }
}

async function logout(request, response, next) {
  try {
    const refreshToken = request.cookies.refreshToken
    const session = refreshToken
      ? await RefreshToken.findOne({
          where: { tokenHash: hashToken(refreshToken), revokedAt: null },
        })
      : null

    if (session) {
      await session.update({ revokedAt: new Date() })
      await AuditLog.create({
        userId: session.userId,
        action: 'AUTH_LOGOUT',
        entityType: 'User',
        entityId: String(session.userId),
        ipAddress: request.ip,
      })
    }

    response.clearCookie('refreshToken', getRefreshCookieOptions())
    return response.status(200).json({ message: 'Déconnexion réussie' })
  } catch (error) {
    return next(error)
  }
}

async function refresh(request, response, next) {
  try {
    const currentToken = request.cookies.refreshToken
    if (!currentToken) {
      return response.status(401).json({ message: 'Aucune session active' })
    }

    const session = await RefreshToken.findOne({
      where: {
        tokenHash: hashToken(currentToken),
        revokedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
      include: [
        {
          model: User,
          as: 'user',
          where: { status: 'ACTIVE' },
          include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
        },
      ],
    })

    if (!session) {
      response.clearCookie('refreshToken', getRefreshCookieOptions())
      return response.status(401).json({ message: 'La session a expiré' })
    }

    await session.update({ revokedAt: new Date() })
    const { accessToken, refreshToken, refreshDuration } = await createSession(session.user, request)
    response.cookie('refreshToken', refreshToken, getRefreshCookieOptions(refreshDuration))

    return response.status(200).json({
      accessToken,
      user: {
        ...session.user.toSafeJSON(),
        permissions:
          session.user.role === 'ADMIN'
            ? ['*']
            : session.user.permissions.map((permission) => permission.code),
      },
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = { login, logout, refresh }
