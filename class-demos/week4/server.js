const express = require('express');

const app = express();

// 存储所有留言的列表
const guestbookEntries = [];

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get("/test", (request, response) => {
  response.send("<h1>server is working</h1>");
});

app.listen(8000, () => {
    console.log("server is up on port 8000");
});

app.post("/sign", (request, response) => {
    console.log(request.body);
    // 将新留言添加到列表
    guestbookEntries.push(request.body);
    response.send("Guestbook entry received");
});

// 获取所有留言
app.get("/entries", (request, response) => {
    response.json(guestbookEntries);
});
