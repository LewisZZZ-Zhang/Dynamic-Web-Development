function escapeTopbarHtml(value) {
	return String(value || '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;')
}

class AppTopbar extends HTMLElement {
	connectedCallback() {
		const variant = escapeTopbarHtml(this.getAttribute('variant') || 'page')
		const eyebrow = escapeTopbarHtml(this.getAttribute('eyebrow') || '')
		const title = escapeTopbarHtml(this.getAttribute('title') || 'Marvel NYC Map')
		const subtitle = escapeTopbarHtml(this.getAttribute('subtitle') || '')
		const backHref = escapeTopbarHtml(this.getAttribute('back-href') || '')
		const backLabel = escapeTopbarHtml(this.getAttribute('back-label') || 'Back to map')
		const actionHref = escapeTopbarHtml(this.getAttribute('action-href') || '')
		const actionLabel = escapeTopbarHtml(this.getAttribute('action-label') || '')
		const homeLabel = escapeTopbarHtml(this.getAttribute('home-label') || 'Map home')
		const showHomeLink = this.getAttribute('show-home-link') !== 'false'

		const leadMarkup = backHref
			? `<a class="topbar-pill topbar-pill--ghost" href="${backHref}">${backLabel}</a>`
			: `<span class="topbar-pill topbar-pill--badge">${eyebrow || 'Marvel NYC Map'}</span>`

		const eyebrowMarkup = backHref && eyebrow
			? `<p class="site-topbar__eyebrow">${eyebrow}</p>`
			: ''

		const subtitleMarkup = subtitle
			? `<p class="site-topbar__subtitle">${subtitle}</p>`
			: ''

		const actionMarkup = actionHref && actionLabel
			? `<a class="topbar-pill topbar-pill--action" href="${actionHref}">${actionLabel}</a>`
			: ''

		const homeMarkup = showHomeLink
			? `
				<a class="topbar-home-link" href="/" aria-label="${homeLabel}">
					<img class="topbar-home-link__logo" src="/style/logo.png" alt="Marvel NYC Map logo" />
					<span class="topbar-home-link__label">${homeLabel}</span>
				</a>
			`
			: `
				<a class="topbar-home-link topbar-home-link--logo-only" href="/" aria-label="Marvel NYC Map home">
					<img class="topbar-home-link__logo" src="/style/logo.png" alt="Marvel NYC Map logo" />
				</a>
			`

		this.innerHTML = `
			<div class="site-topbar-shell">
				<header class="site-topbar site-topbar--${variant}">
					<div class="site-topbar__lead">
						${leadMarkup}
					</div>
					<div class="site-topbar__copy">
						${eyebrowMarkup}
						<h1 class="site-topbar__title">${title}</h1>
						${subtitleMarkup}
					</div>
					<div class="site-topbar__actions">
						${actionMarkup}
						${homeMarkup}
					</div>
				</header>
			</div>
		`
	}
}

if (!customElements.get('app-topbar')) {
	customElements.define('app-topbar', AppTopbar)
}
