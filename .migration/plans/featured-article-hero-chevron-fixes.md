# Homepage Featured Article & Hero Chevron Fixes

## Goal
Correct two layout/visual mismatches on the Points Forts homepage (`pointsforts`) against the original **bcv.ch/pointsforts**:
1. The **featured (latest) article** should be **full width** across the top; the **sidebar fragment** (and thus the two-column area) should begin **only after** the featured article — aligned with the first teaser card, not alongside the hero.
2. The **chevron on the featured article image** should sit on the **right side** of the image (currently it's a small downward notch at bottom-center).

## What I found (original vs. current)

**Original layout (measured at 1280px, content width ~1240px):**
- Featured article: `x=20, width=1240` → **full content width**, sitting above the columns.
- Below it (same `y`): teaser list `width≈930` (left) + sidebar `x=970, width≈290` (right) → **two columns start after the featured article**.

**Original hero chevron** (`.bcv-pfc-hero-article-teaser__media::after`):
- `position:absolute; right:0; bottom:0;`
- `border-style: solid; border-width: 230px 115px 230px 58px;` (top/right/bottom/left)
- `border-color: transparent #fff transparent transparent;` → a large **white left-pointing notch on the right edge**, spanning the image height.

**Current build (to change):**
- `styles/lazy-styles.css`: the entire hub section is a `2fr / 1fr` grid; hero + all cards are forced into column 1 and the fragment spans `grid-row: 1 / -1` (so the sidebar rises alongside the hero). → Needs: hero spans both columns on row 1; sidebar starts row 2.
- `blocks/hero-article/hero-article.css` `.hero-article-media::after`: `bottom:0; left:50%; border-width:0 58px 32px; border-bottom-color:#fff` (downward, centered). → Needs: right-edge chevron.

## Approach

**1. Featured full-width + sidebar-after-hero (edit `styles/lazy-styles.css`)**
- Keep the `main > .section:has(> .fragment-wrapper)` grid (`2fr / 1fr`, desktop ≥900px only).
- Make `.hero-article-wrapper` span the full row: `grid-column: 1 / -1;`.
- Keep `.cards-teaser-wrapper` in `grid-column: 1;` (they auto-flow into rows below the hero).
- Change the sidebar so it does **not** span the hero row: `.fragment-wrapper { grid-column: 2; grid-row: 2 / -1; align-self: start; }` so it begins on the second row (aligned with the first teaser card) and runs down beside the list.
- The hero article keeps its own internal image-left / text-right layout (unchanged, already handled inside `hero-article.css` at ≥900px).

**2. Hero chevron on the right (edit `blocks/hero-article/hero-article.css`)**
- Replace the current `.hero-article-media::after` rule with a right-edge notch matching the source:
  `position:absolute; top:0; bottom:0; right:0; border-style:solid; border-color:transparent #fff transparent transparent;` sized so the white triangle points left into the image and spans its height (source uses `border-width:230px 115px 230px 58px`; will express height responsively — e.g. `border-top/bottom-width:50%` of the media box — so it scales with the image, then verify against the original).
- Ensure `.hero-article-media` keeps `position:relative; overflow:hidden` (already set).

**3. Verify & QA**
- Because the local dev quirk prevents the sidebar fragment from loading on the combined homepage view (root-relative `/pointsforts/...` link proxies to unpublished remote), temporarily repoint the served homepage's fragment link to the `/content`-prefixed path for verification, then restore — same technique already used successfully.
- Confirm via computed styles + screenshot at desktop: hero spans full width, first teaser card and sidebar top-edges align on the second row, and the hero chevron is on the right edge. Compare side-by-side with the original.
- Confirm mobile (<900px) still stacks: hero, cards, then sidebar last.
- Run `npm run lint`.

## Checklist

- [ ] **lazy-styles.css** — set `.hero-article-wrapper` to `grid-column: 1 / -1` (full-width featured row).
- [ ] **lazy-styles.css** — change `.fragment-wrapper` from `grid-row: 1 / -1` to `grid-column: 2; grid-row: 2 / -1; align-self: start` so the sidebar starts after the featured article.
- [ ] **lazy-styles.css** — confirm `.cards-teaser-wrapper` stays in `grid-column: 1` and flows into rows below the hero.
- [ ] **hero-article.css** — replace the bottom-center `::after` chevron with a right-edge white left-pointing notch (`right:0; top:0; bottom:0; border-color:transparent #fff transparent transparent`), sized to span the image height and scale responsively.
- [ ] **Verify layout** in preview (temporarily repoint fragment link to `/content/...`, then restore): featured full-width; sidebar + first card aligned on row 2; computed grid values correct.
- [ ] **Verify chevron** on the right edge of the featured image via computed styles + screenshot; compare with original.
- [ ] **Verify mobile** (<900px) still stacks hero → cards → sidebar.
- [ ] Run `npm run lint` on changed files.

## Out of scope
- Teaser-card chevron (stays bottom-left as on the original), keyword labels, and font sizes — already matching.
- Sidebar content/styling, article detail pages, header/footer.

## Notes
- Only CSS changes in `styles/lazy-styles.css` and `blocks/hero-article/hero-article.css`; no content HTML is edited.
- Execution requires **Execute mode**; this artifact is ready to implement on approval.
