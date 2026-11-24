const express = require('express')
const { body, query } = require('express-validator')
const { availability, changeReservationStatus, createReservation, deleteReservation, getReservation, listReservations, updateReservation } = require('../controllers/reservationController')
const authenticate = require('../middleware/authenticate')
const requirePermission = require('../middleware/requirePermission')
const validateRequest = require('../middleware/validateRequest')
const { positiveId, reservationCreate } = require('../validators/moduleValidators')

const router = express.Router()
router.use(authenticate)
router.get('/availability', requirePermission('reservation.view'), [
  query('roomTypeId').isInt({ min: 1 }), query('arrivalDate').isISO8601({ strict: true }), query('departureDate').isISO8601({ strict: true }),
], validateRequest, availability)
router.get('/', requirePermission('reservation.view'), listReservations)
router.get('/:id', requirePermission('reservation.view'), positiveId(), validateRequest, getReservation)
router.post('/', requirePermission('reservation.create'), reservationCreate, validateRequest, createReservation)
router.put('/:id', requirePermission('reservation.update'), positiveId(), reservationCreate, validateRequest, updateReservation)
router.patch('/:id/status', requirePermission('reservation.update'), positiveId(), [body('status').isIn(['CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW']), body('reason').optional({ values: 'falsy' }).trim().isLength({ max: 500 })], validateRequest, changeReservationStatus)
router.delete('/:id', requirePermission('reservation.cancel'), positiveId(), validateRequest, deleteReservation)
module.exports = router

