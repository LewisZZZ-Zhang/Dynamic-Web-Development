window.onload = async () => {
	const pointId = window.location.pathname.split('/').pop()
	const detailEl = document.getElementById('detail')
	const voteSectionEl = document.getElementById('voteSection')
	const commentsEl = document.getElementById('comments')
	const commentForm = document.getElementById('commentForm')

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

	function renderComments(comments) {
		clearElement(commentsEl)

		if (comments.length === 0) {
			const p = document.createElement('p')
			p.className = 'muted'
			p.textContent = 'No comments yet.'
			commentsEl.appendChild(p)
			return
		}

		for (let i = comments.length - 1; i >= 0; i--) {
			const comment = comments[i]

			const article = document.createElement('article')
			article.className = 'comment-item'

			const textP = document.createElement('p')
			textP.textContent = comment.text

			const timeDiv = document.createElement('div')
			timeDiv.className = 'muted'
			timeDiv.textContent = new Date(comment.createdAt).toLocaleString()

			article.appendChild(textP)
			article.appendChild(timeDiv)
			commentsEl.appendChild(article)
		}
	}

	const pointRes = await fetch('/points/' + pointId + '/data')
	const p = await pointRes.json()

	clearElement(detailEl)
	clearElement(voteSectionEl)

	const detailLayout = document.createElement('div')
	detailLayout.className = 'detail-layout'

	const detailLeft = document.createElement('div')
	detailLeft.className = 'detail-left stack'
	addTextLine(detailLeft, 'Location', p.name)
	addTextLine(detailLeft, 'Film title', p.movieName)
	const coordinateValue = addTextLine(detailLeft, 'Geographic coordinates', p.lat + ', ' + p.lng + ' ')
	const mapLink = document.createElement('a')
	mapLink.href = 'https://www.google.com/maps?q=' + encodeURIComponent(p.lat + ',' + p.lng)
	mapLink.target = '_blank'
	mapLink.rel = 'noopener noreferrer'
	mapLink.textContent = 'Google Maps'
	coordinateValue.appendChild(mapLink)

	addTextLine(detailLeft, 'Scene timestamp', p.sceneTimestamp)
	addTextLine(detailLeft, 'Description', p.description)

	const detailRight = document.createElement('div')
	detailRight.className = 'detail-right'
	const stillLabel = document.createElement('div')
	const stillStrong = document.createElement('strong')
	stillStrong.textContent = 'Film still:'
	stillLabel.appendChild(stillStrong)
	detailRight.appendChild(stillLabel)

	if (p.stillUrl) {
		const img = document.createElement('img')
		img.className = 'still-image'
		img.src = p.stillUrl
		img.alt = 'Film still'
		img.loading = 'lazy'
		img.decoding = 'async'
		detailRight.appendChild(img)
	} else {
		const noImage = document.createElement('p')
		noImage.className = 'muted'
		noImage.textContent = 'No still image.'
		detailRight.appendChild(noImage)
	}

	detailLayout.appendChild(detailLeft)
	detailLayout.appendChild(detailRight)
	detailEl.appendChild(detailLayout)

	const voteRow = document.createElement('div')
	voteRow.className = 'vote-row'

	const upvoteForm = document.createElement('form')
	upvoteForm.method = 'post'
	upvoteForm.action = '/points/' + pointId + '/vote'

	const upvoteBtn = document.createElement('button')
	upvoteBtn.className = 'btn vote-up'
	upvoteBtn.type = 'submit'
	upvoteBtn.name = 'type'
	upvoteBtn.value = 'up'
	upvoteBtn.textContent = 'Upvote ('
	const upvotesSpan = document.createElement('span')
	upvotesSpan.textContent = p.upvotes
	upvoteBtn.appendChild(upvotesSpan)
	upvoteBtn.appendChild(document.createTextNode(')'))
	upvoteForm.appendChild(upvoteBtn)

	const downvoteForm = document.createElement('form')
	downvoteForm.method = 'post'
	downvoteForm.action = '/points/' + pointId + '/vote'

	const downvoteBtn = document.createElement('button')
	downvoteBtn.className = 'btn vote-down'
	downvoteBtn.type = 'submit'
	downvoteBtn.name = 'type'
	downvoteBtn.value = 'down'
	downvoteBtn.textContent = 'Downvote ('
	const downvotesSpan = document.createElement('span')
	downvotesSpan.textContent = p.downvotes
	downvoteBtn.appendChild(downvotesSpan)
	downvoteBtn.appendChild(document.createTextNode(')'))
	downvoteForm.appendChild(downvoteBtn)

	voteRow.appendChild(upvoteForm)
	voteRow.appendChild(downvoteForm)
	voteSectionEl.appendChild(voteRow)

	commentForm.action = '/points/' + pointId + '/comments'
	renderComments(p.comments || [])
}
