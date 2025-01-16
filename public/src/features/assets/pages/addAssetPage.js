import { BasePage } from '../../../shared/components/base-page.js'
import { AssetsService } from '../services/assetsService.js'
import { stateManager } from '../../../shared/core/state-manager.js'
import { debounce } from '../../../shared/utils/helpers.js'
import { capitalize } from '../../../shared/utils/strings.js'
import { assetTypes } from '../../../shared/utils/validation.js'
import { validateAssetField } from '../../../shared/utils/validators.js'

export class AddAssetPage extends BasePage {
  constructor() {
    super()
    this.assetsService = new AssetsService()
    this.debouncedValidate = debounce((input) => {
      const error = validateAssetField(input.name, input.value)
      this.handleFieldError(input, error)
    }, 500).bind(this)
    this.state = {
      formData: {
        model: '',
        serialNumber: '',
        type: assetTypes[0],
        assetId: '',
        location: '',
        assignedEmployeeId: '',
        assignedEmployeeName: '',
        comments: ''
      },
      errors: {
        model: '',
        serialNumber: '',
        type: '',
        assetId: '',
        location: '',
        assignedEmployeeId: '',
        assignedEmployeeName: '',
        comments: '',
        general: ''
      },
      isSubmitting: false
    }
  }

  setupEventListeners() {
    super.setupEventListeners()
    this.delegateEvent('input', 'input, textarea', this.handleInput)
    this.delegateEvent('change', 'select', this.handleInput)
    this.delegateEvent('submit', 'form', this.handleSubmit)
  }

  // TODO: create helper for handleInput, handleFieldError
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
      errors[key] = validateAssetField(key, this.state.formData[key])
    })

    return { ...errors, general: '' }
  }

  async handleSubmit(event, form) {
    event.preventDefault()
    const errors = this.validateForm()
    const hasErrors = Object.values(errors).some(error => error)

    if (hasErrors) {
      this.setState({ errors })
      return
    }

    try {
      this.setState({ isSubmitting: true })

      // await this.assetsService.add(this.state.formData)
      console.log('new asset data: ', this.state.formData)
      // window.location.href = '/assets'
    } catch (error) {
      this.setState({
        errors: {
          ...this.state.errors,
          general: error.message || 'Asset creation failed. Please try again'
        }
      })
    } finally {
      this.setState({ isSubmitting: false })
    }
  }

  getTemplate() {
    const { formData, errors, isSubmitting } = this.state
    return `
      <div class="add-asset-page">
        <h1>Add Asset</h1>

        ${errors.general ? `
          <div class="error-message general">
            ${errors.general}
          </div>
        ` : ''}

        <form class="asset-form">
          <div class="form-group">
            <label for="model">Model</label>
            <input
              type="text"
              id="model"
              name="model"
              value="${formData.model}"
              ${isSubmitting ? 'disabled' : ''}
              class="${errors.model ? 'error' : ''}"
            />
            <span class="error-text">${errors.model || ''}</span>
          </div>

          <div class="form-group">
            <label for="serialNumber">Serial Number</label>
            <input
              type="text"
              id="serialNumber"
              name="serialNumber"
              value="${formData.serialNumber}"
              ${isSubmitting ? 'disabled' : ''}
              class="${errors.model ? 'error' : ''}"
            />
            <span class="error-text">${errors.serialNumber || ''}</span>
          </div>

          <div class="form-group">
            <label for="type">Type</label>
            <select
              id="type"
              name="type"
              value="${formData.type}"
              ${isSubmitting ? 'disabled' : ''}
              class="${errors.type ? 'error' : ''}"
            >
              <option value="" disabled>Select an asset type</option>
              ${assetTypes.map(asset =>
                `<option value="${asset}">${capitalize(asset)}</option>`
              ).join(',')}
            </select>
            <span class="error-text">${errors.type || ''}</span>
          </div>

          <div class="form-group">
            <label for="assetId">Asset ID</label>
            <input
              type="text"
              id="assetId"
              name="assetId"
              value="${formData.assetId}"
              ${isSubmitting ? 'disabled' : ''}
              class="${errors.assetId ? 'error' : ''}"
            />
            <span class="error-text">${errors.assetId || ''}</span>
          </div>

          <div class="form-group">
            <label for="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value="${formData.location}"
              ${isSubmitting ? 'disabled' : ''}
              class="${errors.location ? 'error' : ''}"
            />
            <span class="error-text">${errors.location || ''}</span>
          </div>

          <div class="form-group">
            <label for="assignedEmployeeId">Assigned Employee ID</label>
            <input
              type="text"
              id="assignedEmployeeId"
              name="assignedEmployeeId"
              value="${formData.assignedEmployeeId}"
              ${isSubmitting ? 'disabled' : ''}
              class="${errors.assignedEmployeeId ? 'error' : ''}"
            />
            <span class="error-text">${errors.assignedEmployeeId || ''}</span>
          </div>

          <div class="form-group">
            <label for="assignedEmployeeName">Assigned Employee Name</label>
            <input
              type="text"
              id="assignedEmployeeName"
              name="assignedEmployeeName"
              value="${formData.assignedEmployeeName}"
              ${isSubmitting ? 'disabled' : ''}
              class="${errors.assignedEmployeeName ? 'error' : ''}"
            />
            <span class="error-text">${errors.assignedEmployeeName || ''}</span>
          </div>

          <div class="form-group">
            <label for="comments">Comments</label>
            <textarea
              id="comments"
              name="comments"
              value="${formData.comments}"
              ${isSubmitting ? 'disabled' : ''}
              class="${errors.comments ? 'error' : ''}"
            ></textarea>
            <span class="error-text">${errors.comments || ''}</span>
          </div>

          <button
            type="submit"
            class="submit-btn"
            ${isSubmitting ? 'disabled' : ''}
          >
            Create
          </button>
        </form>
      </div>
    `
  }
}
