const { AuditLog, HotelSetting } = require('../models')

const editableFields = [
  'name', 'description', 'email', 'phone', 'address', 'city', 'country', 'currencyCode',
  'timezone', 'checkInTime', 'checkOutTime', 'taxPercentage', 'logoUrl',
]

function pickSettings(body) {
  return Object.fromEntries(editableFields.filter((field) => Object.hasOwn(body, field)).map((field) => [field, body[field] === '' ? null : body[field]]))
}

async function getSettings(_request, response, next) {
  try {
    const [settings] = await HotelSetting.findOrCreate({
      where: { id: 1 },
      defaults: {
        name: 'Mon hôtel',
        country: 'Maroc',
        currencyCode: 'MAD',
        timezone: 'Africa/Casablanca',
        checkInTime: '14:00:00',
        checkOutTime: '12:00:00',
      },
    })
    return response.status(200).json({ data: settings })
  } catch (error) {
    return next(error)
  }
}

async function updateSettings(request, response, next) {
  try {
    const [settings] = await HotelSetting.findOrCreate({
      where: { id: 1 },
      defaults: { name: 'Mon hôtel', country: 'Maroc', currencyCode: 'MAD', timezone: 'Africa/Casablanca' },
    })
    const oldValues = settings.toJSON()
    await settings.update(pickSettings(request.body))
    await AuditLog.create({
      userId: request.auth.userId,
      action: 'HOTEL_UPDATE',
      entityType: 'HotelSetting',
      entityId: String(settings.id),
      oldValues,
      newValues: settings.toJSON(),
      ipAddress: request.ip,
    })
    return response.status(200).json({ message: 'Informations de l’hôtel mises à jour', data: settings })
  } catch (error) {
    return next(error)
  }
}

module.exports = { getSettings, updateSettings }

