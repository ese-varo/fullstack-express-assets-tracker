import { BaseComponent } from './base-component.js'
import { stateManager } from '../core/stateManager.js'

export class BasePage extends BaseComponent {
  constructor() {
    super()
    this.bindMethods()
  }

  bindMethods() {
    this.handleError = this.handleError.bind(this)
    this.updateState = this.updateState.bind(this)
  }

  setupEventListeners() {
    // subscribe to relevant state changes
    this.unsubscribeFromState = stateManager.subscribe(this.updateState)
  }

  updateState(newState) {
    this.setState(newState)
  }

  handleError(error) {
    console.error('Page error:', error)
    this.setState({ error: error.message })
  }

  renderLoading() {
    return '<div class="loading">Loading...</div>'
  }

  renderError() {
    if (!this.state.error) return ''
    return `
      <div class="error-message">
        <p>${this.state.error}</p>
        <button class="dismiss-error">Dismiss</button>
      </div>
    `
  }

  getTemplate() {
    return '<div>Base page template</div>'
  }

  render() {
    if (!this.element) return

    if (this.state.loading) {
      this.element.innerHTML = this.renderLoading()
      return
    }

    this.element.innerHTML = `
      ${this.renderError()}
      ${this.getTemplate()}
    `

    const dismissBtn = this.element.querySelector('.dismiss-error')
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        this.setState({ error: null })
      })
    }
  }

  onDestroy() {
    if (this.unsubscribeFromState) {
      this.unsubscribeFromState()
    }
    super.onDestroy()
  }
}
