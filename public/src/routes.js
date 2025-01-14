import HistoryRouter from './shared/core/router.js';

const routes = [
  {
    path: '/',
    render: (_, callback) => callback('<h1>Home Page</h1>'),
    onEnter: () => console.log('Entered Home')
  },
  {
    path: '/users/:id',
    render: async (params, callback) => {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        callback(`<h1>${data[0].name}</h1>`)
      } catch (error) {
        callback(`<h1>Error loading user</h1>`)
      }
    },
    onEnter: (params) => console.log(`Viewing user ${params.id}`)
  },
  {
    path: '/users',
    render: (_, callback) => callback('<h1>Users list</h1>'),
    requiredRole: 'admin'
  },
  {
    path: '/signup',
    component: () => import('./features/authentication/pages/register-form.js')
      .then(m => m.RegisterPage),
    onEnter: () => console.log('entered to signup')
  },
  {
    path: '/login',
    component: () => import('./features/authentication/pages/login-form.js')
      .then(m => m.LoginPage),
    onEnter: () => console.log('entered to login')
  }
  // TODO: create route files for each resource
];

export const router = new HistoryRouter(routes);
