window.onload = async () => {
	const res = await fetch('/popular-data')
	const rows = await res.json()
	const listEl = document.getElementById('list')

	while (listEl.firstChild) {
		listEl.removeChild(listEl.firstChild)
	}

	for (let i = 0; i < rows.length; i++) {
		const p = rows[i]

		const article = document.createElement('article')
		article.className = 'card'

		const titleDiv = document.createElement('div')
		const strong = document.createElement('strong')
		strong.textContent = '#' + (i + 1) + ' ' + p.name
		titleDiv.appendChild(strong)

		const movieDiv = document.createElement('div')
		movieDiv.textContent = 'Movie: ' + p.movieName

		const voteDiv = document.createElement('div')
		voteDiv.textContent = 'Upvotes: ' + (p.upvotes || 0)

		const linkP = document.createElement('p')
		const link = document.createElement('a')
		link.href = '/points/' + p._id
		link.textContent = 'View detail'
		linkP.appendChild(link)

		article.appendChild(titleDiv)
		article.appendChild(movieDiv)
		article.appendChild(voteDiv)
		article.appendChild(linkP)

		listEl.appendChild(article)
	}
}
