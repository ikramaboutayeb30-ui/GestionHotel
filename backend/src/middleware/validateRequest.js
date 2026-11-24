const { validationResult } = require('express-validator')

function validateRequest(request, response, next) {
  const errors = validationResult(request)
  if (errors.isEmpty()) {
    return next()
  }

  return response.status(422).json({
    message: 'La validation des données a échoué',
    errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
  })
}

module.exports = validateRequest
