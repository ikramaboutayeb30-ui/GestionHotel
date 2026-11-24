const { DataTypes } = require('sequelize')

module.exports = (sequelize) =>
  sequelize.define(
    'ReservationRequest',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      requestNumber: { type: DataTypes.STRING(40), allowNull: false, unique: true },
      guestId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      roomTypeId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      arrivalDate: { type: DataTypes.DATEONLY, allowNull: false },
      departureDate: { type: DataTypes.DATEONLY, allowNull: false },
      adults: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 1 },
      children: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 0 },
      specialRequests: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM('PENDING', 'CONTACTED', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      quotedAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
      source: {
        type: DataTypes.ENUM('WEBSITE', 'PHONE', 'EMAIL', 'WALK_IN'),
        allowNull: false,
        defaultValue: 'WEBSITE',
      },
      handledBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      rejectionReason: { type: DataTypes.STRING(500), allowNull: true },
      handledAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'reservation_requests',
      indexes: [
        { fields: ['status', 'arrival_date'] },
        { fields: ['guest_id'] },
      ],
      validate: {
        departureAfterArrival() {
          if (this.arrivalDate && this.departureDate && this.departureDate <= this.arrivalDate) {
            throw new Error('La date de départ doit suivre la date d’arrivée')
          }
        },
      },
    },
  )
