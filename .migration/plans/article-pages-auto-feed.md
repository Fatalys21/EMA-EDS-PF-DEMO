# Points Forts — Article Pages, Auto‑Feed, Author & Related Articles Plan

## Goal
Make every Points Forts article page render great and consistently, while minimizing author workload by:
- Auto‑populating the homepage (hero = latest article, cards = next most recent) from a **query index** — no manual upkeep.
- Adding an **author byline** at the article end where the author just pastes an author‑page link (photo, name, role auto‑fetched).
- Adding **related articles** that are **curated with auto‑fallback**: author pastes 2–3 article links (image, title, excerpt + "Suite" button auto‑fetched); if left empty, the block auto‑fills from the same category/keyword tags.

## Current State (verified)
- Project type: `da`. Article pages already imported under `content/pointsforts/**/2026/*.plain.html`.
- Article detail structure today: media stage (`embed-video` for video, or a plain `<picture>` for image) → category + date line → `Mots-clés:` tag list → `<h1>` title → lead + body (h2 sections, bullets) → inline author (photo link + "Par **Name**, Role, BCV") → "CES ARTICLES POURRAIENT VOUS INTÉRESSER" with 3 `cards-teaser`.
- Homepage `pointsforts.plain.html`: one `hero-article` + many `cards-teaser` + `hub-sidebar` fragment — all hand‑authored today.
- Existing blocks: `hero-article`, `cards-teaser`, `embed-video`, `hub-sidebar`, `fragment`, `hero`, `columns`, `cards`, `widget`.
- No `helix-query.yaml` and no author/related blocks exist yet.
- Import infra exists: `page-templates.json`, parsers, transformers, bundles for `article-hub` and `article-detail`.

## Design Decisions
1. **Query index** (`helix-query.yaml`) is the backbone. It exposes per‑article: `path`, `title`, `description`, `image`, `author`, `authorPath`, `category`, `tags`, `date`, `template`, `lastModified`. A second index facet (or path filter `/pointsforts/auteurs/`) exposes author `name`, `role`, `image`.
2. **Homepage auto‑feed**: a new `article-feed` behavior fetches `query-index.json`, filters `template=article-detail`, sorts by `date` desc, renders item 0 into the existing `hero-article` markup and the rest into `cards-teaser` markup — reusing the existing, already‑styled blocks. Homepage authoring becomes a single empty `article-feed` block.
3. **Author byline**: new `article-author` block. Input = one author‑page link. It fetches name/role/photo from the author index; if the author page/index entry is missing (e.g. locally), it gracefully falls back to any inline photo/name/role already present. Reduces authoring to pasting one link.
4. **Related articles**: new `article-related` block. Input = up to 3 article links (or empty). For each link it fetches `image`, `title`, `description` from the index and builds a card with a "Suite" button. If empty (or fewer than 3), it auto‑fills the remainder from the index by matching `category`/`tags`, excluding the current page, newest first.
5. **Article stage**: keep `embed-video` (poster + click‑to‑load) for video articles and a styled featured `<picture>` for image articles — normalize both into one consistent stage treatment so all articles look uniform.
6. **Graceful degradation for local dev**: author pages and a live `query-index.json` don't exist locally, so I'll add sample author pages and a local `query-index.json` fixture under `content/` for preview, and every fetch path has an inline fallback so pages never break.

## Blocks / Files to Create or Change
- **New** `blocks/article-author/{article-author.js,article-author.css}` — link‑driven byline with fetch + inline fallback.
- **New** `blocks/article-related/{article-related.js,article-related.css}` — curated links + category/tag auto‑fallback; reuses card visual style.
- **New** `blocks/article-feed/{article-feed.js,article-feed.css}` — homepage auto‑feed rendering into hero-article + cards-teaser markup.
- **New** `helix-query.yaml` — article + author index definitions.
- **Edit** `scripts/scripts.js` — optional auto‑block: turn a lone author‑page link paragraph at article end into `article-author`, and the related‑articles section into `article-related`, so authors don't insert block tables manually.
- **Edit** article `.plain.html` (via the import script only, per project rules — not hand‑edited) to adopt the new blocks; and refresh `content/pointsforts.plain.html` to a single `article-feed` block.
- **Edit** import infrastructure: `tools/importer/page-templates.json`, add `parsers/article-author.js`, `parsers/article-related.js`, `parsers/article-feed.js`, update transformers, regenerate bundles so future article imports produce the new structure.
- **Add** local fixtures: sample `content/pointsforts/auteurs/*.plain.html` and `content/query-index.json` for preview/testing.

## Checklist
- [ ] Confirm index field mapping by inspecting a few more article `.plain.html` files and the author link targets
- [ ] Author `helix-query.yaml` with `article` and `author` index definitions (path, title, description, image, author, authorPath, category, tags, date, template)
- [ ] Create local `content/query-index.json` fixture + sample author pages so features can be previewed locally
- [ ] Build `article-author` block (JS fetch author page/index → photo/name/role; inline fallback) + CSS matching source byline
- [ ] Build `article-related` block (curated links fetch image/title/excerpt/Suite; auto‑fallback by category/tags from index; exclude current page) + CSS reusing card style
- [ ] Build `article-feed` block (fetch index, sort by date desc, render latest → hero-article markup, rest → cards-teaser markup) + CSS
- [ ] Add auto‑blocking in `scripts.js` for author link + related section (so authoring stays minimal)
- [ ] Normalize the article "stage" (video vs featured image) for consistent look across all articles
- [ ] Update import parsers/transformers/`page-templates.json` and regenerate bundles for the new blocks
- [ ] Re‑run the import via the bundled import script to regenerate article `.plain.html` and rewrite homepage to a single `article-feed` block
- [ ] Preview each article + homepage locally; verify stage, body, author byline, related articles, and auto‑feed against the source (incl. the `adieu-lsv` example)
- [ ] `npm run lint` and fix issues; verify no console errors and graceful fallbacks when index/author data is absent

## Notes
- Execution requires **Execute mode**; this artifact is the plan only.
- Live `query-index.json` is generated by the AEM backend from `helix-query.yaml` after publish; locally I'll rely on the fixture. Homepage/related auto‑fill will be fully live once the branch is previewed on `*.aem.page`.
- All new blocks fetch lazily and degrade to authored/inline content, so pages render even before the index exists.
