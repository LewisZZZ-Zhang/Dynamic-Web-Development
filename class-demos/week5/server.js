const express = require('express');
const app = express();
const PORT = 3001;

const nedb = require('@seald-io/nedb');
const db = new nedb({ filename: 'data.db', autoload: true });

app.use(express.static('assets'));
app.use(express.urlencoded({ extended: true }));

app.get('/create', (req, res) => {
    res.sendFile(__dirname + '/assets/create.html');
});


app.post('/post', (req, res) => {
    let data = {
        title: req.body.title,
        content: req.body.content
    };

    db.insert(data, (err, newDoc) => {
        if (err) {
            console.error('Error inserting document:', err);
            res.status(500).send('Error inserting document');
        } else {
            console.log('Document inserted:', newDoc);
            res.send('Document inserted successfully');
        }
    });
    
});

app.get('/all-posts', (req, res) => {
    db.find({}, (err, docs) => {
        if (err) {
            console.error('Error finding documents:', err);
            res.status(500).send('Error finding documents');
        } else {
            res.json(docs);
        }
    });
});

app.listen(PORT, () => {
	console.log(`server running on port ${PORT}`);
});
