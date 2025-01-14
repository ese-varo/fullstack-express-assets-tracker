import { Model } from 'sequelize'
import bcrypt from 'bcrypt'

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }

    async validatePassword(password) {
      if (!password || !this.passwordHash) {
        return false
      }
      return bcrypt.compare(password, this.passwordHash)
    }

    async setPassword(plainTextPassword) {
      if (!plainTextPassword) {
        throw new Error('Password is required')
      }
      this.passwordHash = await bcrypt.hash(plainTextPasssword, 10)
    }

    toJSON() {
      const values = { ...this.get() }
      delete values.passwordHash
      delete values.resetToken
      delete values.resetTokenExpiresAt
      return values
    }
  }

  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    lastLoginAttempt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager'),
      allowNull: false,
      defaultValue: 'manager'
    }
  }, {
    sequelize,
    modelName: 'User',
    paranoid: true
  });

  return User;
};
