---
paths:
  - "*.js"
  - "*.css"
  - "*.html"
---

# Frontend

## Design Tokens

This project uses CSS custom properties defined in `:root` in `style.css`. Use existing variables (`--bg`, `--card`, `--text`, `--accent`, `--line`, `--radius`, etc.) — never hardcode raw color/spacing values. The app uses a cool light theme ("Kjølig"): #F1F3F6 background, white cards, slate text (#18202A), steel-blue accent (#25507F) with white text on accent surfaces (`--on-accent`). Pastel surfaces come in pairs with a matching ink color for text on them (`--pastel-blue` / `--pastel-blue-ink`, also mint, lilac, peach). Primary buttons are dark pills. Font: Geist for both `--font-display` and `--font-body`.

Navigation is a dark floating dock at the bottom (`.dock`, tokens `--dock-*`): the main dock outside projects, the project dock (tabs + «Send prisoverslag») inside a project, driven by `body.in-project`. There is no sidebar — keep bottom padding on scrolling views so content clears the dock.

Reuse the shared components before making new ones: `.offer-card` (white card, with `.offer-card-head`/`.offer-card-title`), `.segmented` (button group; `.segmented-option` when it wraps radio inputs), `.switch` (on/off toggle on a checkbox), `.dash-avatar` (initials), `.info-rates` (blue rates card), `.hours-stepper` (− number +), `showModal(html,'modal--wide')` for wide dialogs. Class names are global — check that a new class name is not already used elsewhere.

The prisoverslag document (preview, PDF, sent HTML) keeps its own fixed look with Bricolage Grotesque/DM Sans. `getOfferAppLockCSS()` pins it, so app styling must never leak into the document.

## Component Framework

- **CSS**: Vanilla CSS with custom properties (no Tailwind, no preprocessors)
- **JS**: Vanilla JavaScript (no framework, no build step)
- **Icons**: Inline SVG line icons (`stroke="currentColor"`, `aria-hidden`) in navigation and overview; older modules still use emoji

## Layout

- CSS Grid for 2D, Flexbox for 1D. Use `gap`, not margin hacks.
- Mobile-first. Touch targets: minimum 44x44px.

## Accessibility (non-negotiable)

- All interactive elements keyboard-accessible.
- Form inputs: associated `<label>` or `aria-label`.
- Contrast: 4.5:1 normal text, 3:1 large text.
- Visible focus indicators. Never `outline: none` without replacement.
- Color never the sole indicator.

## Performance

- Images: `loading="lazy"` below fold, explicit `width`/`height`.
- Animations: `transform` and `opacity` only.
- Large lists: virtualize at 100+ items.
