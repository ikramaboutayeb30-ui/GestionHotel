const { DataTypes } = require('sequelize')

module.exports = (sequelize) =>
  sequelize.define(
    'Guest',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      firstName: { type: DataTypes.STRING(100), allowNull: false },
      lastName: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(191), allowNull: true },
      phone: { type: DataTypes.STRING(40), allowNull: false },
      nationality: { type: DataTypes.STRING(100), allowNull: true },
      identificationType: { type: DataTypes.STRING(50), allowNull: true },
      identificationNumber: { type: DataTypes.STRING(100), allowNull: true },
      address: { type: DataTypes.STRING(255), allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 'guests',
      indexes: [{ fields: ['email'] }, { fields: ['phone'] }],
    },
  )

