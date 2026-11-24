const express = require('express')
const { body } = require('express-validator')
const { createUser, deactivateUser, getUser, listPermissions, listUsers, updateUser } = require('../controllers/userController')
const authenticate = require('../middleware/authenticate')
const requirePermission = require('../middleware/requirePermission')
const validateRequest = require('../middleware/validateRequest')
const { positiveId, userCreate } = require('../validators/moduleValidators')

const router = express.Router()
router.use(authenticate, requirePermission('user.manage'))
router.get('/permissions', listPermissions)
router.get('/', listUsers)
router.get('/:id', positiveId(), validateRequest, getUser)
router.post('/', userCreate, validateRequest, createUser)
router.put('/:id', positiveId(), [
  body('firstName').optional().trim().isLength({ min: 1, max: 100 }), body('lastName').optional().trim().isLength({ min: 1, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(), body('role').optional().isIn(['ADMIN', 'USER']), body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  body('permissionIds').optional().isArray(), body('password').optional({ values: 'falsy' }).isLength({ min: 8, max: 128 }),
], validateRequest, updateUser)
router.delete('/:id', positiveId(), validateRequest, deactivateUser)
module.exports = router

