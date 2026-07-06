import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Points Forts hub sidebar.
 * Authored structure: one row per portlet, each with two cells —
 *   cell 1: the portlet title (e.g. "S'abonner", "DÉCOUVRIR"),
 *   cell 2: the portlet body (paragraphs, link lists, or related-article items).
 *
 * Rendered as stacked portlets: a green header bar with the uppercase title on
 * a light panel, matching the BCV source sidebar. Two body variants are
 * detected from content: "article" (items with a thumbnail image) and "social"
 * (a list of external social links).
 */
const SOCIAL_RE = /instagram|x\.com|linkedin|facebook/i;

export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  rows.forEach((row) => {
    const [titleCell, bodyCell] = row.children;
    if (!titleCell || !bodyCell) return;

    const portlet = document.createElement('section');
    portlet.className = 'hub-sidebar-portlet';

    const header = document.createElement('header');
    header.className = 'hub-sidebar-portlet-title';
    const h = document.createElement('h2');
    h.textContent = titleCell.textContent.trim();
    header.append(h);

    const body = document.createElement('div');
    body.className = 'hub-sidebar-portlet-body';
    while (bodyCell.firstChild) body.append(bodyCell.firstChild);

    // Variant detection.
    const hasImages = body.querySelector('img');
    const links = [...body.querySelectorAll('a')];
    const isSocial = links.length > 0 && links.every((a) => SOCIAL_RE.test(a.href));

    if (hasImages) {
      portlet.classList.add('hub-sidebar-portlet-article');
      body.querySelectorAll('img').forEach((img) => {
        img.closest('picture').replaceWith(
          createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]),
        );
      });
      // Drop redundant "Suite" links so each item shows image + title only.
      body.querySelectorAll('a').forEach((a) => {
        if (/^suite$/i.test(a.textContent.trim())) a.remove();
      });
    } else if (isSocial) {
      portlet.classList.add('hub-sidebar-portlet-social');
    }

    portlet.append(header, body);
    block.append(portlet);
  });
}
