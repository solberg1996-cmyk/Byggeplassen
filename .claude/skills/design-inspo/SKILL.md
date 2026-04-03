---
name: design-inspo
description: >
  Visual reference library for design work. MUST be consulted before creating or
  modifying any frontend UI — CSS, HTML templates, components, layouts, color
  choices, or visual styling. Triggers on: redesign, new page, new component,
  style changes, color palette work, layout adjustments, landing page creation,
  or any task where the visual output matters. Even small CSS tweaks should
  check these references to stay consistent with the established direction.
  If the frontend-design skill is active, this skill should also be active.
---

# Design Inspo

This skill is a living mood board. Before touching any visual code, read the
reference images in `references/` to absorb the aesthetic direction, then
design accordingly.

## How to use

1. **Before designing anything**, read every file in the `references/` folder
2. Study the images for: color palette, spacing rhythm, typography choices,
   component shapes, shadow/depth treatment, layout patterns, and overall mood
3. Identify recurring themes across the references — these are the user's
   taste signals
4. Apply those patterns to whatever you're building. Don't copy literally,
   but match the *feeling* and level of craft
5. If references conflict with each other, prefer the most recent ones
   (sort by filename or modification date)

## What to look for in the references

When analyzing each reference image, extract:

- **Color relationships** — not just individual colors, but how they relate.
  What's the dominant surface color? What are accents used for? How much
  contrast between elements?
- **Density and spacing** — Is the layout airy or compact? How much breathing
  room between elements? Are things tightly grouped or generously spaced?
- **Typography character** — Weight, size hierarchy, letter-spacing choices.
  Is it bold and punchy or refined and restrained?
- **Component styling** — Border radius, border weight, shadow depth, use of
  gradients vs flat color. How do cards, buttons, and inputs look?
- **Visual hierarchy** — What draws the eye first? How is importance
  communicated? Through size, color, position, or weight?
- **Mood** — Is it warm or cool? Minimal or rich? Playful or serious?
  Industrial or organic?

## Adding references

Drop screenshots, mockups, or any visual reference into the `references/`
folder. Supported formats: PNG, JPG, SVG, PDF.

Name files descriptively so the intent is clear:
- `dashboard-layout-dark.png` — layout inspiration for dashboards
- `card-design-rounded.jpg` — card component styling to emulate
- `color-palette-warm.png` — target color palette
- `competitor-app-nice-tables.png` — table design worth borrowing from

The more references, the clearer the picture. Even 2-3 good ones make a
significant difference.

## When references are empty

If `references/` has no files yet, tell the user:

> Ingen visuell referanse funnet i design-inspo/references/. Legg til
> screenshots eller mockups der, sa bruker jeg dem som utgangspunkt
> for designvalg.

Then proceed with your best judgment, but flag that the result would improve
with references.
