const { DataTypes } = require('sequelize')

module.exports = (sequelize) =>
  sequelize.define(
    'RefreshToken',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
      expiresAt: { type: DataTypes.DATE, allowNull: false },
      revokedAt: { type: DataTypes.DATE, allowNull: true },
      ipAddress: { type: DataTypes.STRING(45), allowNull: true },
      userAgent: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      tableName: 'refresh_tokens',
      indexes: [
        { fields: ['user_id', 'revoked_at'] },
        { fields: ['expires_at'] },
      ],
    },
  )

