const { DataTypes } = require('sequelize')

module.exports = (sequelize) =>
  sequelize.define(
    'RoomType',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      capacityAdults: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 1 },
      capacityChildren: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 0 },
      basePrice: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
    },
    { tableName: 'room_types' },
  )

