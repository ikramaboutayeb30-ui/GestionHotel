const { DataTypes } = require('sequelize')

module.exports = (sequelize) =>
  sequelize.define(
    'UserPermission',
    {
      userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
      permissionId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
    },
    { tableName: 'user_permissions' },
  )

