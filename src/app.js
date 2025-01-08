import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import UserRoutes from './routes/userRoutes.js'
import RouteLoader from './routes/routeLoader.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class App {
  constructor(dependencies = {}) {
    const {
      expressApp = express(),
      dbService,
      userService,
      authService,
      logger = console
    } = dependencies
    this.app = expressApp
    this.services = {
      dbService,
      userService,
      authService,
    }
    this.logger = logger
    this.server = null
    this.routeLoader = new RouteLoader(this.app, this.services)
  }

  async initialize() {
    this.initializeMiddlewares()
    this.initializeRoutes()
    this.initializeDatabase()
    return this
  }

  initializeMiddlewares() {
    // Serve static files from the public directory
    this.app.use(express.static(path.join(__dirname, '../public')))
    this.app.use(express.json())
    // Catch-all route for SPA
    this.app.use((req, res, next) => {
      if (req.path.startsWith('/api/') || req.path.includes('.')) {
        return next()
      }
      res.sendFile(path.join(__dirname, '../public', 'index.html'))
    })
  }

  async initializeRoutes() {
    const routesDir = path.join(__dirname, 'routes')
    await this.routeLoader.loadRoutes(routesDir)
  }

  async initializeDatabase() {
    try {
      await this.services.dbService.testConnection()
      await this.services.dbService.syncDatabase(
        process.env.NODE_ENV === 'development'
      )
    } catch (error) {
      console.error('Database initialization failed:', error)
      process.exit(1)
    }
  }

  start(port) {
    this.setupGracefulShutdown()

    this.server = this.app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  }

  setupGracefulShutdown() {
    const signals = ['SIGINT', 'SIGTERM']

    const shutdown = async (signal) => {
      this.logger.info(`Received ${signal}. Starting graceful shutdown...`)

      try {
        // Parallel shutdown of resources
        await Promise.all([
          this.stopServer(),
          this.services.dbService.closeConnection()
        ]);

        this.logger.info('Graceful shutdown completed successfully')
        process.exit(0)
      } catch (error) {
        this.logger.error('Error during graceful shutdown: ', error)
        process.exit(1)
      }
    }

    signals.forEach(signal =>
      process.on(signal, () => shutdown(signal))
    )
  }

  async stopServer() {
    return new Promise((resolve, reject) => {
      if (!this.server) return resolve()

      this.server.close(err => {
        if (err) reject(err)
        else resolve()
      })
    });
  }
}

export default App
