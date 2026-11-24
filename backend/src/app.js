const cookieParser = require('cookie-parser')
const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const authRoutes = require('./routes/authRoutes')
const guestRoutes = require('./routes/guestRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const hotelRoutes = require('./routes/hotelRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const reservationRequestRoutes = require('./routes/reservationRequestRoutes')
const reservationRoutes = require('./routes/reservationRoutes')
const reportRoutes = require('./routes/reportRoutes')
const roomRoutes = require('./routes/roomRoutes')
const roomTypeRoutes = require('./routes/roomTypeRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express()
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(Object.assign(new Error('Cette origine n’est pas autorisée par CORS'), { status: 403 }))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.get('/api/health', (_request, response) => {
  response.status(200).json({ status: 'ok', service: 'hotel-management-api' })
})

app.use('/api/auth', authRoutes)
app.use('/api/guests', guestRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/hotel', hotelRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/requests', reservationRequestRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/room-types', roomTypeRoutes)
app.use('/api/users', userRoutes)

app.use((_request, response) => {
  response.status(404).json({ message: 'Route introuvable' })
})

app.use((error, _request, response, _next) => {
  console.error(error)
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    return response.status(422).json({
      message: 'La validation des données a échoué',
      errors: error.errors.map(({ path, message }) => ({ field: path, message })),
    })
  }
  response.status(error.status || 500).json({
    message: error.message || 'Erreur interne du serveur',
  })
})

module.exports = app
