require('dotenv').config()

const app = require('./app')
const ensureDatabase = require('./config/ensureDatabase')
const { sequelize } = require('./models')

const port = Number(process.env.PORT || 5000)

async function startServer() {
  try {
    await ensureDatabase()
    await sequelize.authenticate()
    console.log('MySQL connection established')

    if (process.env.DB_SYNC === 'true') {
      await sequelize.sync({ alter: true })
      console.log('Database models synchronized')
    }

    app.listen(port, () => {
      console.log(`Hotel API listening on http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Unable to start the API:', error.message)
    process.exit(1)
  }
}

startServer()

async function shutdown(signal) {
  console.log(`${signal} received, closing database connection`)
  await sequelize.close()
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
