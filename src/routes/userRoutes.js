import express from 'express'
import { body, param } from 'express-validator'
import { authenticate, authorize } from '../middlewares/authMiddleware.js'
import UserController from '../controllers/userController.js'

class UserRoutes {
  constructor(userService) {
    this.userController = new UserController(userService)
    this.router = express.Router()
    this.initialize()
  }

  getRouter() {
    return this.router
  }

  createUserValidation = () => [
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

  paramIdValidation = () => [
    param('id')
    .isInt()
    .withMessage('ID must be an integer')
  ]

  initialize() {
    // Routes
    this.router.get('/',
      authenticate,
      authorize(['admin']),
      this.userController.getAllUsers.bind(this.userController))

    this.router.get('/:id',
      authenticate,
      this.paramIdValidation(),
      this.userController.getUserById.bind(this.userController)
    )

    this.router.patch('/:id',
      authenticate,
      this.paramIdValidation(),
      this.createUserValidation(),
      this.userController.updateUser.bind(this.userController)
    )

    this.router.delete('/:id',
      authenticate,
      authorize(['admin']),
      this.paramIdValidation(),
      this.userController.deleteUser.bind(this.userController)
    )
  }
}

export default UserRoutes
