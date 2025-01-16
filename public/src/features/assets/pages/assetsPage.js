import { AssetsService } from '../services/assetsService.js'
import { BasePage } from '../../../shared/components/base-page.js'
import { stateManager } from '../../../shared/core/stateManager.js'

export class AssetsPage extends BasePage {
  constructor() {
    super()
    this.assetsService = new AssetsService()
  }

  async onCreate() {
    stateManager.setState({ loading: true }, 'assetLoading')
    try {
      // const assets = await this.assetsService.getAssets()
      const assets = [
        { model: 'Dell XPS 15', serial_number: '123ALSKDJ2', status: 'allocated' },
        { model: 'Iphone 16 Pro', serial_number: '3SLDK23LSL', status: 'unallocated' },
        { model: 'Logitech MX keyboard', serial_number: 'ASLDKJ320KD', status: 'down' },
      ]
      stateManager.setState(assets || [], 'assets')
    } catch (error) {
      console.error('Error fetching assets:', error)
      stateManager.setState([], 'assets')
      stateManager.setState({
        notification: {
          type: 'error',
          message: 'Failed to fetch assets. Please try again later.'
        }
      }, 'notifications')
    } finally {
      stateManager.setState({ loading: false }, 'assetsLoading')
    }
  }

  hasAssets(assets) {
    return Array.isArray(assets) && assets.length > 0
  }

  printAsset(asset) {
    return `
      <li>
        <p>Model: ${asset.model}</p>
        <p>Serial Number: ${asset.serial_number}</p>
        <p>Status: ${asset.status}</p>
      </li>
    `
  }

  renderAssets(assets) {
    if (!this.hasAssets(assets)) {
      return '<p>No items found</p>'
    }

    return `
      <ul>
        ${assets.map(asset => this.printAsset(asset)).join('')}
      </ul>
    `
  }

  getTemplate() {
    const assets = stateManager.getState('assets')
    const { loading } = stateManager.getState('assetsLoading')

    if (loading) {
      return `
      <div class="assets-page">
        <h1>Assets List</h1>
        <p class="loading">Loading...</p>
      </div>
      `
    }

    return `
      <div class="assets-page">
        <h1>Assets List</h1>
        ${this.renderAssets(assets)}
      </div>
    `
  }
}
