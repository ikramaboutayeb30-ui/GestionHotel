const { body, param } = require('express-validator')

const optionalText = (field, label, max = 255) =>
  body(field)
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isLength({ max })
    .withMessage(`${label} ne doit pas dépasser ${max} caractères`)

function guestValidators(partial = false) {
  const requiredText = (field, label, max) => {
    const validator = body(field)
    return (partial ? validator.optional() : validator.notEmpty().withMessage(`${label} est obligatoire`))
      .isString()
      .trim()
      .isLength({ min: 1, max })
      .withMessage(`${label} doit contenir entre 1 et ${max} caractères`)
  }

  return [
    requiredText('firstName', 'Le prénom', 100),
    requiredText('lastName', 'Le nom', 100),
    requiredText('phone', 'Le téléphone', 40),
    body('email')
      .optional({ values: 'falsy' })
      .trim()
      .isEmail()
      .withMessage('L’adresse e-mail doit être valide')
      .normalizeEmail()
      .isLength({ max: 191 })
      .withMessage('L’adresse e-mail ne doit pas dépasser 191 caractères'),
    optionalText('nationality', 'La nationalité', 100),
    optionalText('identificationType', 'Le type de pièce', 50),
    optionalText('identificationNumber', 'Le numéro de pièce', 100),
    optionalText('address', 'L’adresse'),
    optionalText('notes', 'Notes', 5000),
  ]
}

const guestIdValidator = param('id').isInt({ min: 1 }).withMessage('L’identifiant du client doit être un entier positif')

module.exports = { guestIdValidator, guestValidators }
