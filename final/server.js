const path = require('path')

const express = require('express')
const Datastore = require('@seald-io/nedb')

const PORT = process.env.PORT || 3000

async function main() {
  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use('/style', express.static(path.join(__dirname, 'style')))

  const pointsDb = new Datastore({
    filename: path.join(__dirname, 'data', 'points.db'),
    autoload: true,
  })
  await pointsDb.autoloadPromise

  const existingCount = await pointsDb.countAsync({})
  if (existingCount === 0) {
    await pointsDb.insertAsync([
      {
        name: 'Times Square',
        movieName: 'Spider-Man',
        lat: 40.758,
        lng: -73.9855,
        uploads: 120,
        sceneTimestamp: '00:43:12',
        description: 'Peter swings across bright billboards and packed streets.',
        stillUrl: 'https://picsum.photos/seed/timessquare/1000/560',
        upvotes: 18,
        downvotes: 2,
        comments: [{ text: 'Iconic city energy in this shot.', createdAt: new Date().toISOString() }],
      },
      {
        name: 'Central Park',
        movieName: 'Home Alone 2',
        lat: 40.7812,
        lng: -73.9665,
        uploads: 95,
        sceneTimestamp: '01:12:45',
        description: 'Kevin crosses snowy paths while searching for help.',
        stillUrl: 'https://picsum.photos/seed/centralpark/1000/560',
        upvotes: 11,
        downvotes: 1,
        comments: [{ text: 'The winter atmosphere is great here.', createdAt: new Date().toISOString() }],
      },
      {
        name: 'Brooklyn Bridge',
        movieName: 'I Am Legend',
        lat: 40.7061,
        lng: -73.9969,
        uploads: 88,
        sceneTimestamp: '00:16:27',
        description: 'An empty skyline shot emphasizing isolation.',
        stillUrl: 'https://picsum.photos/seed/brooklynbridge/1000/560',
        upvotes: 15,
        downvotes: 0,
        comments: [{ text: 'One of the most memorable visuals.', createdAt: new Date().toISOString() }],
      },
    ])
  }

  const legacyDocs = await pointsDb.findAsync({
    $or: [
      { movieName: { $exists: false } },
      { uploads: { $exists: false } },
      { sceneTimestamp: { $exists: false } },
      { description: { $exists: false } },
      { stillUrl: { $exists: false } },
      { upvotes: { $exists: false } },
      { downvotes: { $exists: false } },
      { comments: { $exists: false } },
    ],
  })
  for (const doc of legacyDocs) {
    await pointsDb.updateAsync(
      { _id: doc._id },
      {
        $set: {
          movieName: typeof doc.movieName === 'string' && doc.movieName.trim() ? doc.movieName.trim() : doc.name,
          uploads: typeof doc.uploads === 'number' && doc.uploads >= 0 ? doc.uploads : 0,
          sceneTimestamp: typeof doc.sceneTimestamp === 'string' && doc.sceneTimestamp.trim() ? doc.sceneTimestamp.trim() : '00:00:00',
          description: typeof doc.description === 'string' ? doc.description : '',
          stillUrl: typeof doc.stillUrl === 'string' ? doc.stillUrl : '',
          upvotes: typeof doc.upvotes === 'number' && doc.upvotes >= 0 ? doc.upvotes : 0,
          downvotes: typeof doc.downvotes === 'number' && doc.downvotes >= 0 ? doc.downvotes : 0,
          comments: Array.isArray(doc.comments) ? doc.comments : [],
        },
      },
    )
  }

  const sendPage = (res, pageName) => {
    res.sendFile(path.join(__dirname, pageName))
  }

  app.get('/', (req, res) => {
    sendPage(res, 'index.html')
  })

  app.get('/search', (req, res) => {
    sendPage(res, 'search.html')
  })

  app.get('/popular', (req, res) => {
    sendPage(res, 'popular.html')
  })

  app.get('/add-location', (req, res) => {
    sendPage(res, 'add-location.html')
  })

  app.get('/points/:id', (req, res) => {
    sendPage(res, 'detail.html')
  })

  app.get('/api/points', async (req, res) => {
    const points = await pointsDb.findAsync({}, { name: 1, movieName: 1, lat: 1, lng: 1, uploads: 1 })
    res.json(points)
  })

  app.get('/api/points/:id', async (req, res) => {
    const point = await pointsDb.findOneAsync(
      { _id: req.params.id },
      {
        name: 1,
        movieName: 1,
        lat: 1,
        lng: 1,
        uploads: 1,
        sceneTimestamp: 1,
        description: 1,
        stillUrl: 1,
        upvotes: 1,
        downvotes: 1,
        comments: 1,
      },
    )
    if (!point) {
      return res.status(404).json({ error: 'Point not found' })
    }
    res.json(point)
  })

  app.get('/api/search', async (req, res) => {
    const movie = typeof req.query.movie === 'string' ? req.query.movie.trim() : ''
    if (!movie) {
      return res.status(400).json({ error: '`movie` query is required' })
    }

    const escaped = movie.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const points = await pointsDb.findAsync(
      { movieName: { $regex: new RegExp(escaped, 'i') } },
      { name: 1, movieName: 1, lat: 1, lng: 1, uploads: 1 },
    )
    res.json(points)
  })

  app.get('/api/popular', async (req, res) => {
    const limitRaw = Number.parseInt(String(req.query.limit ?? '10'), 10)
    const limit = Number.isNaN(limitRaw) ? 10 : Math.max(1, Math.min(limitRaw, 50))

    const points = await pointsDb.findAsync({}, { name: 1, movieName: 1, lat: 1, lng: 1, uploads: 1 })
    const sorted = points
      .sort((a, b) => (b.uploads ?? 0) - (a.uploads ?? 0))
      .slice(0, limit)
    res.json(sorted)
  })

  app.post('/api/points', async (req, res) => {
    const { name, movieName, lat, lng, uploads, sceneTimestamp, description, stillUrl } = req.body ?? {}

    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: '`name` must be a non-empty string' })
    }
    if (typeof movieName !== 'string' || movieName.trim() === '') {
      return res.status(400).json({ error: '`movieName` must be a non-empty string' })
    }
    if (typeof lat !== 'number' || Number.isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ error: '`lat` must be a number between -90 and 90' })
    }
    if (typeof lng !== 'number' || Number.isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ error: '`lng` must be a number between -180 and 180' })
    }
    if (uploads !== undefined && (typeof uploads !== 'number' || Number.isNaN(uploads) || uploads < 0)) {
      return res.status(400).json({ error: '`uploads` must be a non-negative number' })
    }
    if (sceneTimestamp !== undefined && typeof sceneTimestamp !== 'string') {
      return res.status(400).json({ error: '`sceneTimestamp` must be a string' })
    }
    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({ error: '`description` must be a string' })
    }
    if (stillUrl !== undefined && typeof stillUrl !== 'string') {
      return res.status(400).json({ error: '`stillUrl` must be a string' })
    }

    const doc = await pointsDb.insertAsync({
      name: name.trim(),
      movieName: movieName.trim(),
      lat,
      lng,
      uploads: typeof uploads === 'number' ? uploads : 0,
      sceneTimestamp: typeof sceneTimestamp === 'string' && sceneTimestamp.trim() ? sceneTimestamp.trim() : '00:00:00',
      description: typeof description === 'string' ? description.trim() : '',
      stillUrl: typeof stillUrl === 'string' ? stillUrl.trim() : '',
      upvotes: 0,
      downvotes: 0,
      comments: [],
    })
    res.status(201).json({
      _id: doc._id,
      name: doc.name,
      movieName: doc.movieName,
      lat: doc.lat,
      lng: doc.lng,
      uploads: doc.uploads,
      sceneTimestamp: doc.sceneTimestamp,
      description: doc.description,
      stillUrl: doc.stillUrl,
      upvotes: doc.upvotes,
      downvotes: doc.downvotes,
      comments: doc.comments,
    })
  })

  app.post('/api/points/:id/vote', async (req, res) => {
    const type = req.body?.type
    if (type !== 'up' && type !== 'down') {
      return res.status(400).json({ error: '`type` must be `up` or `down`' })
    }

    const field = type === 'up' ? 'upvotes' : 'downvotes'
    const updatedCount = await pointsDb.updateAsync({ _id: req.params.id }, { $inc: { [field]: 1 } })
    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Point not found' })
    }

    const point = await pointsDb.findOneAsync({ _id: req.params.id }, { upvotes: 1, downvotes: 1 })
    res.json({ upvotes: point.upvotes ?? 0, downvotes: point.downvotes ?? 0 })
  })

  app.post('/api/points/:id/comments', async (req, res) => {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : ''
    if (!text) {
      return res.status(400).json({ error: '`text` must be a non-empty string' })
    }

    const comment = { text, createdAt: new Date().toISOString() }
    const updatedCount = await pointsDb.updateAsync({ _id: req.params.id }, { $push: { comments: comment } })
    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Point not found' })
    }

    const point = await pointsDb.findOneAsync({ _id: req.params.id }, { comments: 1 })
    res.status(201).json({ comments: point.comments ?? [] })
  })

  app.post('/add-location', async (req, res) => {
    const name = typeof req.body?.name === 'string' ? req.body.name : ''
    const movieName = typeof req.body?.movieName === 'string' ? req.body.movieName : ''
    const sceneTimestamp = typeof req.body?.sceneTimestamp === 'string' ? req.body.sceneTimestamp.trim() : ''
    const description = typeof req.body?.description === 'string' ? req.body.description.trim() : ''
    const stillUrl = typeof req.body?.stillUrl === 'string' ? req.body.stillUrl.trim() : ''
    const lat = Number(req.body?.lat)
    const lng = Number(req.body?.lng)
    const uploadsRaw = req.body?.uploads
    const uploads = uploadsRaw === undefined || uploadsRaw === '' ? 0 : Number(uploadsRaw)

    if (!name.trim() || !movieName.trim()) {
      return res.status(400).send('`name` and `movieName` are required')
    }
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).send('`lat` must be a number between -90 and 90')
    }
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).send('`lng` must be a number between -180 and 180')
    }
    if (Number.isNaN(uploads) || uploads < 0) {
      return res.status(400).send('`uploads` must be a non-negative number')
    }

    const doc = await pointsDb.insertAsync({
      name: name.trim(),
      movieName: movieName.trim(),
      sceneTimestamp: sceneTimestamp || '00:00:00',
      description,
      stillUrl,
      lat,
      lng,
      uploads,
      upvotes: 0,
      downvotes: 0,
      comments: [],
    })

    res.redirect(`/points/${encodeURIComponent(doc._id)}`)
  })

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
