import HistoryRouter from './shared/core/router.js';
import usersRoutes from './features/users/usersRoutes.js'
import authRoutes from './features/authentication/authRoutes.js'
import assetsRoutes from './features/assets/assetsRoutes.js'

const routes = [
  {
    path: '/',
    render: (_, callback) => callback('<h1>Home Page</h1>'),
    onEnter: () => console.log('Entered Home')
  },
  ...authRoutes,
  ...usersRoutes,
  ...assetsRoutes
];

export const router = new HistoryRouter(routes);
