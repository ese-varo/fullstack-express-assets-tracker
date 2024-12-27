import stateManager from './state-manager.js'

class HistoryRouter {
  constructor(routes) {
    this.routes = routes;
    this.loadingElement = this.createLoadingElement()
    this.init();
  }

  createLoadingElement() {
    const elem = document.createElement('div')
    elem.innerHTML = '<div class="loading">Loading...</div>'
    return elem
  }

  init() {
    window.addEventListener('popstate', this.handleRouteChange.bind(this));
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.classList.contains('router-link')) {
        e.preventDefault();
        this.navigate(link.getAttribute('href'));
      }
    });
    this.handleRouteChange();
  }

  async handleRouteChange() {
    const path = window.location.pathname;
    const matchedRoute = this.findMatchingRoute(path);

    if (!matchedRoute) {
      this.renderNotFound()
      return
    }

    // Check authentication and authorization
    const user = stateManager.getState('user')
    if (matchedRoute.requiredRole && (!user || user.role !== matchedRoute.requiredRole)) {
      this.renderUnauthorized()
      return
    }

    try {
      const app = document.getElementById('app')
      app.appendChild(this.loadingElement)

      const params = this.extractParams(matchedRoute.path, path)
      await this.renderView(matchedRoute, params)
    } catch (error) {
      console.error('Route error:', error)
      this.renderError(error)
    } finally {
      const app = document.getElementById('app')
      if (app.contains(this.loadingElement)) {
        app.removeChild(this.loadingElement)
      }
    }
  }

  findMatchingRoute(path) {
    return this.routes.find(route =>
      this.matchRoute(route.path, path)
    );
  }

  matchRoute(routePath, currentPath) {
    const routeParts = routePath.split('/');
    const pathParts = currentPath.split('/');

    if (routeParts.length !== pathParts.length) return false;

    return routeParts.every((part, index) =>
      part.startsWith(':') || part === pathParts[index]
    );
  }

  extractParams(routePath, currentPath) {
    const routeParts = routePath.split('/');
    const pathParts = currentPath.split('/');

    return routeParts.reduce((params, part, index) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = pathParts[index];
      }
      return params;
    }, {});
  }

  async renderView(route, params) {
    const app = document.getElementById('app');

    // If component is a function, it's a lazy load
    if (typeof route.component === 'function') {
      const Component = await route.component()
      const instance = new Component()
      instance.mount(app)
      if (route.onEnter) route.onEnter(params)
      return
    }

    if (route.render) {
      route.render(params, (content) => {
        app.innerHTML = content
      })
      if (route.onEneter) route.onEnter(params)
      return
    }
  }

  renderUnauthorized() {
    const app = document.getElementById('app')
    app.innerHTML = '<h1>Unauthorized Access</h1>'
  }

  renderError(error) {
    const app = document.getElementById('app')
    app.innerHTML = `<div class="error">
      <h1>Error</h1>
      <p>${error.message}</p>
    </div>`
  }

  renderNotFound() {
    const app = document.getElementById('app');
    app.innerHTML = '<h1>Page Not Found</h1>';
  }

  navigate(path, pushState = true) {
    if (pushState) {
      window.history.pushState({}, '', path);
    }
    this.handleRouteChange();
  }
}

export default HistoryRouter;
