const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}))
app.use(express.json())

let notes = []
let nextId = 1

app.get('/notes', (req, res) => { res.json(notes) })
app.post('/notes', (req, res) => {
  const { title = '', description = '' } = req.body || {}
  const note = { id: String(nextId++), title, description }
  notes.push(note)
  res.status(201).json(note)
})
app.patch('/notes/:id', (req, res) => {
  const { id } = req.params
  const idx = notes.findIndex(n => n.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const { title, description } = req.body || {}
  const updated = { ...notes[idx], ...(title !== undefined && { title }), ...(description !== undefined && { description }) }
  notes[idx] = updated
  res.json(updated)
})
app.delete('/notes/:id', (req, res) => {
  const { id } = req.params
  const idx = notes.findIndex(n => n.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  notes.splice(idx, 1)
  res.status(204).end()
})

app.use((req, res) => res.status(404).json({ error: 'Route not found' }))

app.listen(3000, () => console.log('API on http://localhost:3000'))
