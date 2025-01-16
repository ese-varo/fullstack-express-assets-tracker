import { BasePage } from '../../../shared/components/base-page.js'
import { AuthService } from '../services/authService.js'
import { debounce } from '../../../shared/utils/helpers.js'
import { validateSignupField } from '../../../shared/utils/validators.js'

export class SignupPage extends BasePage {
  constructor() {
    super()
    this.authService = new AuthService()
    this.debouncedValidate = debounce((input) => {
      const error = validateSignupField(input.name, input.value, this.state.formData)
      this.handleFieldError(input, error)
    }, 500).bind(this)
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
      errors[key] = validateSignupField(key, this.state.formData[key], this.state.formData)
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

      await this.authService.signup(this.state.formData)
      // Redirect to login page
      window.location.href = '/login'
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
            Signup
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
