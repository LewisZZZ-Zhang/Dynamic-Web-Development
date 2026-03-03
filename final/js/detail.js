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
		const div = document.createElement('div')
		const strong = document.createElement('strong')
		strong.textContent = label + ': '
		div.appendChild(strong)
		div.appendChild(document.createTextNode(value))
		parent.appendChild(div)
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

	async function vote(type) {
		const res = await fetch('/api/points/' + pointId + '/vote', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ type }),
		})
		const data = await res.json()
		if (data.deleted) {
			alert('This location was removed because downvotes exceeded 20.')
			window.location.href = '/'
			return
		}
		document.getElementById('upvotes').textContent = data.upvotes
		document.getElementById('downvotes').textContent = data.downvotes
	}

	const pointRes = await fetch('/api/points/' + pointId)
	const p = await pointRes.json()

	clearElement(detailEl)
	clearElement(voteSectionEl)

	const detailLayout = document.createElement('div')
	detailLayout.className = 'detail-layout'

	const detailLeft = document.createElement('div')
	detailLeft.className = 'detail-left stack'
	addTextLine(detailLeft, 'Location', p.name)
	addTextLine(detailLeft, 'Film title', p.movieName)
	addTextLine(detailLeft, 'Geographic coordinates', p.lat + ', ' + p.lng)
	addTextLine(detailLeft, 'Scene timestamp', p.sceneTimestamp || '00:00:00')
	addTextLine(detailLeft, 'User-written description', p.description || '')

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

	const upvoteBtn = document.createElement('button')
	upvoteBtn.id = 'upvoteBtn'
	upvoteBtn.className = 'btn vote-up'
	upvoteBtn.type = 'button'
	upvoteBtn.textContent = 'Upvote ('
	const upvotesSpan = document.createElement('span')
	upvotesSpan.id = 'upvotes'
	upvotesSpan.textContent = p.upvotes || 0
	upvoteBtn.appendChild(upvotesSpan)
	upvoteBtn.appendChild(document.createTextNode(')'))

	const downvoteBtn = document.createElement('button')
	downvoteBtn.id = 'downvoteBtn'
	downvoteBtn.className = 'btn vote-down'
	downvoteBtn.type = 'button'
	downvoteBtn.textContent = 'Downvote ('
	const downvotesSpan = document.createElement('span')
	downvotesSpan.id = 'downvotes'
	downvotesSpan.textContent = p.downvotes || 0
	downvoteBtn.appendChild(downvotesSpan)
	downvoteBtn.appendChild(document.createTextNode(')'))

	voteRow.appendChild(upvoteBtn)
	voteRow.appendChild(downvoteBtn)
	voteSectionEl.appendChild(voteRow)

	renderComments(p.comments || [])

	upvoteBtn.addEventListener('click', function () {
		vote('up')
	})
	downvoteBtn.addEventListener('click', function () {
		vote('down')
	})

	commentForm.addEventListener('submit', async function (event) {
		event.preventDefault()
		const input = document.getElementById('commentText')
		const text = input.value

		const res = await fetch('/api/points/' + pointId + '/comments', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text }),
		})
		const data = await res.json()
		input.value = ''
		renderComments(data.comments || [])
	})
}
