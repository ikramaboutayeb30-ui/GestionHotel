const { DataTypes } = require('sequelize')

module.exports = (sequelize) =>
  sequelize.define(
    'Payment',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      reservationId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      currencyCode: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'MAD' },
      paymentMethod: {
        type: DataTypes.ENUM('CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE', 'OTHER'),
        allowNull: false,
      },
      paymentType: {
        type: DataTypes.ENUM('DEPOSIT', 'PAYMENT', 'REFUND'),
        allowNull: false,
        defaultValue: 'PAYMENT',
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'),
        allowNull: false,
        defaultValue: 'COMPLETED',
      },
      transactionReference: { type: DataTypes.STRING(191), allowNull: true },
      receivedBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      paidAt: { type: DataTypes.DATE, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 'payments',
      indexes: [{ fields: ['reservation_id', 'status'] }, { fields: ['paid_at'] }],
    },
  )

