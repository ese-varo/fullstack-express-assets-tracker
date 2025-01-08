import { BasePage } from '../../../shared/components/base-page.js'
import { AuthService } from '../services/auth-service.js'

export class RegisterPage extends BasePage {
  constructor() {
    super()
    this.authService = new AuthService()
    this.debouncedValidate = this.debounce((input) => {
      const error = this.validateField(input.name, input.value)
      this.handleFieldError(input, error)
    }, 500)
    this.state = {
      formData: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      errors: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        general: ''
      },
      isSubmitting: false
    }
  }

  setupEventListeners() {
    super.setupEventListeners()
    this.delegateEvent('input', 'input', this.handleInput)
    this.delegateEvent('submit', 'form', this.handleSubmit)
  }

  debounce(func, wait) {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        func.apply(this, args)
      }, wait)
    }
  }

  // Single field validation
  validateField(name, value) {
    switch(name) {
      case 'firstName':
        if (!value) return 'First Name is required'
        else if (value.length < 3) return 'First Name must be at least 3 characters'
        break
      case 'lastName':
        if (!value) return 'Last Name is required'
        else if (value.length < 3) return 'Last Name must be at least 3 characters'
        break
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value) return 'Email is required'
        else if (!emailRegex.test(value)) return 'Invalid email address'
        break
      case 'password':
        if (!value) return 'Password is required'
        else if (value.length < 8) return 'Password must be at least 8 characters'
        else if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter'
        else if (!/[0-9]/.test(value)) return 'Password must contain at least one number'
        break
      case 'confirmPassword':
        if (!value) return 'Please confirm your password'
        else if (value !== this.state.formData.password) return 'Passwords do not match'
        break
    }
    return ''
  }

  async handleInput(event, input) {
    const { name, value } = input
    this.state.formData[name] = value
    input.dataset.value = value
    this.debouncedValidate(input)
  }

  handleFieldError(input, error) {
    const errorEl = input?.parentElement.querySelector('.error-text')
    if (error) {
      this.state.errors[input.name] = error
      errorEl.textContent = error
      input.classList.add('error')
    } else {
      this.state.errors[input.name] = ''
      errorEl.textContent = ''
      input.classList.remove('error')
    }
  }

  validateForm() {
    // clear general error
    const generalErrorEl = this.element.querySelector('.error-message.general')
    if (generalErrorEl) {
      this.state.errors.general = ''
      generalErrorEl.remove()
    }

    const errorKeys = Object.keys(this.state.formData)
    let errors = {}
    errorKeys.map((key) => {
      errors[key] = this.validateField(key, this.state.formData[key])
    })

    return { ...errors, general: '' }
  }

  async handleSubmit(event, form) {
    event.preventDefault()

    // Validate form
    const errors = this.validateForm()
    const hasErrors = Object.values(errors).some(error => error)

    if (hasErrors) {
      this.setState({ errors })
      return
    }

    try {
      this.setState({ isSubmitting: true })

      // await this.authService.signup(this.state.formData)

      // Redirect to login page
      // window.location.href = '/login'
      const res = await this.authService.signup(this.state.formData)
      console.log('res on submit:', res)
    } catch (error) {
      this.setState({
        errors: {
          ...this.state.errors,
          general: error.message || 'Registration failed. Please try again'
        }
      })
    } finally {
      this.setState({ isSubmitting: false })
    }
  }

  getTemplate() {
    const { formData, errors, isSubmitting } = this.state
    return `
      <div class="registration-page">
        <h1>Create Account</h1>

        ${errors.general ? `
          <div class="error-message general">
            ${errors.general}
          </div>
        ` : ''}

        <form class="registration-form">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value="${formData.firstName}"
              ${isSubmitting ? 'disabled' : ''}
              class="${errors.firstName ? 'error' : ''}"
            />
            <span class="error-text">${errors.firstName || ''}</span>
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value="${formData.lastName}"
              ${isSubmitting ? 'disabled' : ''}
              class="${errors.lastName ? 'error' : ''}"
            />
            <span class="error-text">${errors.lastName || ''}</span>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value="${formData.email}"
              ${isSubmitting ? 'disabled' : ''}
              class="${errors.email ? 'error' : ''}"
            />
            <span class="error-text">${errors.email || ''}</span>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value="${formData.password}"
              ${isSubmitting ? 'disabled' : ''}
              class="${errors.password ? 'error' : ''}"
            />
            <span class="error-text">${errors.password || ''}</span>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value="${formData.confirmPassword}"
              ${isSubmitting ? 'disabled' : ''}
              class="${errors.confirmPassword ? 'error' : ''}"
            />
            <span class="error-text">${errors.confirmPassword || ''}</span>
          </div>

          <button
            type="submit"
            class="submit-btn"
            ${isSubmitting ? 'disabled' : ''}
          >
            Submit
          </button>

          <p class="login-link">
            Already have an account?
            <a href="/login" class="router-link">Log in</a>
          </p>
        </form>
      </div>
    `
  }
}
