#!/usr/bin/env node
/*
 * DA content uploader for the Points Forts project.
 *
 * Walks the local `content/` folder and uploads every file to Document Authoring
 * (da.live) preserving the folder structure (Information Architecture):
 *   - `*.plain.html`  -> DA doc at `{path}.html`, wrapped as <body><main>...</main></body>
 *   - `*.json`        -> uploaded as-is (query/authors indexes)
 *   - images/other    -> uploaded as-is
 *
 * Target: https://admin.da.live/source/{org}/{site}/{path}
 * Auth:   Bearer token via env DA_TOKEN (required unless the site is open).
 *
 * Usage:
 *   DA_TOKEN=xxxxx node tools/da-upload.mjs [--dry-run] [--insecure]
 */
import { readFileSync, statSync, readdirSync } from 'fs';
import { join, relative, extname } from 'path';
import { fileURLToPath } from 'url';

const ORG = 'fatalys21';
const SITE = 'ema-eds-pf-demo';
const ADMIN = `https://admin.da.live/source/${ORG}/${SITE}`;
const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, 'content');

const DRY_RUN = process.argv.includes('--dry-run');
const INSECURE = process.argv.includes('--insecure');
const TOKEN = process.env.DA_TOKEN || '';

if (INSECURE) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const MIME = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
};

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/** Map a local content file to its DA source path (relative, no leading slash). */
function daPath(file) {
  let rel = relative(CONTENT_DIR, file).split('\\').join('/');
  if (rel.endsWith('.plain.html')) rel = `${rel.slice(0, -'.plain.html'.length)}.html`;
  return rel;
}

function wrapDoc(html) {
  const trimmed = html.trim();
  if (/^<body>\s*<main>/i.test(trimmed)) return trimmed;
  return `<body><main>${trimmed}</main></body>`;
}

async function uploadFile(file) {
  const rel = daPath(file);
  const ext = extname(rel).toLowerCase();
  const isDoc = file.endsWith('.plain.html');

  let body;
  let contentType;
  if (isDoc) {
    body = wrapDoc(readFileSync(file, 'utf-8'));
    contentType = 'text/html';
  } else {
    body = readFileSync(file);
    contentType = MIME[ext] || 'application/octet-stream';
  }

  const url = `${ADMIN}/${rel}`;
  if (DRY_RUN) {
    console.log(`DRY  ${rel}  (${contentType}, ${body.length} bytes)`);
    return { rel, ok: true };
  }

  // DA source API accepts multipart/form-data with a `data` field.
  const form = new FormData();
  const blob = new Blob([body], { type: contentType });
  form.append('data', blob, rel.split('/').pop());

  const headers = {};
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  const resp = await fetch(url, { method: 'POST', headers, body: form });
  const ok = resp.ok;
  console.log(`${ok ? 'OK  ' : `ERR ${resp.status}`} ${rel}`);
  if (!ok) {
    const text = await resp.text().catch(() => '');
    if (text) console.log(`      ${text.slice(0, 200)}`);
  }
  return { rel, ok, status: resp.status };
}

async function main() {
  const files = walk(CONTENT_DIR).sort();
  console.log(`DA upload -> ${ADMIN}`);
  console.log(`Files: ${files.length}${DRY_RUN ? ' (dry run)' : ''}${TOKEN ? '' : ' (no token)'}\n`);

  const results = [];
  for (const file of files) {
    // sequential to respect DA rate limits and keep output readable
    // eslint-disable-next-line no-await-in-loop
    results.push(await uploadFile(file));
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\nDone. ${results.length - failed.length}/${results.length} succeeded.`);
  if (failed.length) {
    console.log('Failed:');
    failed.forEach((r) => console.log(`  ${r.status || ''} ${r.rel}`));
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
