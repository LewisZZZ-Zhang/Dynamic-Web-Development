window.onload = async () => {
	const pickMap = L.map('pickMap').setView([40.7128, -74.006], 11)

	L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
		maxZoom: 19,
		attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
	}).addTo(pickMap)

	const latInput = document.getElementById('lat')
	const lngInput = document.getElementById('lng')
	const coordHint = document.getElementById('coordHint')
	let selectedMarker = null

	pickMap.on('click', (event) => {
		const lat = event.latlng.lat
		const lng = event.latlng.lng
		latInput.value = lat.toFixed(6)
		lngInput.value = lng.toFixed(6)
		coordHint.textContent = 'Selected: ' + latInput.value + ', ' + lngInput.value

		if (!selectedMarker) {
			selectedMarker = L.marker([lat, lng]).addTo(pickMap)
		} else {
			selectedMarker.setLatLng([lat, lng])
		}
	})
}
