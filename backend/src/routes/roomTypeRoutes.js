const express = require('express')
const { createRoomType, deleteRoomType, getRoomType, listRoomTypes, updateRoomType } = require('../controllers/roomTypeController')
const authenticate = require('../middleware/authenticate')
const requirePermission = require('../middleware/requirePermission')
const validateRequest = require('../middleware/validateRequest')
const { positiveId, roomTypeCreate } = require('../validators/moduleValidators')

const router = express.Router()
router.use(authenticate)
router.get('/', requirePermission('room.view'), listRoomTypes)
router.get('/:id', requirePermission('room.view'), positiveId(), validateRequest, getRoomType)
router.post('/', requirePermission('room.manage'), roomTypeCreate, validateRequest, createRoomType)
router.put('/:id', requirePermission('room.manage'), positiveId(), roomTypeCreate, validateRequest, updateRoomType)
router.delete('/:id', requirePermission('room.manage'), positiveId(), validateRequest, deleteRoomType)
module.exports = router

