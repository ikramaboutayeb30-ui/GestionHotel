const { DataTypes } = require('sequelize')

module.exports = (sequelize) =>
  sequelize.define(
    'AuditLog',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      action: { type: DataTypes.STRING(100), allowNull: false },
      entityType: { type: DataTypes.STRING(100), allowNull: false },
      entityId: { type: DataTypes.STRING(100), allowNull: true },
      oldValues: { type: DataTypes.JSON, allowNull: true },
      newValues: { type: DataTypes.JSON, allowNull: true },
      ipAddress: { type: DataTypes.STRING(45), allowNull: true },
    },
    {
      tableName: 'audit_logs',
      updatedAt: false,
      indexes: [
        { fields: ['entity_type', 'entity_id'] },
        { fields: ['user_id', 'created_at'] },
      ],
    },
  )

