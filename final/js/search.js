window.onload = async () => {
	const movieInput = document.getElementById('movie')
	const resultsEl = document.getElementById('results')

	async function doSearch() {
		const movie = movieInput.value
		const res = await fetch('/api/search?movie=' + encodeURIComponent(movie))
		const rows = await res.json()

		while (resultsEl.firstChild) {
			resultsEl.removeChild(resultsEl.firstChild)
		}

		for (let i = 0; i < rows.length; i++) {
			const p = rows[i]

			const article = document.createElement('article')
			article.className = 'card'

			const nameDiv = document.createElement('div')
			const strong = document.createElement('strong')
			strong.textContent = p.name
			nameDiv.appendChild(strong)

			const movieDiv = document.createElement('div')
			movieDiv.textContent = 'Movie: ' + p.movieName

			const linkP = document.createElement('p')
			const link = document.createElement('a')
			link.href = '/points/' + p._id
			link.textContent = 'View detail'
			linkP.appendChild(link)

			article.appendChild(nameDiv)
			article.appendChild(movieDiv)
			article.appendChild(linkP)

			resultsEl.appendChild(article)
		}
	}

	document.getElementById('searchBtn').addEventListener('click', doSearch)
}
