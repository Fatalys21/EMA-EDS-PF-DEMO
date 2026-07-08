# Fix: Articles Not Showing on Points Forts Homepage — Remaining Steps

## Status so far (done)
- ✅ Added the enriched **metadata block** (`template`, `author`, `author-path`, `category`, `keywords`, `publication-date`) to all 5 article `.plain.html` files locally — verified they render as `<meta>` tags.
- ✅ Hardened `blocks/article-feed/article-feed.js` (excludes the hub, only accepts dated article-detail paths, never blanks the page).
- ✅ Fixed `helix-query.yaml` excludes (extensionless, section-scoped) so the hub no longer leaks into the index.
- ✅ Lint passes; code committed and **pushed to `main`** (`325d446`).

## What remains
Re-upload the 5 corrected article pages to DA, publish, and verify the live `query-index.json` now has populated fields. This must run in **your** environment because the DA token doesn't cross into my sandboxed shell.

## How to set the DA token (your question)

**What the token is:** your DA (da.live) access token. Get it by opening `https://da.live`, signing in, then in the browser DevTools console run:
```
JSON.parse(localStorage.getItem('nx-ims')).token
```
Copy the string it prints (that's the IMS bearer token DA uses).

**Two ways to use it:**

**Option A — set it in your own terminal and run the upload yourself** (recommended, nothing shared):
```
export DA_TOKEN='<paste-token-here>'
cd /backups/Fatalys21/EMA-EDS-PF-DEMO/repo
node tools/da-upload.mjs
```

**Option B — hand it to me via a throwaway file** (I read it, run everything, delete it):
```
printf '%s' '<paste-token-here>' > /backups/Fatalys21/EMA-EDS-PF-DEMO/repo/.da-token
```
Then tell me to continue.

> Why `export DA_TOKEN=...` didn't reach me: my Bash runs in an isolated sandbox that does **not** inherit environment variables from your interactive terminal. So a token you export in your shell is invisible to my shell. The file method (Option B) is the only way to pass it into my environment; otherwise you run the upload yourself (Option A).

## Checklist

- [ ] Retrieve the DA token from `da.live` (DevTools: `JSON.parse(localStorage.getItem('nx-ims')).token`)
- [ ] Choose a path: **A** run upload yourself with `export DA_TOKEN=...`, or **B** write it to `.da-token` for me to finish
- [ ] Re-upload the 5 corrected articles to DA — `node tools/da-upload.mjs` (uploads `content/` preserving IA; `OK` per file)
- [ ] Publish preview + live for the hub and 5 articles so `.aem.live` regenerates `query-index.json`
- [ ] Verify: `curl -s https://main--ema-eds-pf-demo--fatalys21.aem.live/pointsforts/query-index.json` shows `template`, `author`, `category`, `publication-date` populated (were empty before)
- [ ] Confirm homepage: newest article is the hero, cards ordered by date, hub not shown as a card
- [ ] If mine to run (Option B): delete `.da-token` immediately after

## Publish commands (Step for after upload)
```
OWNER=fatalys21; REPO=ema-eds-pf-demo; REF=main; BASE=https://admin.hlx.page
for P in /pointsforts \
  /pointsforts/marches/2026/un-mois-en-3-minutes-mai-2026 \
  /pointsforts/entrepreneurs/2026/quels-outils-pour-la-geston-de-ma-pme \
  /pointsforts/votre-argent/2026/organiser-son-patrimoine-en-vue-de-sa-retraite \
  /pointsforts/entrepreneurs/2026/pme-quand-demander-une-garantie-bancaire \
  /pointsforts/dans-le-canton/2026/pib-vaudois-croissance-ralentie-dans-un-contexte-incertain ; do
  curl -s -X POST "$BASE/preview/$OWNER/$REPO/$REF$P" -o /dev/null -w "preview %{http_code} $P\n"
  curl -s -X POST "$BASE/live/$OWNER/$REPO/$REF$P"    -o /dev/null -w "live    %{http_code} $P\n"
done
```

## Notes
- The feed, author byline, and related-articles blocks all read the same index metadata — populating it fixes ordering, author display, and category-based related articles together.
- The two `*-index.json` fixtures under `content/pointsforts/` are local-preview only; the live index is generated server-side from `helix-query.yaml`, so re-uploading them isn't required (and the generated index takes precedence on publish).
- Execution (upload, publish, verify) requires **Execute mode** — this artifact is the plan only.
