const userRoutes = [
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
  }
]

export default userRoutes
