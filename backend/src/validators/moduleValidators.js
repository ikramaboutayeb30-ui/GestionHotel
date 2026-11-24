const { body, param } = require('express-validator')

const positiveId = (name = 'id') => param(name).isInt({ min: 1 }).withMessage('Identifiant invalide')
const dateField = (name, label, optional = false) => {
  const validator = body(name)
  const chain = optional ? validator.optional() : validator.notEmpty().withMessage(`${label} est obligatoire`)
  return chain.isISO8601({ strict: true }).withMessage(`${label} doit être une date valide`)
}
const positiveAmount = (name, label, optional = false) => {
  const validator = body(name)
  const chain = optional ? validator.optional() : validator.notEmpty().withMessage(`${label} est obligatoire`)
  return chain.isFloat({ min: 0 }).withMessage(`${label} doit être un montant positif`)
}

const roomTypeCreate = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Le nom doit contenir entre 2 et 120 caractères'),
  body('description').optional({ values: 'falsy' }).trim().isLength({ max: 5000 }),
  body('capacityAdults').isInt({ min: 1, max: 20 }).withMessage('Capacité adulte invalide'),
  body('capacityChildren').isInt({ min: 0, max: 20 }).withMessage('Capacité enfant invalide'),
  positiveAmount('basePrice', 'Le tarif de base'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Statut invalide'),
]

const roomCreate = [
  body('roomTypeId').isInt({ min: 1 }).withMessage('Type de chambre invalide'),
  body('roomNumber').trim().isLength({ min: 1, max: 30 }).withMessage('Numéro de chambre invalide'),
  body('floor').optional({ values: 'falsy' }).trim().isLength({ max: 30 }),
  body('operationalStatus').optional().isIn(['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE']),
  body('housekeepingStatus').optional().isIn(['CLEAN', 'DIRTY', 'IN_PROGRESS', 'INSPECTED']),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 5000 }),
]

const requestCreate = [
  body('guestId').isInt({ min: 1 }).withMessage('Client invalide'),
  body('roomTypeId').isInt({ min: 1 }).withMessage('Type de chambre invalide'),
  dateField('arrivalDate', 'La date d’arrivée'),
  dateField('departureDate', 'La date de départ'),
  body('adults').isInt({ min: 1, max: 20 }).withMessage('Nombre d’adultes invalide'),
  body('children').optional().isInt({ min: 0, max: 20 }).withMessage('Nombre d’enfants invalide'),
  body('specialRequests').optional({ values: 'falsy' }).trim().isLength({ max: 5000 }),
  positiveAmount('quotedAmount', 'Le montant proposé', true),
  body('source').optional().isIn(['WEBSITE', 'PHONE', 'EMAIL', 'WALK_IN']).withMessage('Source invalide'),
]

const reservationCreate = [
  body('guestId').isInt({ min: 1 }).withMessage('Client invalide'),
  body('roomTypeId').isInt({ min: 1 }).withMessage('Type de chambre invalide'),
  body('roomId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Chambre invalide'),
  dateField('arrivalDate', 'La date d’arrivée'),
  dateField('departureDate', 'La date de départ'),
  body('adults').isInt({ min: 1, max: 20 }).withMessage('Nombre d’adultes invalide'),
  body('children').optional().isInt({ min: 0, max: 20 }).withMessage('Nombre d’enfants invalide'),
  positiveAmount('nightlyRate', 'Le tarif par nuit'),
  positiveAmount('discountAmount', 'La remise', true),
  body('source').optional().isIn(['WEBSITE', 'PHONE', 'EMAIL', 'WALK_IN']),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 5000 }),
]

const paymentCreate = [
  body('reservationId').isInt({ min: 1 }).withMessage('Réservation invalide'),
  body('amount').isFloat({ gt: 0 }).withMessage('Le montant doit être supérieur à zéro'),
  body('paymentMethod').isIn(['CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE', 'OTHER']).withMessage('Mode de paiement invalide'),
  body('paymentType').optional().isIn(['DEPOSIT', 'PAYMENT']).withMessage('Type de paiement invalide'),
  body('status').optional().isIn(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']).withMessage('Statut invalide'),
  body('transactionReference').optional({ values: 'falsy' }).trim().isLength({ max: 191 }),
  body('paidAt').optional({ values: 'falsy' }).isISO8601().withMessage('Date de paiement invalide'),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 5000 }),
]

const userCreate = [
  body('firstName').trim().isLength({ min: 1, max: 100 }).withMessage('Prénom obligatoire'),
  body('lastName').trim().isLength({ min: 1, max: 100 }).withMessage('Nom obligatoire'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Adresse e-mail invalide'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 40 }),
  body('role').isIn(['ADMIN', 'USER']).withMessage('Rôle invalide'),
  body('permissionIds').optional().isArray().withMessage('Les permissions doivent être une liste'),
  body('permissionIds.*').optional().isInt({ min: 1 }).withMessage('Permission invalide'),
]

module.exports = {
  dateField,
  paymentCreate,
  positiveAmount,
  positiveId,
  requestCreate,
  reservationCreate,
  roomCreate,
  roomTypeCreate,
  userCreate,
}

