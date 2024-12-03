import HistoryRouter from './shared/core/router.js';

const routes = [
  {
    path: '/',
    render: () => '<h1>Home Page</h1>',
    onEnter: () => console.log('Entered Home')
  },
  {
    path: '/users/:id',
    render: (params) => `<h1>User Profile for ID: ${params.id}</h1>`,
    onEnter: (params) => console.log(`Viewing user ${params.id}`)
  }
];

const router = new HistoryRouter(routes);
