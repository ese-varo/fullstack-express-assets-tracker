import express from 'express'
import { body, param } from 'express-validator'
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
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
    body('email')
    .isEmail()
    .withMessage('Invalid email adderss')
    .normalizeEmail()
  ];

  paramIdValidation = () => [
    param('id')
    .isInt()
    .withMessage('ID must be an integer')
  ]

  initialize() {
    // Routes
    this.router.post('/',
      this.createUserValidation(),
      this.userController.createUser.bind(this.userController)
    )

    this.router.get('/', this.userController.getAllUsers.bind(this.userController))

    this.router.get('/:id',
      this.paramIdValidation(),
      this.userController.getUserById.bind(this.userController)
    )

    this.router.patch('/:id',
      this.paramIdValidation(),
      this.createUserValidation(),
      this.userController.updateUser.bind(this.userController)
    )

    this.router.delete('/:id',
      this.paramIdValidation(),
      this.userController.deleteUser.bind(this.userController)
    )
  }
}

export default UserRoutes
