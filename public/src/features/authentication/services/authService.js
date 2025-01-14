import { stateManager } from '../../../shared/core/state-manager.js'

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
      throw new Error('No access token available')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`
      }
    })

    // Handle 401 (Unauthorized) - Token might be expired
    if (reponse.status === 401) {
      try {
        await this.refreshAccessToken()
        // Retry the original request with new token
        return this.makeAuthenticatedRequest(url, options)
      } catch (error) {
        // if refresh fails, redirect to login
        this.logout()
        window.location.href = '/login'
      }
    }

    return response
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
