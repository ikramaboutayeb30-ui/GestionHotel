const express = require('express')

const {
  createGuest,
  deleteGuest,
  getGuest,
  listGuests,
  updateGuest,
} = require('../controllers/guestController')
const authenticate = require('../middleware/authenticate')
const requirePermission = require('../middleware/requirePermission')
const validateRequest = require('../middleware/validateRequest')
const { guestIdValidator, guestValidators } = require('../validators/guestValidators')

const router = express.Router()

router.use(authenticate)
router.get('/', requirePermission('guest.view'), listGuests)
router.get('/:id', requirePermission('guest.view'), guestIdValidator, validateRequest, getGuest)
router.post('/', requirePermission('guest.manage'), guestValidators(), validateRequest, createGuest)
router.put('/:id', requirePermission('guest.manage'), guestIdValidator, guestValidators(), validateRequest, updateGuest)
router.patch('/:id', requirePermission('guest.manage'), guestIdValidator, guestValidators(true), validateRequest, updateGuest)
router.delete('/:id', requirePermission('guest.manage'), guestIdValidator, validateRequest, deleteGuest)

module.exports = router

