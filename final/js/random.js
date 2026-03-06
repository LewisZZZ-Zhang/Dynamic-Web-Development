window.onload = async () => {
	const detailEl = document.getElementById('detail')
	const topActionsEl = document.getElementById('randomTopActions')

	function clearElement(el) {
		while (el.firstChild) {
			el.removeChild(el.firstChild)
		}
	}

	function addTextLine(parent, label, value) {
		const row = document.createElement('div')
		row.className = 'detail-row'

		const labelDiv = document.createElement('div')
		labelDiv.className = 'detail-label'
		labelDiv.textContent = label + ':'

		const valueDiv = document.createElement('div')
		valueDiv.className = 'detail-value'
		valueDiv.appendChild(document.createTextNode(value))

		row.appendChild(labelDiv)
		row.appendChild(valueDiv)
		parent.appendChild(row)
		return valueDiv
	}

	function renderTopRandomButton() {
		clearElement(topActionsEl)

		const randomLink = document.createElement('a')
		randomLink.className = 'btn'
		randomLink.href = '/random'
		randomLink.textContent = 'Random again'

		topActionsEl.appendChild(randomLink)
	}

	try {
		const randomRes = await fetch('/random-data')
		if (!randomRes.ok) {
			throw new Error('Failed to load random location')
		}

		const p = await randomRes.json()
		clearElement(detailEl)

		const detailLayout = document.createElement('div')
		detailLayout.className = 'detail-layout'

		const detailLeft = document.createElement('div')
		detailLeft.className = 'detail-left stack'
		addTextLine(detailLeft, 'Location', p.name)
		const movieValue = addTextLine(detailLeft, 'Film title', p.movieName + ' ')
		const movieSearchLink = document.createElement('a')
		movieSearchLink.href = '/search?movie=' + encodeURIComponent(p.movieName)
		movieSearchLink.textContent = 'More locations from this movie'
		movieValue.appendChild(movieSearchLink)

		const coordinateValue = addTextLine(detailLeft, 'Geographic coordinates', p.lat + ', ' + p.lng + ' ')
		const mapLink = document.createElement('a')
		mapLink.href = 'https://www.google.com/maps?q=' + encodeURIComponent(p.lat + ',' + p.lng)
		mapLink.target = '_blank'
		mapLink.rel = 'noopener noreferrer'
		mapLink.textContent = 'Google Maps'
		coordinateValue.appendChild(mapLink)

		addTextLine(detailLeft, 'Scene timestamp', p.sceneTimestamp)
		addTextLine(detailLeft, 'Description', p.description)

		const detailActionWrap = document.createElement('div')
		detailActionWrap.className = 'detail-action-row'
		const detailLink = document.createElement('a')
		detailLink.className = 'btn'
		detailLink.href = '/points/' + p._id
		detailLink.textContent = 'Go to detail + comments'
		detailActionWrap.appendChild(detailLink)
		detailLeft.appendChild(detailActionWrap)

		const detailRight = document.createElement('div')
		detailRight.className = 'detail-right'
		const stillLabel = document.createElement('div')
		const stillStrong = document.createElement('strong')
		stillStrong.textContent = 'Film still:'
		stillLabel.appendChild(stillStrong)
		detailRight.appendChild(stillLabel)

		if (p.image) {
			const img = document.createElement('img')
			img.className = 'still-image'
			img.src = p.image
			img.alt = 'Film still'
			img.loading = 'lazy'
			img.decoding = 'async'
			detailRight.appendChild(img)
		} else {
			const noImage = document.createElement('p')
			noImage.className = 'muted'
			noImage.textContent = 'Error!!! No image.'
			detailRight.appendChild(noImage)
		}

		detailLayout.appendChild(detailLeft)
		detailLayout.appendChild(detailRight)
		detailEl.appendChild(detailLayout)
		renderTopRandomButton()
	} catch (err) {
		clearElement(detailEl)
		clearElement(topActionsEl)

		const failText = document.createElement('p')
		failText.className = 'muted'
		failText.textContent = 'Failed to load a random location. Please try again.'
		detailEl.appendChild(failText)

		renderTopRandomButton()
	}
}
