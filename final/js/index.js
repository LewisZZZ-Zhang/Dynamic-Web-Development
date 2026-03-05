window.onload = async () => {
	const map = L.map('map').setView([40.729, -73.989], 13)

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
