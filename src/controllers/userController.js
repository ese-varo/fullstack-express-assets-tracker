import { validationResult } from 'express-validator'

class UserController {
  constructor(userService) {
    this.userService = userService
  }

  async getAllUsers(req, res) {
    try {
      const result = await this.userService.findAll(req.query)
      res.status(200).json({
        status: 'success',
        ...result
      })
    } catch (error) {
      res.status(error.status || 500).json({
        status: 'error',
        message: error.message
      })
    }
  }

  async getUserById(req, res) {
    try {
      const user = await this.userService.findById(req.params.id)
      res.status(200).json({
        status: 'success',
        data: user
      })
    } catch (error) {
      res.status(error.status || 500).json({
        status: 'error',
        message: error.message
      })
    }
  }

  async updateUser(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }

      const user = await this.userService.update(req.params.id, req.body)
      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      res.status(error.status || 500).json({
        status: 'error',
        message: error.message,
        errors: error.errors || []
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const result = await this.userService.delete(req.params.id)
      res.status(200).json({
        status: 'success',
        message: result.message
      })
    } catch (error) {
      res.status(error.status || 500).json({
        status: 'error',
        message: error.message
      })
    }
  }
}

export default UserController
