import fs from 'fs'
import path from 'path'

class RouteLoader {
  constructor(app, services) {
    this.services = services
    this.app = app
  }

  static resourceMapping = {
    user: 'users',
    asset: 'assets',
    auth: 'auth'
  }

  async loadRoutes(routesDir) {
    const routeFiles = fs.readdirSync(routesDir)
      .filter(file => file.endsWith('Routes.js'))

    for (const file of routeFiles) {
      const routePath = path.join(routesDir, file)
      await this.loadRoute(routePath)
    }
  }

  async loadRoute(routeFilePath) {
    try {
      const routeModule = await import(routeFilePath)
      const RouteClass = routeModule.default

      if (!RouteClass) {
        console.warn(`No default export found in ${routeFilePath}`)
        return
      }

      const resourceName = path.basename(routeFilePath).replace('Routes.js', '').toLowerCase()
      const pluralResourceName = RouteLoader.resourceMapping[resourceName]

      if (!pluralResourceName) {
        throw new Error(
          `No resource mapping found for "${resourceName}". ` +
          `Please add the plural form to RouteLoader.resourceMapping`
        )
      }

      const serviceName = `${resourceName}Service`
      const service = this.services[serviceName]

      if (!service) {
        console.warn(`No service found for ${serviceName}`)
        return
      }

      const routeInstance = new RouteClass(service)
      const routePath = `/api/${pluralResourceName}`

      this.app.use(routePath, routeInstance.getRouter())
      console.log(`Loaded routes for ${routePath}`)
    } catch (error) {
      console.error(`Error loading route from ${path.basename(routeFilePath)}`, error)
    }
  }
}

export default RouteLoader
