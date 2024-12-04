class HistoryRouter {
  constructor(routes) {
    this.routes = routes;
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

    this.handleRouteChange();
  }

  handleRouteChange() {
    const path = window.location.pathname;
    const matchedRoute = this.findMatchingRoute(path);

    if (matchedRoute) {
      this.renderView(matchedRoute, this.extractParams(matchedRoute.path, path));
    } else {
      this.renderNotFount();
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

  renderView(route, params) {
    const app = document.getElementById('app');
    route.render(params, (content) => {
      app.innerHTML = content
    });

    if (route.onEnter) route.onEnter(params);
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
