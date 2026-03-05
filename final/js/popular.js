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
		article.className = 'card popular-item'

		const left = document.createElement('div')
		left.className = 'popular-left'

		const titleDiv = document.createElement('div')
		const strong = document.createElement('strong')
		strong.textContent = '#' + (i + 1) + ' ' + p.name
		titleDiv.appendChild(strong)

		const movieDiv = document.createElement('div')
		movieDiv.textContent = 'Movie: ' + p.movieName

		const voteDiv = document.createElement('div')
		voteDiv.textContent = 'Upvotes: ' + (p.upvotes) + ' | Downvotes: ' + (p.downvotes)

		const linkP = document.createElement('p')
		const link = document.createElement('a')
		link.href = '/points/' + p._id
		link.textContent = 'View detail'
		linkP.appendChild(link)

		const right = document.createElement('div')
		right.className = 'popular-right'
		if (p.stillUrl) {
			const img = document.createElement('img')
			img.className = 'popular-thumb'
			img.src = p.stillUrl
			img.alt = p.name + ' still'
			right.appendChild(img)
		}

		left.appendChild(titleDiv)
		left.appendChild(movieDiv)
		left.appendChild(voteDiv)
		left.appendChild(linkP)

		article.appendChild(left)
		article.appendChild(right)

		listEl.appendChild(article)
	}
}
