/* eslint-disable */
/* global WebImporter */
/**
 * Parser for article-author. Base block: default content.
 * Source: .bcv-pfc-author--article-page (article detail page).
 *   .bcv-pfc-author__media a[href=/pointsforts/auteurs/...]   -> author page link + photo
 *   .bcv-pfc-author__author-info p ("Par <strong><a>Name</a>, Role, BCV</strong>")
 *
 * Emits a single-cell article-author block containing the author-page link, so
 * the runtime block can resolve photo/name/role from the authors index (with the
 * inline text as a fallback).
 */
export default function parse(element, { document }) {
  const link = element.querySelector('.bcv-pfc-author__media a, a[href*="/auteurs/"]');
  if (!link) {
    element.remove();
    return;
  }

  const cell = [];

  // Preserve the author photo (wrapped in the author-page link) as fallback.
  const img = element.querySelector('.bcv-pfc-author__media img, img');
  if (img) {
    const photoLink = document.createElement('a');
    photoLink.href = link.getAttribute('href');
    photoLink.append(img);
    const photoP = document.createElement('p');
    photoP.append(photoLink);
    cell.push(photoP);
  }

  // Preserve the "Par <Name>, Role, BCV" byline as fallback text.
  const info = element.querySelector('.bcv-pfc-author__author-info');
  const byline = document.createElement('p');
  if (info) {
    byline.textContent = info.textContent.replace(/\s+/g, ' ').trim();
  } else {
    byline.textContent = `Par ${link.textContent.trim()}`;
  }
  cell.push(byline);

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'article-author',
    cells: [[cell]],
  });
  element.replaceWith(block);
}
