/**
 * Attention API server
 *
 * Persists tomb click counts to data/attention.json.
 * Run alongside Vite:  node server.js
 *
 * Endpoints:
 *   GET  /api/attention       → { "1": 3, "2": 0, … }
 *   POST /api/attention/:id   → increments tomb, returns updated map
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = resolve(__dirname, 'data/attention.json')

function readData() {
  return JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
}

function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n')
}

const app = express()
app.use(cors())
app.use(express.json())

// Get all attention counts
app.get('/api/attention', (_req, res) => {
  res.json(readData())
})

// Increment a single tomb's attention
app.post('/api/attention/:id', (req, res) => {
  const data = readData()
  const id = req.params.id
  if (!(id in data)) return res.status(404).json({ error: 'Unknown tomb' })
  data[id] = (data[id] || 0) + 1
  writeData(data)
  res.json(data)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Attention API running → http://localhost:${PORT}`)
})
