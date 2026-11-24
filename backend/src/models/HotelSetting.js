const { DataTypes } = require('sequelize')

module.exports = (sequelize) =>
  sequelize.define(
    'HotelSetting',
    {
      id: { type: DataTypes.TINYINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      email: { type: DataTypes.STRING(191), allowNull: true },
      phone: { type: DataTypes.STRING(40), allowNull: true },
      address: { type: DataTypes.STRING(255), allowNull: true },
      city: { type: DataTypes.STRING(100), allowNull: true },
      country: { type: DataTypes.STRING(100), allowNull: true },
      currencyCode: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'MAD' },
      timezone: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'Africa/Casablanca' },
      checkInTime: { type: DataTypes.TIME, allowNull: true },
      checkOutTime: { type: DataTypes.TIME, allowNull: true },
      taxPercentage: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      logoUrl: { type: DataTypes.STRING(500), allowNull: true },
    },
    { tableName: 'hotel_settings' },
  )

