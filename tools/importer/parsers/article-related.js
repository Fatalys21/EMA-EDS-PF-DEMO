/* eslint-disable */
/* global WebImporter */
/**
 * Parser for article-related. Base block: default content.
 * Source: .relatedarticles portlet — a heading ("CES ARTICLES POURRAIENT VOUS
 * INTÉRESSER") followed by teaser cards (.bcv-pfc-portlet__media), each linking
 * to a related article.
 *
 * Emits a single-column article-related block, one row per curated article link.
 * The runtime block fetches each linked article's image/title/excerpt from the
 * index and auto-fills any remaining slots from same-category/tag articles.
 */
export default function parse(element, { document }) {
  const cards = element.querySelectorAll('.bcv-pfc-portlet__media');
  const rows = [];
  const seen = new Set();

  cards.forEach((card) => {
    // Prefer the title link; fall back to the first article link in the card.
    const link = card.querySelector('.bcv-pfc-portlet__media-body h3 a, a[href*="/pointsforts/"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || seen.has(href)) return;
    seen.add(href);

    const a = document.createElement('a');
    a.href = href;
    a.textContent = link.textContent.trim();
    rows.push([[a]]);
  });

  // Always emit the block (even empty) so the section renders auto-filled cards.
  const cells = rows.length ? rows : [[[]]];
  const block = WebImporter.Blocks.createBlock(document, {
    name: 'article-related',
    cells,
  });
  element.replaceWith(block);
}
