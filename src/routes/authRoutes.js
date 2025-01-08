import express from 'express'
import { body } from 'express-validator'
import {
  authenticate,
  validateRefreshToken
} from '../middlewares/authMiddleware.js'
import AuthController from '../controllers/authController.js'

class AuthRoutes {
  constructor(authService) {
    this.authController = new AuthController(authService)
    this.router = express.Router()
    this.initialize()
  }

  getRouter() {
    return this.router
  }

  signupValidation = () => [
    body('firstName')
      .isString()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .isString()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .isString()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
      .withMessage('Password must contain at least one letter and one number')
  ];

  loginValidation = () => [
    body('email')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .isString()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 6 characters')
  ]

  initialize() {
    this.router.post('/signup',
      this.signupValidation(),
      this.authController.signup.bind(this.authController)
    )

    this.router.post('/login',
      this.loginValidation(),
      this.authController.login.bind(this.authController)
    )

    this.router.post('/logout',
      authenticate,
      this.authController.logout.bind(this.authController)
    )

    this.router.post('/refresh-token',
      // security headers
      (req, res, next) => {
        res.set({
          'Cache-Control': 'no-secure',
          'Pragma': 'no-cache'
        })
        next()
      },
      validateRefreshToken,
      this.authController.refreshToken.bind(this.authController)
    )
  }
}

export default AuthRoutes
