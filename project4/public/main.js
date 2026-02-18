const form = document.getElementById("form");
const input = document.getElementById("input");
const list = document.getElementById("list");

// 获取数据
async function loadData() {
  const res = await fetch("/api/data");
  const data = await res.json();
  render(data);
}

// 渲染数据到页面
function render(data) {
  list.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");
    div.textContent = item.text;
    list.appendChild(div);
  });
}

// 提交新数据
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  await fetch("/api/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: input.value })
  });

  input.value = "";
  loadData();
});

// 页面加载时获取数据
loadData();
