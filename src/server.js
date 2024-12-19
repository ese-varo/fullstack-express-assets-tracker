import 'dotenv/config'
import App from './app.js'
import DatabaseServiceProvider from './services/database.js'
import UserService from './services/userService.js'
import config from './config/db.js'


const dbService = await DatabaseServiceProvider.getInstance(config)
const userService = new UserService(dbService)
const dependencies = {
  dbService,
  userService
}

async function bootstrap() {
  const app = new App(dependencies)
  await app.initialize()
  app.start(process.env.PORT || 3000)
}

bootstrap().catch(console.error)
