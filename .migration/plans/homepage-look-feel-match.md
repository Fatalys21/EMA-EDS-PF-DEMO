# Homepage Look & Feel — Match Original BCV Points Forts (with Sidebar)

## Goal
Bring the homepage (`pointsforts`) in line with the original **bcv.ch/pointsforts** design. Two parts:
1. **Article listing polish** — the **"chevron" image crop**, **keyword ("Mots-clés") label** look & feel, and **font sizes** on the `hero-article` and `cards-teaser` blocks.
2. **Sidebar** — build the missing right-hand sidebar ("S'abonner", "Informations financières", "Découvrir", "Sur les réseaux") as the original does, including its content, styling, and the two-column page layout.

## What I found (from the original site's computed styles)

**1. Chevron image crop** — not a clip-path; a CSS border-triangle drawn as an `::after` on the image container, forming a white notch on the image edge:
- **Teaser cards** (`.bcv-pfc-article-teaser__media::after`): `position:absolute; left:0; bottom:0; border-width:58px 0 58px 32px; border-style:solid none solid solid; border-left-color:#fff; top/bottom transparent; z-index:2` → white chevron notch **bottom-left**.
- **Hero article** (`.bcv-pfc-hero-article-teaser__media::after`): `position:absolute; bottom:0; ~centered; border-width:0 58px 32px; border-style:none solid solid; border-bottom-color:#fff; left/right transparent; z-index:2` → white downward chevron **bottom-center**.
- Media container needs `position:relative; overflow:hidden`.

**2. Keyword ("Mots-clés") label & chips:**
- A `Mots-clés:` label precedes the tags in both hero and teaser cards.
- Chips: `font-size:13px; font-weight:400; text-transform:uppercase; color:#707070; border:1px solid #707070; border-radius:0; padding:0 4px; background:transparent;` in the heading font.
- Current `cards-teaser` uses a lighter border (`#d9d9d9`) and hides the label — align to `#707070` and show the label.

**3. Font sizes (current → target):**
- Hero title: **42px / #1f9743** → **29px, line-height ~32px, #009d4d**.
- Teaser card title: 30px desktop → **29px / line-height ~32px / #009d4d**.
- Excerpt/body: 20px desktop → **18px / line-height ~24px**.
- Tag chips: **13px** (already close), fix border color to `#707070`.

**4. Sidebar:**
- On desktop the page is **two columns** (article list left, sidebar right) inside the ~1200px content width; stacks below the article list on mobile.
- Four widget sections, each with a **white, uppercase, 22px Arimo bold** heading sitting on a colored header bar: **S'abonner** (RSS + email links), **Informations financières** (intro + "Accès directs" links), **Découvrir** (3 related-article items with thumbnail + title + "Suite"), **Sur les réseaux** (© line + Instagram/X/LinkedIn/Facebook links).
- The homepage already references a `hub-sidebar` fragment (`.fragment` block linking `/pointsforts/fragments/hub-sidebar`) via auto-blocking, but **that fragment's content does not exist yet** — it must be created.

## Approach for the sidebar
- **Content**: The `hub-sidebar` fragment page must be created through the project's **import flow** (scrape the sidebar region from the original page → run the bundled import script), not hand-authored, per project rules. The imported fragment will hold the four widget sections as standard section/block markup.
- **Layout**: Make the homepage main content a **two-column grid on desktop** (article list + sidebar), collapsing to single column on mobile. Implemented via a page/section-scoped CSS rule keyed off the presence of the sidebar fragment.
- **Styling**: Style the four sidebar sections (heading bars, link lists, Découvrir thumbnails, social icons) to match the original in a dedicated block/section stylesheet.

## Checklist

### Part 1 — Article listing (hero-article + cards-teaser)
- [ ] **hero-article.css** — add chevron notch: `.hero-article-media` → `position:relative; overflow:hidden`; add downward white triangle `::after` (`border-width:0 58px 32px; border-bottom-color:#fff`) anchored bottom-center, `z-index:2`.
- [ ] **hero-article.css** — title → `font-size:29px; line-height:32px; color:#009d4d` (remove 42px); excerpt → `18px/24px`; tag chip border → `#707070`.
- [ ] **cards-teaser.css** — add chevron notch: `.cards-teaser-card-image` → `position:relative; overflow:hidden`; add right-pointing white triangle `::after` (`border-width:58px 0 58px 32px; border-left-color:#fff`) anchored bottom-left, `z-index:2`.
- [ ] **cards-teaser.css** — desktop title → `29px / line-height 32px / #009d4d`; excerpt → `18px/24px`; tag chip border → `#707070` (keep uppercase 13px chips).
- [ ] **cards-teaser.js** — surface a `Mots-clés:` label before the tag chips (prefix span on `.cards-teaser-card-tags`); keep hiding raw "·" separators.

### Part 2 — Sidebar
- [ ] **Create the `hub-sidebar` fragment content** via the import flow: scrape the sidebar region (S'abonner, Informations financières, Découvrir, Sur les réseaux) from the original, generate/adjust the import script, and run the bundled import so the fragment renders at `/pointsforts/fragments/hub-sidebar`. (No hand-authored HTML in the content directory.)
- [ ] **Two-column layout**: add page/section-scoped CSS so on desktop (≥900px) the article list and the sidebar fragment sit side-by-side (~2fr / 1fr within the 1200px content width), stacking on mobile with the sidebar after the list.
- [ ] **Sidebar styling**: style the four widget sections — white uppercase 22px Arimo-bold headings on colored header bars, link lists with RSS/email/social icons, and Découvrir thumbnail+title items — to match the original.
- [ ] **Verify sidebar** in preview: fragment loads, all four sections render, layout is two-column on desktop and stacked on mobile.

### Verification & QA (whole page)
- [ ] In the local preview, snapshot DOM to confirm chevron pseudo-elements, the `Mots-clés:` label, and the sidebar sections are present; use computed-style checks to confirm the triangle border values, font sizes (29/18/13px), and grid columns.
- [ ] Take one homepage screenshot and compare side-by-side with the original (hero + first teaser card chevron/tags/titles, and the sidebar).
- [ ] Run `npm run lint` on all changed CSS/JS.

## Out of scope (for this pass)
- Article detail pages (follow-up after the homepage).
- Global header and footer styling.

## Notes
- Block CSS/JS changes are made in place; **no content HTML is hand-edited** — the sidebar fragment is produced through the import script per project rules.
- Execution requires **Execute mode**; this artifact is ready to implement on approval.
