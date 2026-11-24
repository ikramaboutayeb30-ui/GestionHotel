const { DataTypes } = require('sequelize')

module.exports = (sequelize) =>
  sequelize.define(
    'ReservationStatusHistory',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      reservationId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      previousStatus: { type: DataTypes.STRING(40), allowNull: true },
      newStatus: { type: DataTypes.STRING(40), allowNull: false },
      changedBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      reason: { type: DataTypes.STRING(500), allowNull: true },
    },
    { tableName: 'reservation_status_history', updatedAt: false },
  )

