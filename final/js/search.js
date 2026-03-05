window.onload = async () => {
	const movieInput = document.getElementById('movie')
	const resultsEl = document.getElementById('results')
	const query = new URLSearchParams(window.location.search)
	const movieFromUrl = query.get('movie')
	movieInput.value = movieFromUrl

	async function doSearch(movie) {
		const res = await fetch('/search-data?movie=' + encodeURIComponent(movie))
		const rows = await res.json()

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

		while (resultsEl.firstChild) {
			resultsEl.removeChild(resultsEl.firstChild)
		}

		for (let i = 0; i < rows.length; i++) {
			const p = rows[i]

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
			if (p.stillUrl) {
				const img = document.createElement('img')
				img.className = 'popular-thumb'
				img.src = p.stillUrl
				img.alt = p.name + ' still'
				right.appendChild(img)
			}

			article.appendChild(left)
			article.appendChild(right)

			resultsEl.appendChild(article)
		}

		if (rows.length === 0) {
			const empty = document.createElement('p')
			empty.className = 'muted'
			empty.textContent = 'No matching locations found.'
			resultsEl.appendChild(empty)
		}
	}

	if (movieFromUrl.trim()) {
		doSearch(movieFromUrl)
	}
}
