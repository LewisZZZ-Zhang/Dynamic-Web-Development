const form = document.getElementById("form");
const input = document.getElementById("input");
const list = document.getElementById("list");

// 获取数据
async function loadData() {
	try {
		const res = await fetch("/api/data");
		if (!res.ok) {
			throw new Error("Failed to load data");
		}

		const data = await res.json();
		render(data);
	} catch (error) {
		console.error(error.message);
	}
}

// 渲染数据到页面
function render(data) {
	list.innerHTML = "";

	data.forEach(item => {
		const row = document.createElement("div");
		row.className = "item-row";

		const text = document.createElement("span");
		text.textContent = item.text;

		const editBtn = document.createElement("button");
		editBtn.textContent = "Edit";
		editBtn.type = "button";
		editBtn.addEventListener("click", () => editItem(item));

		const deleteBtn = document.createElement("button");
		deleteBtn.textContent = "Delete";
		deleteBtn.type = "button";
		deleteBtn.addEventListener("click", () => deleteItem(item.id));

		row.append(text, editBtn, deleteBtn);
		list.appendChild(row);
	});
}

async function editItem(item) {
	const updatedText = prompt("Edit this item:", item.text);
	if (updatedText === null) {
		return;
	}

	try {
		const res = await fetch(`/api/data/${item.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ text: updatedText })
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Update failed");
		}

		loadData();
	} catch (error) {
		console.error(error.message);
	}
}

async function deleteItem(id) {
	try {
		const res = await fetch(`/api/data/${id}`, {
			method: "DELETE"
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Delete failed");
		}

		loadData();
	} catch (error) {
		console.error(error.message);
	}
}

// 提交新数据
form.addEventListener("submit", async (e) => {
	e.preventDefault();
	const value = input.value.trim();

	if (!value) {
		return;
	}

	try {
		const res = await fetch("/api/data", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ text: value })
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Create failed");
		}

		input.value = "";
		loadData();
	} catch (error) {
		console.error(error.message);
	}
});

// 页面加载时获取数据
loadData();
