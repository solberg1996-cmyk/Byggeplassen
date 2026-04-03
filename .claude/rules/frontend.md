---
paths:
  - "*.js"
  - "*.css"
  - "*.html"
---

# Frontend

## Design Tokens

This project uses CSS custom properties defined in `:root` in `style.css`. Use existing variables (`--bg`, `--card`, `--text`, `--accent`, `--line`, `--radius`, etc.) — never hardcode raw color/spacing values. The app uses a "California beaches" light theme (#F4F7F9 ocean-tinted background, white cards) with sand accent (#FFC067) and sky blue (#66C4FF). Button text on accent backgrounds should be `#162736` (dark). Text is deep ocean (#162736). Borders use sea glass tones (#DDE6EC). Additional tokens: `--steel` (#7D99AA), `--cyan` (#66F4FF), `--blue` (#66C4FF). Fonts: Bricolage Grotesque (display) and DM Sans (body).

## Component Framework

- **CSS**: Vanilla CSS with custom properties (no Tailwind, no preprocessors)
- **JS**: Vanilla JavaScript (no framework, no build step)
- **Icons**: Emoji-based icons in the UI

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
