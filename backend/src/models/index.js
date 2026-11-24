const sequelize = require('../config/database')

const User = require('./User')(sequelize)
const Permission = require('./Permission')(sequelize)
const UserPermission = require('./UserPermission')(sequelize)
const RefreshToken = require('./RefreshToken')(sequelize)
const HotelSetting = require('./HotelSetting')(sequelize)
const Guest = require('./Guest')(sequelize)
const RoomType = require('./RoomType')(sequelize)
const Room = require('./Room')(sequelize)
const ReservationRequest = require('./ReservationRequest')(sequelize)
const Reservation = require('./Reservation')(sequelize)
const Payment = require('./Payment')(sequelize)
const ReservationStatusHistory = require('./ReservationStatusHistory')(sequelize)
const AuditLog = require('./AuditLog')(sequelize)

User.belongsToMany(Permission, {
  through: UserPermission,
  as: 'permissions',
  foreignKey: 'userId',
  otherKey: 'permissionId',
})
Permission.belongsToMany(User, {
  through: UserPermission,
  as: 'users',
  foreignKey: 'permissionId',
  otherKey: 'userId',
})

User.hasMany(RefreshToken, { as: 'refreshTokens', foreignKey: 'userId', onDelete: 'CASCADE' })
RefreshToken.belongsTo(User, { as: 'user', foreignKey: 'userId' })

RoomType.hasMany(Room, { as: 'rooms', foreignKey: 'roomTypeId', onDelete: 'RESTRICT' })
Room.belongsTo(RoomType, { as: 'roomType', foreignKey: 'roomTypeId' })

Guest.hasMany(ReservationRequest, { as: 'reservationRequests', foreignKey: 'guestId' })
ReservationRequest.belongsTo(Guest, { as: 'guest', foreignKey: 'guestId' })
RoomType.hasMany(ReservationRequest, { as: 'reservationRequests', foreignKey: 'roomTypeId' })
ReservationRequest.belongsTo(RoomType, { as: 'roomType', foreignKey: 'roomTypeId' })
User.hasMany(ReservationRequest, { as: 'handledRequests', foreignKey: 'handledBy' })
ReservationRequest.belongsTo(User, { as: 'handler', foreignKey: 'handledBy' })

Guest.hasMany(Reservation, { as: 'reservations', foreignKey: 'guestId' })
Reservation.belongsTo(Guest, { as: 'guest', foreignKey: 'guestId' })
RoomType.hasMany(Reservation, { as: 'reservations', foreignKey: 'roomTypeId' })
Reservation.belongsTo(RoomType, { as: 'roomType', foreignKey: 'roomTypeId' })
Room.hasMany(Reservation, { as: 'reservations', foreignKey: 'roomId' })
Reservation.belongsTo(Room, { as: 'room', foreignKey: 'roomId' })
ReservationRequest.hasOne(Reservation, {
  as: 'reservation',
  foreignKey: 'reservationRequestId',
})
Reservation.belongsTo(ReservationRequest, {
  as: 'reservationRequest',
  foreignKey: 'reservationRequestId',
})
User.hasMany(Reservation, { as: 'createdReservations', foreignKey: 'createdBy' })
Reservation.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' })

Reservation.hasMany(Payment, { as: 'payments', foreignKey: 'reservationId' })
Payment.belongsTo(Reservation, { as: 'reservation', foreignKey: 'reservationId' })
User.hasMany(Payment, { as: 'receivedPayments', foreignKey: 'receivedBy' })
Payment.belongsTo(User, { as: 'receiver', foreignKey: 'receivedBy' })

Reservation.hasMany(ReservationStatusHistory, {
  as: 'statusHistory',
  foreignKey: 'reservationId',
  onDelete: 'CASCADE',
})
ReservationStatusHistory.belongsTo(Reservation, {
  as: 'reservation',
  foreignKey: 'reservationId',
})
User.hasMany(ReservationStatusHistory, { as: 'statusChanges', foreignKey: 'changedBy' })
ReservationStatusHistory.belongsTo(User, { as: 'changedByUser', foreignKey: 'changedBy' })

User.hasMany(AuditLog, { as: 'auditLogs', foreignKey: 'userId' })
AuditLog.belongsTo(User, { as: 'user', foreignKey: 'userId' })

module.exports = {
  sequelize,
  User,
  Permission,
  UserPermission,
  RefreshToken,
  HotelSetting,
  Guest,
  RoomType,
  Room,
  ReservationRequest,
  Reservation,
  Payment,
  ReservationStatusHistory,
  AuditLog,
}

