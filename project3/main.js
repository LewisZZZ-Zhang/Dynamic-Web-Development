const API_BASE = "https://api.artic.edu/api/v1";
const IIIF_BASE = "https://www.artic.edu/iiif/2";
const MIN_YEAR = 1;
const MAX_YEAR = 2024;

const yearInput = document.getElementById("yearInput");
const jumpBtn = document.getElementById("jumpBtn");
const prevBtn = document.getElementById("prevYear");
const rerollBtn = document.getElementById("rerollCurrent");
const nextBtn = document.getElementById("nextYear");
const currentYearEl = document.getElementById("currentYear");
const statusEl = document.getElementById("status");

const slots = [
    {
        key: "prev",
        offset: -1,
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
        offset: 0,
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
        offset: 1,
        yearEl: document.getElementById("yearNext"),
        imgEl: document.getElementById("imgNext"),
        emptyEl: document.getElementById("emptyNext"),
        titleEl: document.getElementById("titleNext"),
        artistEl: document.getElementById("artistNext"),
        dateEl: document.getElementById("dateNext"),
        linkEl: document.getElementById("linkNext"),
    },
];

const cache = new Map();
let currentYear = Math.min(MAX_YEAR, new Date().getFullYear());

const setStatus = (message) => {
    statusEl.textContent = message || "";
};

const buildImageUrl = (imageId) =>
    `${IIIF_BASE}/${imageId}/full/843,/0/default.jpg`;

const setControls = () => {
    currentYearEl.textContent = currentYear;
    yearInput.value = currentYear;
    prevBtn.disabled = currentYear <= MIN_YEAR;
    nextBtn.disabled = currentYear >= MAX_YEAR;
};

const renderLoading = (slot, year) => {
    slot.yearEl.textContent = year;
    slot.emptyEl.textContent = "加载中...";
    slot.emptyEl.hidden = false;
    slot.imgEl.hidden = true;
    slot.titleEl.textContent = "";
    slot.artistEl.textContent = "";
    slot.dateEl.textContent = "";
    slot.linkEl.hidden = true;
};

const renderArtwork = (slot, year, artwork, message) => {
    slot.yearEl.textContent = year;

    if (!artwork) {
        slot.emptyEl.textContent = message || "没有可用作品";
        slot.emptyEl.hidden = false;
        slot.imgEl.hidden = true;
        slot.titleEl.textContent = "";
        slot.artistEl.textContent = "";
        slot.dateEl.textContent = "";
        slot.linkEl.hidden = true;
        return;
    }

    const imageUrl = buildImageUrl(artwork.image_id);
    slot.imgEl.src = imageUrl;
    slot.imgEl.alt = artwork.title || "Artwork";
    slot.imgEl.hidden = false;
    slot.imgEl.onerror = function () {
        this.hidden = true;
        slot.emptyEl.textContent = "图片暂时无法加载";
        slot.emptyEl.hidden = false;
    };

    slot.emptyEl.hidden = true;
    slot.titleEl.textContent = artwork.title || "无标题";
    slot.artistEl.textContent = artwork.artist_display || "艺术家未知";
    slot.dateEl.textContent = artwork.date_display || "";
    slot.linkEl.href = `https://www.artic.edu/artworks/${artwork.id}`;
    slot.linkEl.hidden = false;
};

const fetchRandomArtworkByYear = async (year) => {
    const countRequestBody = {
        limit: 0,
        query: {
            bool: {
                must: [
                    { term: { date_display: String(year) } },
                    { exists: { field: "image_id" } },
                    { term: { is_public_domain: true } },
                    { match: { classification_title: "painting" } },
                ],
            },
        },
    };

    const countResponse = await fetch(`${API_BASE}/artworks/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(countRequestBody),
    });

    if (!countResponse.ok) {
        throw new Error("获取作品总数失败");
    }

    const countData = await countResponse.json();
    const total = countData.pagination.total;

    if (!total) {
        return null;
    }

    const randomOffset = Math.floor(Math.random() * total);
    const artworkRequestBody = {
        limit: 1,
        from: randomOffset,
        fields: [
            "id",
            "title",
            "artist_display",
            "date_display",
            "image_id",
        ],
        query: {
            bool: {
                must: [
                    { term: { date_display: String(year) } },
                    { exists: { field: "image_id" } },
                    { term: { is_public_domain: true } },
                    { match: { classification_title: "painting" } },
                ],
            },
        },
    };

    const artworkResponse = await fetch(`${API_BASE}/artworks/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artworkRequestBody),
    });

    if (!artworkResponse.ok) {
        throw new Error("获取作品失败");
    }

    const data = await artworkResponse.json();
    return data.data?.[0] || null;
};

const updateWindow = async () => {
    setControls();
    setStatus("");

    const entries = slots.map((slot) => ({
        slot,
        year: currentYear + slot.offset,
    }));

    entries.forEach((entry) => renderLoading(entry.slot, entry.year));

    const results = await Promise.all(
        entries.map(async (entry) => {
            const { year } = entry;
            if (year < MIN_YEAR || year > MAX_YEAR) {
                return { ...entry, artwork: null, message: "超出范围" };
            }

            if (cache.has(year)) {
                return { ...entry, artwork: cache.get(year) };
            }

            try {
                const artwork = await fetchRandomArtworkByYear(year);
                cache.set(year, artwork);
                return { ...entry, artwork };
            } catch (error) {
                cache.set(year, null);
                return { ...entry, artwork: null, message: error.message };
            }
        })
    );

    results.forEach((result) =>
        renderArtwork(result.slot, result.year, result.artwork, result.message)
    );
};

const rerollCurrent = async () => {
    const currentSlot = slots.find((slot) => slot.key === "current");
    if (!currentSlot) return;
    if (currentYear < MIN_YEAR || currentYear > MAX_YEAR) return;

    renderLoading(currentSlot, currentYear);
    setStatus("");

    try {
        const artwork = await fetchRandomArtworkByYear(currentYear);
        cache.set(currentYear, artwork);
        renderArtwork(currentSlot, currentYear, artwork, "没有可用作品");
    } catch (error) {
        cache.set(currentYear, null);
        renderArtwork(currentSlot, currentYear, null, error.message);
    }
};

const changeYear = (delta) => {
    const nextYear = currentYear + delta;
    if (nextYear < MIN_YEAR || nextYear > MAX_YEAR) {
        return;
    }
    currentYear = nextYear;
    updateWindow();
};

const jumpToYear = () => {
    const value = yearInput.value.trim();
    const year = Number(value);
    if (!value || Number.isNaN(year)) {
        setStatus("请输入有效年份");
        return;
    }
    if (year < MIN_YEAR || year > MAX_YEAR) {
        setStatus(`请输入有效的年份 (${MIN_YEAR}-${MAX_YEAR})`);
        return;
    }
    currentYear = year;
    updateWindow();
};

prevBtn.addEventListener("click", () => changeYear(-1));
nextBtn.addEventListener("click", () => changeYear(1));
rerollBtn.addEventListener("click", rerollCurrent);
jumpBtn.addEventListener("click", jumpToYear);
yearInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        jumpToYear();
    }
});

updateWindow();