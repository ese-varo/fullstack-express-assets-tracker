import 'dotenv/config'
import App from './app.js'
import DatabaseServiceProvider from './services/database.js'
import UserService from './services/userService.js'
import AuthService from './services/authService.js'
import config from './config/db.js'


const dbService = await DatabaseServiceProvider.getInstance(config)
const userService = new UserService(dbService)
const authService = new AuthService(dbService)
const dependencies = {
  dbService,
  userService,
  authService
}

async function bootstrap() {
  const app = new App(dependencies)
  await app.initialize()
  app.start(process.env.PORT || 3000)
}

bootstrap().catch(console.error)
