const express = require('express')
const rateLimit = require('express-rate-limit')
const { body } = require('express-validator')

const { login, logout, refresh } = require('../controllers/authController')
const validateRequest = require('../middleware/validateRequest')

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.' },
})

router.post(
  '/login',
  loginLimiter,
  [
    body('email').trim().isEmail().normalizeEmail().withMessage('Une adresse e-mail valide est obligatoire'),
    body('password').isString().notEmpty().withMessage('Le mot de passe est obligatoire'),
  ],
  validateRequest,
  login,
)

router.post('/logout', logout)
router.post('/refresh', refresh)

module.exports = router
