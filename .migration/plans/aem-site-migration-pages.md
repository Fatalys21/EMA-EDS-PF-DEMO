# BCV Points Forts — Site Migration Plan (Content + Pixel-Match Design + Nav + Footer)

## Inputs Confirmed
- **Source site:** https://www.bcv.ch/pointsforts.html (BCV "Points Forts" — French-language financial articles hub)
- **Scope:** Specific pages — **Homepage + 5 featured articles** (6 pages total)
- **Includes:** Content, Block design/styling (**pixel-match original**), Navigation/header, Footer

## Pages To Migrate (6)
1. **Homepage / Hub** — https://www.bcv.ch/pointsforts.html
2. **Un mois en 3 minutes – mai 2026** — https://www.bcv.ch/pointsforts/marches/2026/un-mois-en-3-minutes-mai-2026.html
3. **Quels outils pour la gestion de ma PME?** — https://www.bcv.ch/pointsforts/entrepreneurs/2026/quels-outils-pour-la-geston-de-ma-pme-.html
4. **Organiser son patrimoine en vue de sa retraite** — https://www.bcv.ch/pointsforts/votre-argent/2026/organiser-son-patrimoine-en-vue-de-sa-retraite.html
5. **PME: quand demander une garantie bancaire?** — https://www.bcv.ch/pointsforts/entrepreneurs/2026/pme--quand-demander-une-garantie-bancaire.html
6. **PIB vaudois: croissance ralentie…** — https://www.bcv.ch/pointsforts/dans-le-canton/2026/pib-vaudois--croissance-ralentie-dans-un-contexte-incertain.html

> Likely **two templates**: (a) Article-hub/landing (homepage), (b) Article detail (the 5 articles). To be confirmed during cataloging.

## Checklist

### Phase 0 — Setup & Discovery
- [x] Receive homepage URL
- [x] Confirm specific page set (homepage + 5 articles)
- [ ] Determine project type (doc / da / xwalk) and the project's Block Library endpoint
- [ ] Confirm dev server running at preview; verify base project blocks available

### Phase 1 — Site Catalog & Templates
- [ ] Analyze the 6 pages and group into templates (expected: Hub + Article)
- [ ] Build site catalog with template definitions
- [ ] Survey available EDS blocks vs. needed blocks (hero, cards/teaser grid, article body, sidebar, embeds); list new block variants

### Phase 2 — Per-Page Analysis
- [ ] Scrape each page: content, screenshot, cleaned HTML, images
- [ ] Identify sections, content sequences, authoring decisions per page
- [ ] Map DOM selectors to blocks in page-templates.json (per template)

### Phase 3 — Import Infrastructure
- [ ] Generate block parsers for each block variant
- [ ] Generate page transformers (cleanup, sections, Dynamic Media/media)
- [ ] Assemble import script covering the 6 pages

### Phase 4 — Content Import
- [ ] Run bulk import to produce EDS markdown/HTML for all 6 pages
- [ ] Verify each page renders in the preview; fix structural issues

### Phase 5 — Block Design / Styling (Pixel-Match)
- [ ] Extract exact computed styles (colors, fonts, spacing, breakpoints) from bcv.ch
- [ ] Capture BCV design tokens into global styles (palette, typography, layout vars)
- [ ] Write EDS-ready CSS per block; visually verify and iterate to pixel-match (up to 3 passes/block)
- [ ] Page-level critique vs. originals; fix regressions

### Phase 6 — Navigation / Header
- [ ] Capture header/nav (logo, search, main menu: Marchés / Votre argent / Entreprises / Dans le canton) — desktop + mobile
- [ ] Instrument nav and build header block; wire mobile menu
- [ ] Validate nav structure and behavior against original

### Phase 7 — Footer
- [ ] Capture footer structure (copyright, social links, usage terms, mobile logo variant) + per-element behavior
- [ ] Build footer block content-first; match appearance
- [ ] Validate footer structure and links

### Phase 8 — Final QA
- [ ] Full-page visual comparison vs. originals for all 6 pages
- [ ] Lint (ESLint Airbnb + Stylelint) and fix issues
- [ ] Confirm all pages, header, and footer render correctly in preview

## Notes & Risks
- French content — preserve accents/encoding and original copy verbatim.
- Homepage shows pagination (70 pages) and a sidebar (subscription, related). Only the homepage itself is in scope; pagination targets and sidebar article links are **not** separate migration pages.
- Article URLs contain typos/double-hyphens as on the source (e.g. `geston`, `pme--quand`); these are kept as the real source paths.
- bcv.ch is a public corporate site; if any page blocks fetching, I'll capture via the browser preview tooling instead.

> **This plan is in Plan mode.** Execution (scraping, file/infrastructure generation, import, styling) requires switching to **Execute mode**. All inputs needed to start Phase 0 are now in hand.
```
