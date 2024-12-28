import { stateManager } from '../../../shared/core/state-manager.js'

export class AuthService {
  constructor() {
    this.baseUrl = '/api/auth'
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
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()

      // Store user data in state
      stateManager.setState({
        user: data.user
      }, 'user')

      // Store token in localStorage
      localStorage.setItem('token', data.token)

      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  logout() {
    // Clear user from state
    stateManager.setState({
      user: null
    }, 'user')

    // Remove token from localStorage
    localStorage.removeItem('token')
  }

  isAuthenticated() {
    return !!localStorage.getItem('token')
  }
}
