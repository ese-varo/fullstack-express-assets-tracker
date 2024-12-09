import { Sequelize } from 'sequelize'
import config from '../config/db.js'

class DatabaseService {
  constructor() {
    this.instance = null
  }

  getInstance() {
    if (!this.instance) {
      this.instance = new Sequelize(config)
    }
    return this.instance
  }

  async syncDatabase(force = false) {
    const sequelize = this.getInstance()

    try {
      if (process.env.NODE_ENV === 'production' && force) {
        throw new Error('Force sync is not allowed in production environment')
      }

      await sequelize.sync({
        force,
        alter: !force,
      })

      console.log('Database models synchronized successfully')
    } catch (error) {
      console.error('Failed to synchronize database:', error)
      throw error
    }
  }

  async testConnection() {
    try {
      await this.getInstance().authenticate()
      console.log('Database connection has been established successfully.')
    } catch (error) {
      console.error('Unable to connect to the database:', error)
      throw error
    }
  }

  async closeConnection() {
    if (this.instance) {
      await this.instance.close()
      console.log('Database connection closed')
    }
  }
}

export default DatabaseService
