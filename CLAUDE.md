# Project Instructions

## Commands

```bash
# Dev
open index.html          # open app in browser (no build step)
```

No build tools, package manager, linter, or test framework. This is a static vanilla JS app.

## Architecture

- Flat structure — all JS files in project root, single `index.html`
- Supabase for backend (loaded via CDN script tag)
- `auth.js` — authentication with Supabase
- `calcEngine.js` — calculation logic for construction estimates
- `app.js` — main app initialization and templates
- `calc.js`, `offer.js`, `customers.js`, `projects.js` — feature modules
- `changeOrders.js` — endringsmeldinger/tillegg (lagres som `offerPosts` med `type:'tillegg'`, holdes utenfor tilbudstotalen)
- `sw.js` + `manifest.json` — Hjem-skjerm-app og bruk uten nett. Nye skript i `index.html` må også legges i `APP_SHELL` i `sw.js`
- `productionData.js` — production/material data
- `settings.js` — app settings UI
- `utils.js` — shared utilities
- `makker.js` — companion/helper module
- `style.css` — all styles (vanilla CSS with custom properties)

## Key Decisions

- No build step — CDN imports and vanilla JS for simplicity
- Supabase handles auth, database, and sync — no custom backend
- Prisoverslagets sum regnes ett sted: `computeOfferDocumentTotal` (calcEngine.js). Dokumentet og sammendraget på Prisoverslag-fanen bruker begge den — ikke regn totalen på nytt andre steder
- Norwegian language throughout UI and commit messages

## Domain Knowledge

- "Kalkyle" = estimate/calculation for construction projects
- "Prisoverslag" = the estimate document sent to the customer (called "tilbud" before 2026-09; code still uses `offer*` names). Use "prisoverslag" in all user-facing text
- "Tømmermannskledning" = timber cladding
- "Svill" = sill plate, "Stender" = stud, "Bjelkelag" = joist system

## Workflow

- Prefer fixing the root cause over adding workarounds
- When unsure about approach, use plan mode (`Shift+Tab`) before coding

## Don'ts

- Don't add build tools or package managers — this project is intentionally simple
- Don't replace Supabase CDN import with npm packages
