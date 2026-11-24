require('dotenv').config()

const bcrypt = require('bcryptjs')

const ensureDatabase = require('../config/ensureDatabase')
const { Permission, User, sequelize } = require('../models')

const permissions = [
  ['request.manage', 'Gérer les demandes de réservation'],
  ['reservation.view', 'Consulter les réservations'],
  ['reservation.create', 'Créer des réservations'],
  ['reservation.update', 'Modifier les réservations'],
  ['reservation.cancel', 'Annuler les réservations'],
  ['guest.view', 'Consulter les clients'],
  ['guest.manage', 'Gérer les clients'],
  ['room.view', 'Consulter les chambres'],
  ['room.manage', 'Gérer les chambres'],
  ['payment.view', 'Consulter les paiements'],
  ['payment.create', 'Enregistrer des paiements'],
  ['payment.refund', 'Rembourser des paiements'],
  ['report.view', 'Consulter les rapports'],
  ['user.manage', 'Gérer les utilisateurs et permissions'],
  ['hotel.manage', 'Gérer les paramètres de l’hôtel'],
]

async function seed() {
  try {
    await ensureDatabase()
    await sequelize.authenticate()
    await sequelize.sync()

    await Promise.all(
      permissions.map(([code, name]) => Permission.upsert({ code, name })),
    )

    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    const password = process.env.ADMIN_PASSWORD
    if (!email || !password || password === 'replace-with-a-strong-password') {
      throw new Error('Définissez ADMIN_EMAIL et un ADMIN_PASSWORD robuste dans le fichier .env')
    }

    const [admin, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        firstName: process.env.ADMIN_FIRST_NAME || 'Hôtel',
        lastName: process.env.ADMIN_LAST_NAME || 'Administrateur',
        passwordHash: await bcrypt.hash(password, 12),
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    if (!created && admin.role !== 'ADMIN') {
      await admin.update({ role: 'ADMIN', status: 'ACTIVE' })
    }

    console.log(created ? `Administrateur créé : ${email}` : `Administrateur déjà présent : ${email}`)
    console.log(`${permissions.length} permissions disponibles`)
  } finally {
    await sequelize.close()
  }
}

seed().catch((error) => {
  console.error('Échec de l’initialisation :', error.message)
  process.exitCode = 1
})
