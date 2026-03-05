const path = require('path')
const express = require('express')
const multer = require('multer')
const nedb = require('@seald-io/nedb')

const app = express()
const PORT = 3004

const db = new nedb({
	filename: path.join(__dirname, 'data', 'points.db'),
	autoload: true,
})

const upload = multer({ dest: path.join(__dirname, 'uploads') })

app.use(express.static(__dirname))
app.use(express.urlencoded({ extended: true }))

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

app.get('/about', (req, res) => {
	res.sendFile(path.join(__dirname, 'about.html'))
})

app.get('/points/:id', (req, res) => {
	res.sendFile(path.join(__dirname, 'detail.html'))
})

app.get('/points-data', (req, res) => {
	db.find({}, (err, docs) => {
		if (err) {
			console.error('Error finding documents:', err)
			res.status(500).send('Error finding documents')
		} else {
			res.json(docs)
		}
	})
})

app.get('/points/:id/data', (req, res) => {
	db.findOne({ _id: req.params.id }, (err, doc) => {
		if (err) {
			console.error('Error finding document:', err)
			res.status(500).send('Error finding document')
		} else {
			res.json(doc)
		}
	})
})

app.get('/search-data', (req, res) => {
	const movie = req.query.movie
	db.find({ movieName: { $regex: new RegExp(movie, 'i') } }, (err, docs) => {
		if (err) {
			console.error('Error finding documents:', err)
			res.status(500).send('Error finding documents')
		} else {
			docs.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
			res.json(docs)
		}
	})
})

app.get('/popular-data', (req, res) => {
	db.find({}, (err, docs) => {
		if (err) {
			console.error('Error finding documents:', err)
			res.status(500).send('Error finding documents')
		} else {
			docs.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
			res.json(docs)
		}
	})
})

app.post('/points/:id/vote', (req, res) => {
	const type = req.body.type
	let field = 'upvotes'
	if (type === 'down') {
		field = 'downvotes'
	}

	db.update({ _id: req.params.id }, { $inc: { [field]: 1 } }, {}, (err) => {
		if (err) {
			console.error('Error updating vote:', err)
			res.status(500).send('Error updating vote')
			return
		}

		db.findOne({ _id: req.params.id }, (findErr, point) => {
			if (findErr) {
				console.error('Error finding document:', findErr)
				res.status(500).send('Error finding document')
				return
			}

			if (type === 'down' && point && point.downvotes > 20) {
				db.remove({ _id: req.params.id }, {}, () => {
					res.redirect('/')
				})
				return
			}

			res.redirect('/points/' + req.params.id)
		})
	})
})

app.post('/points/:id/comments', (req, res) => {
	const comment = {
		text: req.body.text,
		createdAt: new Date().toISOString(),
	}

	db.update({ _id: req.params.id }, { $push: { comments: comment } }, {}, (err) => {
		if (err) {
			console.error('Error adding comment:', err)
			res.status(500).send('Error adding comment')
		} else {
			res.redirect('/points/' + req.params.id)
		}
	})
})

app.post('/add-location', upload.single('stillImage'), (req, res) => {
	const data = {
		name: req.body.name,
		movieName: req.body.movieName,
		lat: Number(req.body.lat),
		lng: Number(req.body.lng),
		sceneTimestamp: req.body.sceneTimestamp,
		description: req.body.description,
		stillUrl: `/uploads/${req.file.filename}`,
		upvotes: 0,
		downvotes: 0,
		comments: [],
	}

	db.insert(data, (err, newDoc) => {
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
