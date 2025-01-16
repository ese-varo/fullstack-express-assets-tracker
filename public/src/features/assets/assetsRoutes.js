const assetsRoutes = [
  {
    path: '/assets',
    component: () => import('./pages/assetsPage.js')
      .then(m => m.AssetsPage),
    onEnter: () => console.log('entered assets page')
  },
  {
    path: '/assets/add',
    component: () => import('./pages/addAssetPage.js')
      .then(m => m.AddAssetPage),
    onEnter: () => console.log('entered add asset page')
  }
]

export default assetsRoutes
