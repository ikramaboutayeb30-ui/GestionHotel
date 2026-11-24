const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const ms = require('ms')

const { RefreshToken } = require('../models')

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function getDuration(value, fallback) {
  const duration = ms(value || fallback)
  if (typeof duration !== 'number') {
    throw new Error(`Invalid token duration: ${value}`)
  }
  return duration
}

async function createSession(user, request) {
  const refreshToken = crypto.randomBytes(64).toString('base64url')
  const refreshDuration = getDuration(process.env.JWT_REFRESH_EXPIRES_IN, '7d')

  const session = await RefreshToken.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + refreshDuration),
    ipAddress: request.ip,
    userAgent: request.get('user-agent')?.slice(0, 500) || null,
  })

  const accessToken = jwt.sign(
    { role: user.role, sid: session.id },
    process.env.JWT_ACCESS_SECRET,
    {
      subject: String(user.id),
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '8h',
      issuer: 'hotel-management-api',
      audience: 'hotel-management-admin',
    },
  )

  return { accessToken, refreshToken, refreshDuration }
}

function getRefreshCookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    ...(maxAge ? { maxAge } : {}),
  }
}

module.exports = {
  createSession,
  getRefreshCookieOptions,
  hashToken,
}

