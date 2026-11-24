const express = require('express')
const { query } = require('express-validator')
const { getSummary } = require('../controllers/reportController')
const authenticate = require('../middleware/authenticate')
const requirePermission = require('../middleware/requirePermission')
const validateRequest = require('../middleware/validateRequest')

const router = express.Router()
router.use(authenticate, requirePermission('report.view'))
router.get('/summary', [query('from').optional().isISO8601({ strict: true }), query('to').optional().isISO8601({ strict: true })], validateRequest, getSummary)
module.exports = router
