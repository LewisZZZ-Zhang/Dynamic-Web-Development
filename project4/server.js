const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

let data = [
	{ id: 1, text: "item1" },
	{ id: 2, text: "item2" }
];

// READ
app.get("/api/data", (req, res) => {
	res.json(data);
});

// CREATE
app.post("/api/data", (req, res) => {
	if (!req.body.text || !req.body.text.trim()) {
		return res.status(400).json({ error: "Text is required" });
	}
	const newItem = {
		id: Date.now(),
		text: req.body.text.trim()
	};
	data.push(newItem);
	res.status(201).json(newItem);
});

// UPDATE
app.put("/api/data/:id", (req, res) => {
	const itemId = Number(req.params.id);
	const item = data.find((entry) => entry.id === itemId);

	if (!item) {
		return res.status(404).json({ error: "Item not found" });
	}
	if (!req.body.text || !req.body.text.trim()) {
		return res.status(400).json({ error: "Text is required" });
	}

	item.text = req.body.text.trim();
	res.json(item);
});

// DELETE
app.delete("/api/data/:id", (req, res) => {
	const itemId = Number(req.params.id);
	const previousLength = data.length;

	data = data.filter((entry) => entry.id !== itemId);

	if (data.length === previousLength) {
		return res.status(404).json({ error: "Item not found" });
	}
	res.status(204).send();
});

app.listen(PORT, () => {
	console.log(`Server running`);
});
