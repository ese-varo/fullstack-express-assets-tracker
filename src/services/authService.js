import bcrypt from 'bcrypt'
import { Op } from 'sequelize'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

class AuthService {
  constructor(dbService) {
    if (!dbService) {
      throw new Error('Database service is required')
    }
    this.User = dbService.getModel('User')
    this.ACCESS_TOKEN_EXPIRY = '15m'
    this.REFRESH_TOKEN_EXPIRY = '7d'
    this.ABSOLUTE_EXPIRY = 7 * 24 * 60 * 1000 // 7 days in ms
  }

  async signup(signupData) {
    const { password, ...userData } = signupData

    if (!password) {
      throw new Error('Password is required')
    }

    try {
      const passwordHash = await bcrypt.hash(password, 10)
      const user = await this.User.create({
        ...userData,
        passwordHash
      })

      return user.toJSON()
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async login({ email, password }) {
    try {
      const user = await this.User.findOne({ where: { email } })

      if (!user) {
        throw this.createAuthError('Invalid email or password')
      }

      const isValid = await user.validatePassword(password)

      if (!isValid) {
        throw this.createAuthError('Invalid email or password')
      }

      // Reset failed login attemps on successful login
      user.failedLoginAttemps = 0
      user.lastLoginAttemp = new Date()
      await user.save()

      const absoluteExpiry = Date.now() + this.ABSOLUTE_EXPIRY
      const tokens = await this.generateTokens(user, absoluteExpiry)
      return {
        user: user.toJSON(),
        ...tokens
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async generateResetToken(email) {
    const user = await this.User.findOne({ where: { email } })

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return { message: 'If a matching account was found, a password reset email was sent.' }
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    user.resetToken = resetToken
    user.resetTokenExpiresAt = expiresAt
    await user.save()

    return {
      resetToken,
      expiresAt
    }
  }

  async resetPassword(resetToken, newPassword) {
    const user = await this.User.findOne({
      where: {
        resetToken,
        resetTokenExpiresAt: { [Op.gt]: new Date() }
      }
    })

    if (!user) throw this.createAuthError('Invalid or expired reset token')

    await user.setPassword(newPassword)
    user.resetToken = null
    user.resetTokenExpiresAt = null
    await user.save()
  }

  async generateTokens(user, absoluteExpiry) {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    )

    const refreshToken = jwt.sign(
      { userId: user.id, absoluteExpiry },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    )

    // Store refresh token hash
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)
    await this.storeRefreshToken(user.id, refreshTokenHash)
    return { accessToken, refreshToken }
  }

  async storeRefreshToken(userId, token) {
    await this.User.update(
      { refreshToken: token },
      { where: { id: userId } }
    )
  }

  async verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

      // Check absolute axpiry
      if (Date.now() > decoded.absoluteExpiry) {
        throw new Error('Refresh token expired')
      }

      const user = await this.User.findByPk(decoded.userId)
      if (!user) {
        throw new Error('User not found')
      }

      // Verify the stored refresh token
      const isValidToken = await bcrypt.compare(token, user.refreshToken)
      if (!isValidToken) {
        throw new Error('Invalid refresh token')
      }

      return user
    } catch (error) {
      throw this.createAuthError('Invalid refresh token')
    }
  }

  async refreshAccessToken(oldRefreshToken) {
    const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await this.verifyRefreshToken(oldRefreshToken)
    // Invalidate old token immediately
    await this.revokeToken(user.refreshToken)

    // Generate new tokens
    const tokens = await this.generateTokens(user, decoded.absoluteExpiry)
    return tokens
  }

  async revokeToken(token) {
    if (!token) throw this.createAuthError('No token provided')

    const user = await this.User.findOne({
      where: { refreshToken: token }
    })

    if (!user) throw this.createAuthError('Invalid token')

    user.refreshToken = null
    await user.save()
  }

  createAuthError(message) {
    const error = new Error(message)
    error.status = 401
    return error
  }

  handleError(error) {
    console.error('Auth Service Error:', error)

    if (error.name === 'SequelizeValidationError' ||
        error.name === 'SequelizeUniqueConstraintError') {
      const validationError = new Error('Validation Failed')
      validationError.status = 400
      validationError.errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return validationError
    }

    if (error.status) return error

    const serverError = new Error('Internal Server Error')
    serverError.status = 500
    return serverError
  }
}

export default AuthService
