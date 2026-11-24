const express = require('express')
const { createRoom, deleteRoom, getRoom, listRooms, updateRoom } = require('../controllers/roomController')
const authenticate = require('../middleware/authenticate')
const requirePermission = require('../middleware/requirePermission')
const validateRequest = require('../middleware/validateRequest')
const { positiveId, roomCreate } = require('../validators/moduleValidators')

const router = express.Router()
router.use(authenticate)
router.get('/', requirePermission('room.view'), listRooms)
router.get('/:id', requirePermission('room.view'), positiveId(), validateRequest, getRoom)
router.post('/', requirePermission('room.manage'), roomCreate, validateRequest, createRoom)
router.put('/:id', requirePermission('room.manage'), positiveId(), roomCreate, validateRequest, updateRoom)
router.patch('/:id', requirePermission('room.manage'), positiveId(), validateRequest, updateRoom)
router.delete('/:id', requirePermission('room.manage'), positiveId(), validateRequest, deleteRoom)
module.exports = router

