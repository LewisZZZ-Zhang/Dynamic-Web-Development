$(function () {
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
	let revealIndex = 0

	function revealElements($elements) {
		$elements.each(function () {
			const $element = $(this)

			if ($element.hasClass('js-reveal')) {
				return
			}

			$element.addClass('js-reveal')

			if (prefersReducedMotion) {
				$element.addClass('is-visible')
				return
			}

			window.setTimeout(() => {
				$element.addClass('is-visible')
			}, 70 * revealIndex)

			revealIndex += 1
		})
	}

	revealElements($('.card, .popular-item, .comment-item'))

	if (typeof MutationObserver === 'function') {
		const revealObserver = new MutationObserver((mutations) => {
			let $newTargets = $()

			mutations.forEach((mutation) => {
				$(mutation.addedNodes).each(function () {
					if (this.nodeType !== 1) {
						return
					}

					const $node = $(this)
					if ($node.is('.card, .popular-item, .comment-item')) {
						$newTargets = $newTargets.add($node)
					}

					$newTargets = $newTargets.add($node.find('.card, .popular-item, .comment-item'))
				})
			})

			revealElements($newTargets)
		})

		revealObserver.observe(document.body, { childList: true, subtree: true })
	}

	$('.about-section').each(function (index) {
		const $section = $(this)
		const $toggle = $section.find('.about-toggle')
		const $body = $section.find('.about-section-body')
		const expanded = index === 0

		$toggle.attr('aria-expanded', String(expanded))
		$section.toggleClass('is-collapsed', !expanded)

		if (!expanded) {
			$body.hide()
		}
	})

	$('.about-toggle').on('click', function () {
		const $toggle = $(this)
		const $section = $toggle.closest('.about-section')
		const $body = $section.find('.about-section-body')
		const isExpanded = $toggle.attr('aria-expanded') === 'true'

		$toggle.attr('aria-expanded', String(!isExpanded))
		$section.toggleClass('is-collapsed', isExpanded)
		$body.stop(true, true).slideToggle(180)
	})

	function syncFieldState(field) {
		const $field = $(field)
		const hasValue = $field.val().trim().length > 0
		const isFocused = $field.is(':focus')
		$field.closest('div').toggleClass('is-active-field', isFocused || hasValue)
	}

	$('input[type="text"], textarea').on('focus blur input', function (event) {
		syncFieldState(event.currentTarget)
	})

	$('input[type="text"], textarea').each(function () {
		syncFieldState(this)
	})
})
