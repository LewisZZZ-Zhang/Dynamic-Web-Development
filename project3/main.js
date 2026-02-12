const API_BASE = "https://api.artic.edu/api/v1";
const IIIF_BASE = "https://www.artic.edu/iiif/2";
const MIN_YEAR = 1;
const MAX_YEAR = 2024;

const prevButton = document.querySelector(".nav-left");
const nextButton = document.querySelector(".nav-right");
const refreshButton = document.getElementById("refreshCurrent");
const statusEl = document.getElementById("status");
const labels = Array.from(document.querySelectorAll(".timeline-label"));

const slots = [
	{
		key: "prev",
		yearEl: document.getElementById("yearPrev"),
		imgEl: document.getElementById("imgPrev"),
		emptyEl: document.getElementById("emptyPrev"),
		titleEl: document.getElementById("titlePrev"),
		artistEl: document.getElementById("artistPrev"),
		dateEl: document.getElementById("datePrev"),
		linkEl: document.getElementById("linkPrev"),
	},
	{
		key: "current",
		yearEl: document.getElementById("yearCurrent"),
		imgEl: document.getElementById("imgCurrent"),
		emptyEl: document.getElementById("emptyCurrent"),
		titleEl: document.getElementById("titleCurrent"),
		artistEl: document.getElementById("artistCurrent"),
		dateEl: document.getElementById("dateCurrent"),
		linkEl: document.getElementById("linkCurrent"),
	},
	{
		key: "next",
		yearEl: document.getElementById("yearNext"),
		imgEl: document.getElementById("imgNext"),
		emptyEl: document.getElementById("emptyNext"),
		titleEl: document.getElementById("titleNext"),
		artistEl: document.getElementById("artistNext"),
		dateEl: document.getElementById("dateNext"),
		linkEl: document.getElementById("linkNext"),
	},
];

const slotState = {
	prev: null,
	current: null,
	next: null,
};

let currentYear = 1900;

const setStatus = (message) => {
	if (statusEl) statusEl.textContent = message || "";
};

const getSlot = (key) => slots.find((slot) => slot.key === key);

const updateLabels = () => {
	labels.forEach((label) => {
		const offset = Number(label.dataset.offset || 0);
		label.textContent = String(currentYear + offset);
	});
};

const setText = (el, value) => {
	if (el) el.textContent = value;
};

const setHidden = (el, hidden) => {
	if (el) el.hidden = hidden;
};

const render = (key) => {
	const slot = getSlot(key);
	const state = slotState[key];
	if (!slot || !state) return;

	const { year, artwork, message } = state;

	if (slot.yearEl) slot.yearEl.textContent = year;

	if (!artwork) {
		setText(slot.emptyEl, message || "No artwork available");
		setHidden(slot.emptyEl, false);
		setHidden(slot.imgEl, true);
		setText(slot.titleEl, "");
		setText(slot.artistEl, "");
		setText(slot.dateEl, "");
		setHidden(slot.linkEl, true);
		return;
	}

	const imageUrl = `${IIIF_BASE}/${artwork.image_id}/full/843,/0/default.jpg`;
	if (slot.imgEl) {
		slot.imgEl.src = imageUrl;
		slot.imgEl.alt = artwork.title || "Artwork";
		slot.imgEl.hidden = false;
		slot.imgEl.onerror = function () {
			this.hidden = true;
			setText(slot.emptyEl, "Image failed to load");
			setHidden(slot.emptyEl, false);
		};
	}

	setHidden(slot.emptyEl, true);
	setText(slot.titleEl, artwork.title || "Untitled");
	setText(slot.artistEl, artwork.artist_display || "Unknown artist");
	setText(slot.dateEl, artwork.date_display || "");
	if (slot.linkEl) {
		slot.linkEl.href = `https://www.artic.edu/artworks/${artwork.id}`;
		slot.linkEl.hidden = false;
	}
};

const fetchRandomArtworkByYear = async (year) => {
	console.log(`Fetching artwork for year: ${year}`);
	const baseQuery = [
		{ term: { date_display: String(year) } },
		{ exists: { field: "image_id" } },
		{ term: { is_public_domain: true } },
		{ match: { classification_title: "painting" } },
	];

	const countResponse = await fetch(`${API_BASE}/artworks/search`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ limit: 0, query: { bool: { must: baseQuery } } }),
	});

	if (!countResponse.ok) {
		throw new Error("Failed to load artwork count");
	}

	const countData = await countResponse.json();
	const total = countData.pagination.total;
	console.log(`Total artworks found for ${year}: ${total}`);
	if (!total) return null;

	const artworkResponse = await fetch(`${API_BASE}/artworks/search`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			limit: 1,
			from: Math.floor(Math.random() * total),
			fields: ["id", "title", "artist_display", "date_display", "image_id"],
			query: { bool: { must: baseQuery } },
		}),
	});

	if (!artworkResponse.ok) {
		throw new Error("Failed to load artwork");
	}

	const data = await artworkResponse.json();
	const artwork = data.data?.[0] || null;
	console.log(`Artwork received for ${year}:`, artwork);
	return artwork;
};

const load = async (key, year) => {
	if (!getSlot(key)) return;

	if (year < MIN_YEAR || year > MAX_YEAR) {
		console.log(`Year ${year} out of range for slot ${key}`);
		slotState[key] = { year, artwork: null, message: "Out of range" };
		render(key);
		return;
	}

	console.log(`Loading slot ${key} for year ${year}`);
	try {
		const artwork = await fetchRandomArtworkByYear(year);
		slotState[key] = { year, artwork, message: null };
		console.log(`Successfully loaded ${key}:`, artwork);
		render(key);
	} catch (error) {
		console.error(`Error loading ${key} for year ${year}:`, error);
		slotState[key] = { year, artwork: null, message: error.message };
		render(key);
	}
};

const loadWindow = async () => {
	setStatus("");
	updateLabels();
	await Promise.all([
		load("prev", currentYear - 1),
		load("current", currentYear),
		load("next", currentYear + 1),
	]);
};

const shiftWindow = async (delta) => {
	const nextYear = currentYear + delta;
	if (nextYear < MIN_YEAR || nextYear > MAX_YEAR) return;

	currentYear = nextYear;
	updateLabels();

	if (delta < 0) {
		slotState.next = slotState.current;
		slotState.current = slotState.prev;
		slotState.prev = null;
		render("current");
		render("next");
		await load("prev", currentYear - 1);
		return;
	}

	if (delta > 0) {
		slotState.prev = slotState.current;
		slotState.current = slotState.next;
		slotState.next = null;
		render("prev");
		render("current");
		await load("next", currentYear + 1);
	}
};

const rerollCurrent = async () => {
	if (!getSlot("current")) return;
	if (currentYear < MIN_YEAR || currentYear > MAX_YEAR) return;

	console.log(`Rerolling current year: ${currentYear}`);
	setStatus("");

	try {
		const artwork = await fetchRandomArtworkByYear(currentYear);
		slotState.current = { year: currentYear, artwork, message: null };
		console.log(`Reroll successful:`, artwork);
		render("current");
	} catch (error) {
		console.error(`Reroll failed for ${currentYear}:`, error);
		slotState.current = {
			year: currentYear,
			artwork: null,
			message: error.message,
		};
		render("current");
	}
};

if (prevButton && nextButton) {
	prevButton.addEventListener("click", () => shiftWindow(-1));
	nextButton.addEventListener("click", () => shiftWindow(1));
}

if (refreshButton) {
	refreshButton.addEventListener("click", rerollCurrent);
}

loadWindow();
