const express = require("express");
const app = express();
const PORT = 3000;

// 中间件
app.use(express.json());
app.use(express.static("public"));

// 假数据库（内存）
let data = [
	{ id: 1, text: "First item" },
	{ id: 2, text: "Second item" }
];

// READ：获取所有数据
app.get("/api/data", (req, res) => {
	res.json(data);
});

// CREATE：新增数据
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

// UPDATE：更新指定数据
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

// DELETE：删除指定数据
app.delete("/api/data/:id", (req, res) => {
	const itemId = Number(req.params.id);
	const previousLength = data.length;

	data = data.filter((entry) => entry.id !== itemId);

	if (data.length === previousLength) {
		return res.status(404).json({ error: "Item not found" });
	}

	res.status(204).send();
});

// 启动服务器
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
