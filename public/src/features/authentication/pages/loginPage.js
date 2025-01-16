import { BasePage } from '../../../shared/components/base-page.js'
import { AuthService } from '../services/authService.js'
import { debounce } from '../../../shared/utils/helpers.js'
import { validateLoginField } from '../../../shared/utils/validators.js'

export class LoginPage extends BasePage {
  constructor() {
    super()
    this.authService = new AuthService()
    this.debouncedValidate = debounce((input) => {
      const error = validateLoginField(input.name, input.value)
      this.handleFieldError(input, error)
    }, 500).bind(this)
    this.state = {
      formData: {
        email: '',
        password: ''
      },
      errors: {
        email: '',
        password: '',
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
    const generalErrorEl = this.element.querySelector('.error-message.general')
    if (generalErrorEl) {
      this.state.errors.general = ''
      generalErrorEl.remove()
    }

    const errorKeys = Object.keys(this.state.formData)
    let errors = {}
    errorKeys.map((key) => {
      errors[key] = validateLoginField(key, this.state.formData[key])
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
      await this.authService.login(this.state.formData)
      // TODO: Implement redirection
      // look for redirect query param for redirection
      window.location.href = '/users'
    } catch (error) {
      this.setState({
        errors: {
          ...this.state.errors,
          general: error.message || 'Login failed. Please try again'
        }
      })
    } finally {
      this.setState({ isSubmitting: false })
    }
  }

  getTemplate() {
    const { formData, errors, isSubmitting } = this.state
    return `
      <div class="login-page">
        <h1>Login</h1>

        ${errors.general ? `
          <div class="error-message general">
            ${errors.general}
          </div>
        ` : ''}

        <form class="login-form">
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

          <button
            type="submit"
            class="submit-btn"
            ${isSubmitting ? 'disabled' : ''}
          >
            Login
          </button>

          <p class="login-link">
            Don't have an account?
            <a href="/signup" class="router-link">Signup</a>
          </p>
        </form>
      </div>
    `
  }
}
