import { Op } from 'sequelize'

class UserService {
  constructor(dbService) {
    if (!dbService) {
      throw new Error('Database service is required')
    }
    this.User = dbService.getModel('User')
  }

  async findAll(query) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = query

      const offset = (page - 1) * limit

      const whereClause = search ? {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ]
      } : {};

      const { count, rows } = await this.User.findAndCountAll({
        where: whereClause,
        order: [[sortBy, sortOrder]],
        limit: Number(limit),
        offset: Number(offset)
      })

      return {
        users: rows,
        total: count,
        page: Number(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async findById(id) {
    try {
      const user = await this.User.findByPk(id)
      if (!user) {
        const error = new Error('User not found')
        error.status = 404
        throw error
      }
      return user
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async update(id, userData) {
    try {
      const [updatedCount, [updatedUser]] = await this.User.update(userData, {
        where: { id },
        returning: true
      })

      if (updatedCount === 0) {
        const error = new Error('User not found')
        error.status = 404
        throw error
      }

      return updatedUser
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async delete(id) {
    try {
      const deletedCount = await this.User.destroy({
        where: { id }
      });

      if (deletedCount === 0) {
        const error = new Error('User not found')
        error.status = 404
        throw error
      }

      return { message: 'User successfully deleted' }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  handleError(error) {
    console.error('User Service Error:', error)

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

    // If it's an existing error with status, return it
    if (error.status) return error

    // Generic server error
    const serverError = new Error('Internal Server Error')
    serverError.status = 500
    return serverError
  }
}

export default UserService
