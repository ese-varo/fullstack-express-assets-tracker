import HistoryRouter from './shared/core/router.js';
import usersRoutes from './features/users/usersRoutes.js'
import authRoutes from './features/authentication/authRoutes.js'

const routes = [
  {
    path: '/',
    render: (_, callback) => callback('<h1>Home Page</h1>'),
    onEnter: () => console.log('Entered Home')
  },
  ...usersRoutes,
  ...authRoutes
];

export const router = new HistoryRouter(routes);
