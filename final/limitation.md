# Final Project Code Limitations

## 1) Form and Request Flow

- Prefer native HTML form flow for standard submissions.
- Use form `method` and `action` correctly for GET/POST routes.
- Do not add unnecessary submit-button event listeners when form submission already solves the task.
- Only use `fetch` for submit flows when native forms are not sufficient.

## 2) Client-Side Initialization

- Any logic using `document` should run after page load.
- Use `window.onload` (or equivalent DOM-ready timing) before querying/manipulating DOM elements.

## 3) Performance Constraints

- Avoid image-heavy behavior that causes noticeable loading delays.
- Do not preload too many images when trying to limit API/network cost.
- Avoid image transition lag/glitches.
- Remove unnecessary page scroll/overflow in full-screen map views.

## 4) Implementation Scope and Complexity

- Keep implementation aligned with in-class patterns unless there is a clear technical reason.
- Avoid adding complexity that is not required by project goals.
- Keep code structure and imports simple, clear, and consistent.

## 5) Code Self-Check

- [ ] Standard submissions use native forms unless there is a clear exception.
- [ ] No unnecessary submit-button JS handlers.
- [ ] DOM-dependent code runs after page load.
- [ ] No accidental overflow/extra page scroll.
- [ ] Image loading behavior is responsive and not over-preloaded.
- [ ] Route and request patterns are simple and consistent.
