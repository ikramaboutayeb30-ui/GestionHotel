const crypto = require('crypto')

function generateReference(prefix) {
  const date = new Date().toISOString().slice(2, 10).replaceAll('-', '')
  const random = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `${prefix}-${date}-${random}`
}

module.exports = generateReference

