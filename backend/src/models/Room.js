const { DataTypes } = require('sequelize')

module.exports = (sequelize) =>
  sequelize.define(
    'Room',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      roomTypeId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      roomNumber: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      floor: { type: DataTypes.STRING(30), allowNull: true },
      operationalStatus: {
        type: DataTypes.ENUM('ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      housekeepingStatus: {
        type: DataTypes.ENUM('CLEAN', 'DIRTY', 'IN_PROGRESS', 'INSPECTED'),
        allowNull: false,
        defaultValue: 'CLEAN',
      },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 'rooms',
      indexes: [{ fields: ['room_type_id', 'operational_status'] }],
    },
  )

