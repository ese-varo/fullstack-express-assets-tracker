const authRoutes = [
  {
    path: '/signup',
    component: () => import('./pages/signupPage.js')
      .then(m => m.SignupPage),
    onEnter: () => console.log('entered to signup')
  },
  {
    path: '/login',
    component: () => import('./pages/loginPage.js')
      .then(m => m.LoginPage),
    onEnter: () => console.log('entered to login')
  }
]

export default authRoutes
