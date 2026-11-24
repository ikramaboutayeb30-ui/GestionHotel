const express = require('express')
const { body } = require('express-validator')
const { approveRequest, createRequest, deleteRequest, getRequest, listRequests, setRequestStatus, updateRequest } = require('../controllers/reservationRequestController')
const authenticate = require('../middleware/authenticate')
const requirePermission = require('../middleware/requirePermission')
const validateRequest = require('../middleware/validateRequest')
const { positiveId, requestCreate } = require('../validators/moduleValidators')

const router = express.Router()
router.use(authenticate)
router.get('/', requirePermission('request.manage'), listRequests)
router.get('/:id', requirePermission('request.manage'), positiveId(), validateRequest, getRequest)
router.post('/', requirePermission('request.manage'), requestCreate, validateRequest, createRequest)
router.put('/:id', requirePermission('request.manage'), positiveId(), requestCreate, validateRequest, updateRequest)
router.patch('/:id/status', requirePermission('request.manage'), positiveId(), [body('status').isIn(['CONTACTED', 'REJECTED', 'EXPIRED']), body('reason').optional({ values: 'falsy' }).trim().isLength({ max: 500 })], validateRequest, setRequestStatus)
router.post('/:id/approve', requirePermission('request.manage', 'reservation.create'), positiveId(), [body('nightlyRate').optional().isFloat({ min: 0 }), body('discountAmount').optional().isFloat({ min: 0 })], validateRequest, approveRequest)
router.delete('/:id', requirePermission('request.manage'), positiveId(), validateRequest, deleteRequest)
module.exports = router

