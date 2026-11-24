const express = require('express')
const { body } = require('express-validator')
const { createPayment, deletePayment, getPayment, listPayments, refundPayment, updatePayment } = require('../controllers/paymentController')
const authenticate = require('../middleware/authenticate')
const requirePermission = require('../middleware/requirePermission')
const validateRequest = require('../middleware/validateRequest')
const { paymentCreate, positiveId } = require('../validators/moduleValidators')

const router = express.Router()
router.use(authenticate)
router.get('/', requirePermission('payment.view'), listPayments)
router.get('/:id', requirePermission('payment.view'), positiveId(), validateRequest, getPayment)
router.post('/', requirePermission('payment.create'), paymentCreate, validateRequest, createPayment)
router.put('/:id', requirePermission('payment.create'), positiveId(), paymentCreate, validateRequest, updatePayment)
router.post('/:id/refund', requirePermission('payment.refund'), positiveId(), [body('amount').isFloat({ gt: 0 }), body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 5000 })], validateRequest, refundPayment)
router.delete('/:id', requirePermission('payment.create'), positiveId(), validateRequest, deletePayment)
module.exports = router

