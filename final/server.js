const path = require('path')
const multer = require('multer')

const express = require('express')
const Datastore = require('@seald-io/nedb')

const PORT = process.env.PORT || 3000

async function main() {
	const app = express()
	const upload = multer({ dest: path.join(__dirname, 'uploads') })

	app.use(express.json())
	app.use(express.urlencoded({ extended: false }))
	app.use('/style', express.static(path.join(__dirname, 'style')))
	app.use('/js', express.static(path.join(__dirname, 'js')))
	app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

	const pointsDb = new Datastore({
		filename: path.join(__dirname, 'data', 'points.db'),
		autoload: true,
	})
	await pointsDb.autoloadPromise

	app.get('/', (req, res) => {
		res.sendFile(path.join(__dirname, 'index.html'))
	})

	app.get('/search', (req, res) => {
		res.sendFile(path.join(__dirname, 'search.html'))
	})

	app.get('/popular', (req, res) => {
		res.sendFile(path.join(__dirname, 'popular.html'))
	})

	app.get('/add-location', (req, res) => {
		res.sendFile(path.join(__dirname, 'add-location.html'))
	})

	app.get('/points/:id', (req, res) => {
		res.sendFile(path.join(__dirname, 'detail.html'))
	})

	app.get('/api/points', (req, res) => {
		pointsDb.find({}, (err, docs) => {
			if (err) {
				console.error('Error finding documents:', err)
				res.status(500).send('Error finding documents')
			} else {
				res.json(docs)
			}
		})
	})

	app.get('/api/points/:id', async (req, res) => {
		const point = await pointsDb.findOneAsync({ _id: req.params.id })
		if (!point) {
			res.status(404).json({ error: 'Not found' })
			return
		}
		res.json(point)
	})

	app.get('/api/search', async (req, res) => {
		const movie = req.query.movie || ''
		const points = await pointsDb.findAsync({ movieName: { $regex: new RegExp(movie, 'i') } })
		res.json(points)
	})

	app.get('/api/popular', async (req, res) => {
		const points = await pointsDb.findAsync({})
		points.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
		res.json(points)
	})

	app.post('/api/points', (req, res) => {
		const data = {
			name: req.body.name,
			movieName: req.body.movieName,
			lat: req.body.lat,
			lng: req.body.lng,
			sceneTimestamp: req.body.sceneTimestamp || '00:00:00',
			description: req.body.description || '',
			stillUrl: req.body.stillUrl || '',
			upvotes: 0,
			downvotes: 0,
			comments: [],
		}

		pointsDb.insert(data, (err, newDoc) => {
			if (err) {
				console.error('Error inserting document:', err)
				res.status(500).send('Error inserting document')
			} else {
				console.log('Document inserted:', newDoc)
				res.json(newDoc)
			}
		})
	})

	app.post('/api/points/:id/vote', async (req, res) => {
		const type = req.body.type
		const field = type === 'down' ? 'downvotes' : 'upvotes'
		await pointsDb.updateAsync({ _id: req.params.id }, { $inc: { [field]: 1 } })
		const point = await pointsDb.findOneAsync({ _id: req.params.id })

		if (type === 'down' && point && point.downvotes > 20) {
			await pointsDb.removeAsync({ _id: req.params.id }, {})
			res.json({ deleted: true })
			return
		}

		res.json({ upvotes: point?.upvotes || 0, downvotes: point?.downvotes || 0 })
	})

	app.post('/api/points/:id/comments', async (req, res) => {
		const comment = {
			text: req.body.text,
			createdAt: new Date().toISOString(),
		}
		await pointsDb.updateAsync({ _id: req.params.id }, { $push: { comments: comment } })
		const point = await pointsDb.findOneAsync({ _id: req.params.id })
		res.json({ comments: point?.comments || [] })
	})

	app.post('/add-location', upload.single('stillImage'), (req, res) => {
		const data = {
			name: req.body.name,
			movieName: req.body.movieName,
			lat: Number(req.body.lat),
			lng: Number(req.body.lng),
			sceneTimestamp: req.body.sceneTimestamp,
			description: req.body.description,
			stillUrl: req.file ? `/uploads/${req.file.filename}` : '',
			upvotes: 0,
			downvotes: 0,
			comments: [],
		}

		pointsDb.insert(data, (err, newDoc) => {
			if (err) {
				console.error('Error inserting document:', err)
				res.status(500).send('Error inserting document')
			} else {
				console.log('Document inserted:', newDoc)
				res.redirect('/points/' + newDoc._id)
			}
		})
	})

	app.listen(PORT, () => {
		console.log(`server running on port ${PORT}`)
	})
}

main().catch((err) => {
	console.error(err)
	process.exitCode = 1
})
