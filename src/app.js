import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import DatabaseService from './services/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class App {
  constructor() {
    this.app = express()
    this.server = null
    this.dbService = new DatabaseService()
    this.isShuttingDown = false
    this.initializeMiddlewares()
    this.initializeRoutes()
    this.initializeDatabase()
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

  initializeRoutes() {
    this.app.get('/api/users', (req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.json([{ id: 1, name: 'Alice' }, { id: 2, name: 'Tyler' }])
    })
  }

  async initializeDatabase() {
    try {
      await this.dbService.testConnection()
      await this.dbService.syncDatabase(
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
    const shutdown = async (signal) => {
      if (this.isShuttingDown) return
      this.isShuttingDown = true

      console.log(`Received ${signal}. Starting graceful shutdown...`)

      try {
        if (this.server) {
          await new Promise((resolve, reject) => {
            this.server.close((err) => {
              if (err) reject(err)
              else resolve()
            })
          })
        }

        await this.dbService.closeConnection()

        // Close any other resource connections (e.g., Redis, message queyes)
        console.log('Graceful shutdown completed successfully')
        process.exit(0)
      } catch (error) {
        console.log('Error during graceful shutdown: ', error)
        process.exit(1)
      }
    }

    // Register shutdown handlers
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  }
}

export default App
