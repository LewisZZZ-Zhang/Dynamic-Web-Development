window.onload = async () => {
	const controlsDrawer = document.querySelector('.map-controls-drawer')
	const controlsToggle = document.querySelector('.map-controls-toggle')
	const controlsPanel = document.getElementById('mapControls')
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
	const hasJQuery = typeof window.jQuery === 'function'

	function shouldOpenMenuByDefault() {
		return window.innerWidth >= 768
	}

	function syncMapControls(isOpen, options = {}) {
		if (!controlsDrawer || !controlsToggle || !controlsPanel) {
			return
		}

		const animate = options.animate === true && hasJQuery && !prefersReducedMotion
		const $controlsPanel = hasJQuery ? window.jQuery(controlsPanel) : null

		controlsToggle.setAttribute('aria-expanded', String(isOpen))

		if (!animate) {
			controlsPanel.hidden = !isOpen
			controlsPanel.style.display = isOpen ? 'flex' : 'none'
			controlsDrawer.classList.toggle('is-open', isOpen)
			return
		}

		if (isOpen) {
			controlsPanel.hidden = false
			controlsDrawer.classList.add('is-open')
			$controlsPanel
				.stop(true, true)
				.hide()
				.css('display', 'flex')
				.hide()
				.slideDown(180, () => {
					$controlsPanel.css('display', 'flex')
				})
			return
		}

		$controlsPanel.stop(true, true).slideUp(180, () => {
			controlsPanel.hidden = true
			controlsPanel.style.display = 'none'
			controlsDrawer.classList.remove('is-open')
		})
	}

	if (controlsDrawer && controlsToggle && controlsPanel) {
		let isMenuOpen = shouldOpenMenuByDefault()
		let wasDefaultOpen = shouldOpenMenuByDefault()

		controlsToggle.addEventListener('click', () => {
			isMenuOpen = !isMenuOpen
			syncMapControls(isMenuOpen, { animate: true })
		})

		document.addEventListener('click', (event) => {
			if (!isMenuOpen || controlsDrawer.contains(event.target)) {
				return
			}

			isMenuOpen = false
			syncMapControls(isMenuOpen, { animate: true })
		})

		document.addEventListener('keydown', (event) => {
			if (event.key !== 'Escape' || !isMenuOpen) {
				return
			}

			isMenuOpen = false
			syncMapControls(isMenuOpen, { animate: true })
		})

		window.addEventListener('resize', () => {
			const isDefaultOpen = shouldOpenMenuByDefault()
			if (isDefaultOpen !== wasDefaultOpen) {
				isMenuOpen = isDefaultOpen
				wasDefaultOpen = isDefaultOpen
			}

			syncMapControls(isMenuOpen)
		})

		syncMapControls(isMenuOpen)
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
