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
  const newItem = {
    id: Date.now(),
    text: req.body.text
  };

  data.push(newItem);
  res.json(newItem);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
