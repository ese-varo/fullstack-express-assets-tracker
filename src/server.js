import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')))

// Catch-all route for SPA
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.includes('.')) {
    return next()
  }
  res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

app.get('/api/users', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.json([{ id: 1, name: 'Alice' }, { id: 2, name: 'Tyler' }])
})

app.listen(port, () => {
  console.log('Express started on port 3000')
})
