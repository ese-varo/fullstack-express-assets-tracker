import { Sequelize } from 'sequelize'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'

class DatabaseService {
  constructor(config, options = {}) {
    this.config = config
    this.options = {
      sync: {
        force: false,
        alter: true,
        ...options.sync
      }
    }
    this.instance = null
    this.models = {}
  }

  async initialize() {
    this.instance = new Sequelize(this.config)
    await this.importModels()
    return this
  }

  getInstance() {
    if (!this.instance) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return this.instance
  }

  async importModels() {
    try {
      const __filename = fileURLToPath(import.meta.url)
      const __dirname = path.dirname(__filename)
      const modelsPath = path.join(__dirname, '../models')

      const files = await fs.readdir(modelsPath)
      for (const file of files) {
        if (file.endsWith('.js') && file !== 'index.js') {
          const modelPath = path.join(modelsPath, file)
          const { default: modelDefiner } = await import(modelPath)
          const model = modelDefiner(this.instance, Sequelize.DataTypes)
          this.models[model.name] = model
        }
      }

      Object.keys(this.models).forEach(modelName => {
        if (this.models[modelName].associate) {
          this.models[modelName].associate(this.models)
        }
      });
    } catch (error) {
      console.error('Error importing models:', error)
      throw error
    }
  }

  getModel(modelName) {
    if (!this.models[modelName]) {
      throw new Error(`Model ${modelName} not found`)
    }
    return this.models[modelName]
  }

  async syncDatabase(force = false) {
    const sequelize = this.getInstance()

    try {
      const syncOptions = {
        force: force || this.options.sync.force,
        alter: this.options.sync.alter
      }

      if (process.env.NODE_ENV === 'production' && syncOptions.force) {
        throw new Error('Force sync is not allowed in production environment')
      }

      await sequelize.sync(syncOptions)

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

class DatabaseServiceProvider {
  static #instance = null

  static async getInstance(config, options = {}) {
    if (!this.#instance) {
      this.#instance = new DatabaseService(config, options)
      await this.#instance.initialize()
    }
    return this.#instance
  }
}

export default DatabaseServiceProvider
