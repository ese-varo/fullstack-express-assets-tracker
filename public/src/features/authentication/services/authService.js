import { stateManager } from '../../../shared/core/stateManager.js'
import EventBus from '../../../shared/core/eventBus.js'

export class AuthService {
  constructor() {
    this.baseUrl = '/api/auth'
    this.accessToken = localStorage.getItem('accessToken')
    this.initializeAuthState()
  }

  initializeAuthState() {
    const token = localStorage.getItem('accessToken')
    if (token) {
      const userData = this.decodeToken(token)
      stateManager.setState(userData, 'user')
    }
  }

  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      return JSON.parse(window.atob(base64))
    } catch (error) {
      console.error('Token decode failed:', error)
      return null
    }
  }

  async signup(userData) {
    try {
      const response = await fetch(`${this.baseUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const { data } = await response.json()
      localStorage.setItem('accessToken', data.accessToken)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async makeAuthenticatedRequest(url, options = {}) {
    if (!this.accessToken) {
      EventBus.emit('auth:unauthorized', {
        type: 'NO_TOKEN',
        path: window.location.pathname
      })
      return Promise.reject()
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`
      }
    })

    // Handle 401 (Unauthorized) - Token might be expired
    if (response.status === 401) {
      try {
        await this.refreshAccessToken()
        // Retry the original request with new token
        return this.makeAuthenticatedRequest(url, options)
      } catch (error) {
        // if refresh fails, redirect to login
        this.handleUnauthorized(error)
      }
    }

    return response
  }

  async handleUnauthorized() {
    console.error('Refresh token faild:', error)
    this.logout()
    EventBus.emit('auth:unauthorized', {
      type: 'SESSION_EXPIRED',
      path: window.location.pathname
    })
    return Promise.reject()
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseURL}/refresh-token`, {
        method: 'POST',
        credentials: 'include' // Important for sending the refresh token cookie
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      this.accessToken = data.accessToken
      localStorage.setItem('accessToken', this.accessToken)
    } catch (error) {
      console.error('Token refresh failed:', error)
      throw error;
    }
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        credentials: 'include'
      })

      localStorage.removeItem('accessToken')
      this.accessToken = null
      // Clear user from state
      stateManager.setState({
        user: null
      }, 'user')
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  getAuthenticatedUser() {
    return this.accessToken ? this.decodeToken(this.accessToken) : null
  }

  isAuthenticated() {
    return !!localStorage.getItem('accessToken')
  }
}
