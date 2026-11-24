const { DataTypes } = require('sequelize')

module.exports = (sequelize) =>
  sequelize.define(
    'Reservation',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      confirmationNumber: { type: DataTypes.STRING(40), allowNull: false, unique: true },
      guestId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      reservationRequestId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, unique: true },
      roomTypeId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      roomId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      arrivalDate: { type: DataTypes.DATEONLY, allowNull: false },
      departureDate: { type: DataTypes.DATEONLY, allowNull: false },
      adults: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 1 },
      children: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 0 },
      status: {
        type: DataTypes.ENUM('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'),
        allowNull: false,
        defaultValue: 'CONFIRMED',
      },
      source: {
        type: DataTypes.ENUM('WEBSITE', 'PHONE', 'EMAIL', 'WALK_IN'),
        allowNull: false,
        defaultValue: 'PHONE',
      },
      nightlyRate: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      subtotal: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      taxAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
      discountAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
      totalAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      notes: { type: DataTypes.TEXT, allowNull: true },
      createdBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    },
    {
      tableName: 'reservations',
      indexes: [
        { fields: ['arrival_date', 'departure_date', 'status'] },
        { fields: ['room_id', 'arrival_date', 'departure_date'] },
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
