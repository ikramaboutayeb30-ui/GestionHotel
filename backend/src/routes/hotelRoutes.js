const express = require('express')
const { body } = require('express-validator')
const { getSettings, updateSettings } = require('../controllers/hotelController')
const authenticate = require('../middleware/authenticate')
const requirePermission = require('../middleware/requirePermission')
const validateRequest = require('../middleware/validateRequest')

const router = express.Router()
router.use(authenticate)
router.get('/', getSettings)
router.put('/', requirePermission('hotel.manage'), [
  body('name').optional().trim().isLength({ min: 2, max: 150 }),
  body('email').optional({ values: 'falsy' }).isEmail().normalizeEmail(),
  body('currencyCode').optional().isLength({ min: 3, max: 3 }),
  body('taxPercentage').optional().isFloat({ min: 0, max: 100 }),
], validateRequest, updateSettings)
module.exports = router

