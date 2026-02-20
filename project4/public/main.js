window.onload = () => {
	const form = document.getElementById("form");
	const input = document.getElementById("input");
	const list = document.getElementById("list");

	async function loadData() {
		try {
			const res = await fetch("/api/data");
			if (!res.ok) {
				throw new Error("1");
			}
			const data = await res.json();
			render(data);
		} catch (error) {
			console.error(error.message);
		}
	}

	function render(data) {
		list.innerHTML = "";

		const headerRow = document.createElement("div");
		headerRow.className = "item-row table-header";

		const textHeader = document.createElement("span");
		textHeader.className = "text-cell";
		textHeader.textContent = "Note";

		const actionHeader = document.createElement("span");
		actionHeader.className = "actions-cell";
		actionHeader.textContent = "Actions";

		headerRow.append(textHeader, actionHeader);
		list.appendChild(headerRow);

		data.forEach(item => {
			const row = document.createElement("div");
			row.className = "item-row";

			const text = document.createElement("span");
			text.className = "text-cell";
			text.textContent = item.text;

			const actions = document.createElement("div");
			actions.className = "actions-cell";

			const editBtn = document.createElement("button"); //edit button
			editBtn.textContent = "Edit";
			editBtn.type = "button";
			editBtn.addEventListener("click", () => editItem(item));

			const deleteBtn = document.createElement("button"); //delete button
			deleteBtn.textContent = "Delete";
			deleteBtn.type = "button";
			deleteBtn.addEventListener("click", () => deleteItem(item.id));

			actions.append(editBtn, deleteBtn);
			row.append(text, actions);
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
				headers: { "Content-Type": "application/json" },
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
			const res = await fetch(`/api/data/${id}`, {method: "DELETE"});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Delete failed");
			}
			loadData();
		} catch (error) {
			console.error(error.message);
		}
	}

	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const value = input.value.trim();

		if (!value) {
			return;
		}
		try {
			const res = await fetch("/api/data", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
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

	loadData();
};
