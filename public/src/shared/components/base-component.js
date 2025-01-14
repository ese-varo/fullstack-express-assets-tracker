import { AuthService } from '../../features/authentication/services/auth-service.js'

export class BaseComponent {
  constructor() {
    this.state = {}
    this._initialized = false
  }

  setState(newState) {
    this.state = { ...this.state, ...newState }
    if (this._initialized) {
      this.render()
    }
  }

  // Template method for component initialization
  async init() {
    if (!this._initialized) {
      await this.onCreate()
      this._initialized = true
      this.render()
      this.afterRender()
    }
  }

  // Lifecycle hooks
  async onCreate() {} // Override for initialization logic
  afterRender() {} // Override for post-render logic
  onDestroy() {} // Override for cleanup logic

  // Abstract method that most be implemented by child classes
  render() {
    throw new Error('render() method must be implemented')
  }

  // NOTE: useful for role-based access control, e.g. crud actions
  checkAccess(requiredRole) {
    const auth = new AuthService()
    const currentUser = auth.getAuthenticagedUser()
    return currentUser && currentUser.role === requiredRole
  }

  // Helper method for event delegation
  delegateEvent(eventType, selector, handler) {
    if (!this.element) {
      console.error('Attempted to delegate event before element was mounted')
      return
    }
    this.element.addEventListener(eventType, (event) => {
      const target = event.target.closest(selector)
      if (target) {
        handler.call(this, event, target)
      }
    })
  }

  // Mount component to DOM
  mount(element) {
    this.element = element
    this.setupEventListeners()
    this.init()
    return this
  }

  // Cleanup and remove component
  destroy() {
    this.onDestroy()
    this.element = null
    this._initialized = false
  }
}
