const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')

const { Permission, RefreshToken, User } = require('../models')

async function authenticate(request, response, next) {
  try {
    const authorization = request.get('authorization')
    if (!authorization?.startsWith('Bearer ')) {
      return response.status(401).json({ message: 'Authentification requise' })
    }

    const token = authorization.slice(7)
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      issuer: 'hotel-management-api',
      audience: 'hotel-management-admin',
    })

    const session = await RefreshToken.findOne({
      where: {
        id: payload.sid,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
    })

    if (!session) {
      return response.status(401).json({ message: 'Cette session n’est plus active' })
    }

    const user = await User.findOne({
      where: { id: payload.sub, status: 'ACTIVE' },
      include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
    })

    if (!user) {
      return response.status(401).json({ message: 'Ce compte utilisateur n’est pas disponible' })
    }

    request.auth = {
      userId: user.id,
      role: user.role,
      sessionId: session.id,
      permissions: user.role === 'ADMIN' ? ['*'] : user.permissions.map(({ code }) => code),
    }
    request.user = user
    return next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return response.status(401).json({ message: 'Jeton d’accès invalide ou expiré' })
    }
    return next(error)
  }
}

module.exports = authenticate
