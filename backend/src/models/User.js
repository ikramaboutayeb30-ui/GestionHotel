const bcrypt = require('bcryptjs')
const { DataTypes, Model } = require('sequelize')

class User extends Model {
  async comparePassword(password) {
    return bcrypt.compare(password, this.passwordHash)
  }

  toSafeJSON() {
    const values = this.get({ plain: true })
    delete values.passwordHash
    return values
  }
}

function initUser(sequelize) {
  User.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      firstName: { type: DataTypes.STRING(100), allowNull: false },
      lastName: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(191), allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING(255), allowNull: false },
      phone: { type: DataTypes.STRING(40), allowNull: true },
      role: {
        type: DataTypes.ENUM('ADMIN', 'USER'),
        allowNull: false,
        defaultValue: 'USER',
      },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      lastLoginAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      indexes: [{ fields: ['role', 'status'] }],
    },
  )

  return User
}

module.exports = initUser

