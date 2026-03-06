window.onload = async () => {
	const detailEl = document.getElementById('detail')

	function clearElement(el) {
		while (el.firstChild) {
			el.removeChild(el.firstChild)
		}
	}

	try {
		const randomRes = await fetch('/random-data')
		if (!randomRes.ok) {
			throw new Error('Failed to load random location')
		}

		const p = await randomRes.json()
		clearElement(detailEl)

		const imageWrap = document.createElement('section')
		imageWrap.className = 'random-image-wrap'

		if (p.image) {
			const link = document.createElement('a')
			link.href = '/points/' + p._id
			link.tabIndex = 0
			link.setAttribute('aria-label', 'Go to detail and comments')
			const img = document.createElement('img')
			img.className = 'random-hero-image'
			img.src = p.image
			img.alt = p.name || 'Film still'
			img.loading = 'lazy'
			img.decoding = 'async'
			link.appendChild(img)
			imageWrap.appendChild(link)
		} else {
			const noImage = document.createElement('p')
			noImage.className = 'muted'
			noImage.textContent = 'Error!!! No image.'
			imageWrap.appendChild(noImage)
		}

		const infoWrap = document.createElement('section')
		infoWrap.className = 'random-info stack'

		const locationRow = document.createElement('div')
		locationRow.className = 'detail-row'
		const labelDiv = document.createElement('div')
		labelDiv.className = 'detail-label'
		labelDiv.textContent = 'Location:'
		const valueDiv = document.createElement('div')
		valueDiv.className = 'detail-value'
		valueDiv.textContent = p.name || ''
		locationRow.appendChild(labelDiv)
		locationRow.appendChild(valueDiv)
		infoWrap.appendChild(locationRow)

		const detailActionWrap = document.createElement('div')
		detailActionWrap.className = 'random-detail-action'
		const detailLink = document.createElement('a')
		detailLink.className = 'btn'
		detailLink.href = '/points/' + p._id
		detailLink.textContent = 'Go to detail + comments'
		detailActionWrap.appendChild(detailLink)
		infoWrap.appendChild(detailActionWrap)

		detailEl.appendChild(imageWrap)
		detailEl.appendChild(infoWrap)
	} catch (err) {
		clearElement(detailEl)

		const failText = document.createElement('p')
		failText.className = 'muted'
		failText.textContent = 'Failed to load a random location. Please try again.'
		detailEl.appendChild(failText)
	}
}
