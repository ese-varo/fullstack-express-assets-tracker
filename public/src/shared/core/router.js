import { AuthService } from '../../features/authentication/services/auth-service.js'
import { stateManager } from './state-manager.js'

class HistoryRouter {
  constructor(routes) {
    this.routes = routes;
    this.authService = new AuthService()
    this.authenticatedRoutes = new Set(['/users', '/assets'])
    this.publicOnlyRoutes = new Set(['/login', '/signup'])
    this.defaultAuthRedirect = '/login'
    this.defaultHomeRedirect = '/'

    this.init();
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
  }

  async checkRouteGuards(pathname) {
    const user = stateManager.getState('user')
    const isAuthenticated = !!user

    const route = this.findMatchingRoute(pathname)

    if (!route) return { allowed: true }

    // Handle public-only routes (login/signup)
    if (this.publicOnlyRoutes.has(pathname) && isAuthenticated) {
      return {
        allowed: false,
        redirect: this.defaultHomeRedirect
      }
    }

    // Handle protected routes
    if (this.authenticatedRoutes.has(pathname)) {
      if (!isAuthenticated) {
        return {
          allowed: false,
          redirect: `${this.defaultAuthRedirect}?redirect=${encodeURIComponent(pathname)}`
        }
      }
    }

    // Check role-based access if required
    if (route.requiredRole && user.role !== route.requiredRole) {
      return {
        allowed: false,
        redirect: this.defaultHomeRedirect,
        error: 'Insuficcient permissions'
      }
    }

    return { allowed: true }
  }

  async handleRouteChange() {
    const pathname = window.location.pathname;

    // Check route guards
    const guardCheck = await this.checkRouteGuards(pathname)

    if (!guardCheck.allowed) {
      if (guardCheck.error) {
        // TODO: implement notifications system
        // Handle unauthorized access (could show a notification)
        stateManager.setState({
          notification: {
            type: 'error',
            message: guardCheck.error
          }
        }, 'notifications')
      }
      this.navigate(guardCheck.redirect)
      return
    }

    // Proceed with normal route handling
    const route = this.findMatchingRoute(pathname)
    if (!route) {
      this.renderNotFound()
      return
    }

    // Call onEnter hook if exists
    if (route.onEnter) {
      const params = this.extractRouteParams(route.path, pathname)
      route.onEnter(params)
    }

    // Render the route
    await this.renderRoute(route, pathname)
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

  extractRouteParams(routePath, currentPath) {
    const routeParts = routePath.split('/');
    const pathParts = currentPath.split('/');

    return routeParts.reduce((params, part, index) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = pathParts[index];
      }
      return params;
    }, {});
  }

  async renderRoute(route, pathname) {
    const app = document.getElementById('app');
    const params = this.extractRouteParams(route.path, pathname)

    if (route.component) {
      const Component = await route.component()
      const instance = new Component()
      instance.mount(app)
    } else if (route.render) {
      route.render(params, (html) => {
        app.innerHTML = html
      })
    }
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

  navigate(path) {
    window.history.pushState(null, '', path);
    this.handleRouteChange();
  }
}

export default HistoryRouter;
