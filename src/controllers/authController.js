import { validationResult } from 'express-validator'

class AuthController {
  constructor(authService) {
    this.authService = authService
  }

  async signup(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        })
      }

      const user = await this.authService.signup(req.body)
      res.status(201).json({
        status: 'success',
        data: user
      })
    } catch (error) {
      res.status(error.status || 500).json({
        status: 'error',
        message: error.message,
        errors: error.errors || []
      })
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        })
      }

      const { user, tokens } = await this.authService.login(req.body)
      // const tokens = await this.authService.generateTokens(user)

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })

      res.json({
        status: 'success',
        data: {
          user,
          accessToken: tokens.accessToken
        }
      })
    } catch (error) {
      res.status(error.status || 500).json({
        status: 'error',
        message: error.message
      })
    }
  }

  async logout(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken
      await this.authService.revokeToken(refreshToken)

      res.clearCookie('refreshToken')
      res.json({ status: 'success' })
    } catch (error) {
      res.status(error.status || 500).json({
        status: 'error',
        message: error.message
      })
    }
  }

  async refreshToken(req, res) {
    try {
      const tokens = await this.authService.refreshAccessToken(req.refreshToken)

      // Set new refresh token cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })

      res.json({
        status: 'success',
        data: { accessToken: tokens.accessToken }
      })
    } catch (error) {
      res.status(error.status || 500).json({
        status: 'error',
        message: error.message
      })
    }
  }
}

export default AuthController
