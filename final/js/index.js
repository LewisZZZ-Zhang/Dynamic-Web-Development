window.onload = async () => {
	const controlsDrawer = document.querySelector('.map-controls-drawer')
	const controlsToggle = document.querySelector('.map-controls-toggle')

	function syncMapControls() {
		if (!controlsDrawer || !controlsToggle) {
			return
		}

		const isMobile = window.innerWidth < 768
		const isOpen = !isMobile || controlsDrawer.classList.contains('is-open')
		controlsToggle.setAttribute('aria-expanded', String(isOpen))
	}

	if (controlsDrawer && controlsToggle) {
		controlsToggle.addEventListener('click', () => {
			if (window.innerWidth >= 768) {
				return
			}

			controlsDrawer.classList.toggle('is-open')
			syncMapControls()
		})

		window.addEventListener('resize', syncMapControls)
		syncMapControls()
	}

	function getDefaultZoom() {
		if (window.innerWidth < 768) {
			return 12
		}

		if (window.innerWidth < 1024) {
			return 13
		}

		return 13
	}

	const map = L.map('map').setView([40.729, -73.989], getDefaultZoom())

	L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
		maxZoom: 19,
		attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
	}).addTo(map)

	const res = await fetch('/points-data')
	const points = await res.json()

	for (let i = 0; i < points.length; i++) {
		const p = points[i]
		const detailUrl = '/points/' + p._id
		const marker = L.marker([p.lat, p.lng]).addTo(map)

		marker.on('click', function () {
			window.location.href = detailUrl
		})
	}
}
