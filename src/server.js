import 'dotenv/config'
import App from './app.js'

async function bootstrap() {
  const app = new App()
  app.start(process.env.PORT || 3000)
}

bootstrap().catch(console.error)
