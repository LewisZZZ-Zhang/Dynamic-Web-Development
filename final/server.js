const path = require('path')

const express = require('express')
const Datastore = require('@seald-io/nedb')

const PORT = process.env.PORT || 3000

async function main() {
  const app = express()

  app.use(express.json())
  app.use('/style', express.static(path.join(__dirname, 'style')))

  const pointsDb = new Datastore({
    filename: path.join(__dirname, 'data', 'points.db'),
    autoload: true,
  })
  await pointsDb.autoloadPromise

  const existingCount = await pointsDb.countAsync({})
  if (existingCount === 0) {
    await pointsDb.insertAsync([
      { name: 'Times Square', lat: 40.758, lng: -73.9855 },
      { name: 'Central Park', lat: 40.7812, lng: -73.9665 },
      { name: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969 },
    ])
  }

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
  })

  app.get('/api/points', async (req, res) => {
    const points = await pointsDb.findAsync({}, { name: 1, lat: 1, lng: 1 })
    res.json(points)
  })

  app.post('/api/points', async (req, res) => {
    const { name, lat, lng } = req.body ?? {}

    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: '`name` must be a non-empty string' })
    }
    if (typeof lat !== 'number' || Number.isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ error: '`lat` must be a number between -90 and 90' })
    }
    if (typeof lng !== 'number' || Number.isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ error: '`lng` must be a number between -180 and 180' })
    }

    const doc = await pointsDb.insertAsync({ name: name.trim(), lat, lng })
    res.status(201).json({ _id: doc._id, name: doc.name, lat: doc.lat, lng: doc.lng })
  })

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
