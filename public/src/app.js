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
  }
];

const router = new HistoryRouter(routes);
