/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: BCV "Points Forts" article metadata enrichment.
 *
 * Collects extra metadata fields on article-detail pages so the published query
 * index (helix-query.yaml) can expose author / category / tags / date / template
 * to the homepage feed and related-articles blocks. These become <meta> tags in
 * the delivered page head.
 *
 * Collection runs in beforeTransform (while the source DOM is still intact — the
 * article-author / article-related parsers replace those nodes during parsing).
 * The collected fields are stashed on the shared payload as `articleMetadata`;
 * the import script merges them into the Metadata block produced by
 * WebImporter.rules.createMetadata, avoiding a duplicate metadata block.
 *
 * Selectors verified against migration-work/pointsforts-article/cleaned.html:
 *   author + role  -> .bcv-pfc-author__author-info  ("Par <a>Name</a>, Role, BCV")
 *   authorPath      -> .bcv-pfc-author__media a[href]  (/pointsforts/auteurs/...)
 *   category        -> .bcv-pfc-stage__infos a         (e.g. "Marchés")
 *   date            -> .bcv-pfc-stage__infos .date     (e.g. "27 mai 2026")
 *   tags            -> .bcv-pfc-tags ul li a           (keyword chips)
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

const MONTHS = {
  janvier: 1, février: 2, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, août: 8, aout: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12, decembre: 12,
};

function parseFrenchDate(text) {
  const m = (text || '').trim().toLowerCase().match(/(\d{1,2})\s+([a-zàâäéèêëîïôöùûüç]+)\s+(\d{4})/);
  if (!m) return '';
  const day = m[1].padStart(2, '0');
  const month = String(MONTHS[m[2]] || 0).padStart(2, '0');
  if (month === '00') return '';
  return `${m[3]}-${month}-${day}`;
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.beforeTransform) return;
  const template = (payload && payload.template) || {};
  if (template.name !== 'article-detail') return;

  const fields = {};

  const authorLink = element.querySelector('.bcv-pfc-author__media a[href*="/auteurs/"], .bcv-pfc-author__author-info a[href*="/auteurs/"]');
  if (authorLink) {
    fields.author = authorLink.textContent.trim();
    fields['author-path'] = authorLink.getAttribute('href').replace(/\.html$/, '');
  }

  const authorInfo = element.querySelector('.bcv-pfc-author__author-info');
  if (authorInfo) {
    const clone = authorInfo.cloneNode(true);
    clone.querySelectorAll('a, .bcv-pfc-author__author-info-label').forEach((el) => el.remove());
    const role = clone.textContent.replace(/^\s*par\s*/i, '').replace(/^[\s,]+/, '').trim();
    if (role) fields.role = role;
  }

  const stageInfos = element.querySelector('.bcv-pfc-stage__infos');
  if (stageInfos) {
    const cat = stageInfos.querySelector('a');
    if (cat) fields.category = cat.textContent.trim();
    const date = stageInfos.querySelector('.date');
    const iso = date ? parseFrenchDate(date.textContent) : '';
    if (iso) fields['publication-date'] = iso;
  }

  const tagLinks = element.querySelectorAll('.bcv-pfc-tags ul li a, .bcv-pfc-tags a');
  if (tagLinks.length) {
    fields.keywords = [...tagLinks].map((a) => a.textContent.trim()).filter(Boolean).join(', ');
  }

  fields.template = 'article-detail';

  // Stash on payload for the import script to merge into the metadata block.
  payload.articleMetadata = fields;
}
