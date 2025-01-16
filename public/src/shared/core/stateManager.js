class StateManager {
  constructor() {
    this.state = {}
    this.listeners = new Map()
  }

  initState(initialState) {
    this.state = { ...initialState }
    this.notifyListeners('*')
  }

  getState(slice) {
    if (slice) {
      return this.state[slice]
    }
    return this.state
  }

  setState(updater, slice = '*') {
    if (typeof updater === 'function') {
      this.state = slice ==='*'
        ? updater(this.state)
        : { ...this.state, [slice]: updater(this.state[slice]) }
    } else {
      this.state = slice === '*'
        ? { ...this.state, ...updater }
        : { ...this.state, [slice]: updater }
    }
    this.notifyListeners(slice)
  }

  subscribe(listener, slice = '*') {
    if (!this.listeners.has(slice)) {
      this.listeners.set(slice, new Set())
    }
    this.listeners.get(slice).add(listener)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(slice)
      if (listeners) {
        listeners.delete(listener)
      }
    }
  }

  notifyListeners(slice) {
    if (this.listeners.has(slice)) {
      this.listeners.get(slice).forEach(listener => listener(this.state))
    }
    if (slice !== '*' && this.listeners.has('*')) {
      this.listeners.get('*').forEach(listener => listener(this.state))
    }
  }

  destroy() {
    this.state = {}
    this.listeners.clear()
  }
}

export const stateManager = new StateManager()

// Initialize with default state
stateManager.initState({
  users: null,
  assets: [],
  notifications: []
})

export default stateManager
