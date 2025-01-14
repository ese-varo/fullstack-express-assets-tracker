import { AuthService } from './features/authentication/services/authService.js'
import { stateManager } from './shared/core/state-manager.js'
import { router } from './routes.js'

class App {
  constructor() {
    this.authService = new AuthService()
  }

  async initialize() {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        const userData = this.authService.decodeToken(token)

        if (userData.exp * 1000 < Date.now()) {
          // Token expired
          localStorage.removeItem('accessToken')
          router.navigate('/login')
          return
        }

        stateManager.setState(userData, 'user')
      }

      router.handleRouteChange()

      window.addEventListener('unhandledrejection', this.handleError)
    } catch (error) {
      console.error('App initialization failed:', error)
      router.navigate('/login')
    }
  }

  handleError(event) {
    console.error('Unhandled error:', event.reason)
    if(event.reason?.message?.includes('unauthorized')) {
      router.navigate('/login')
    }
  }
}

const app = new App()
app.initialize()

export default app
