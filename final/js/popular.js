window.onload = async () => {
	const res = await fetch('/popular-data')
	const rows = await res.json()
	console.log('popular rows:', rows)
	const listEl = document.getElementById('list')

	function addField(parent, label, value) {
		const row = document.createElement('div')
		row.className = 'detail-row'

		const labelDiv = document.createElement('div')
		labelDiv.className = 'detail-label'
		labelDiv.textContent = label + ':'

		const valueDiv = document.createElement('div')
		valueDiv.className = 'detail-value'
		if (typeof value === 'string') {
			valueDiv.textContent = value
		} else {
			valueDiv.appendChild(value)
		}

		row.appendChild(labelDiv)
		row.appendChild(valueDiv)
		parent.appendChild(row)
		return valueDiv
	}

	while (listEl.firstChild) {
		listEl.removeChild(listEl.firstChild)
	}

	for (let i = 0; i < rows.length; i++) {
		const p = rows[i]
		console.log('popular item image:', p._id, p.image)

		const article = document.createElement('article')
		article.className = 'card popular-item'

		const left = document.createElement('div')
		left.className = 'popular-left'

		addField(left, 'Location', p.name)
		addField(left, 'Film title', p.movieName)
		addField(left, 'Votes', 'Upvote (' + p.upvotes + ') Downvote (' + p.downvotes + ')')

		const linkP = document.createElement('p')
		const link = document.createElement('a')
		link.href = '/points/' + p._id
		link.textContent = 'View detail'
		linkP.appendChild(link)
		left.appendChild(linkP)

		const right = document.createElement('div')
		right.className = 'popular-right'
		if (p.image) {
			const imgLink = document.createElement('a')
			imgLink.href = '/points/' + p._id
			const img = document.createElement('img')
			img.className = 'popular-thumb'
			img.src = p.image
			img.alt = p.name + ' still'
			imgLink.appendChild(img)
			right.appendChild(imgLink)
		}

		article.appendChild(left)
		article.appendChild(right)

		listEl.appendChild(article)
	}
}
