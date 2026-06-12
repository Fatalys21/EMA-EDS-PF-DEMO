import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Article teaser list ("cards-teaser").
 * Expected authored structure: one row per article teaser, each with two cells.
 *   Cell 1: the article thumbnail image (optionally linked).
 *   Cell 2: category label, title (heading + link), excerpt, optional "Suite" link,
 *           author byline, publication date, and keyword tags.
 *
 * Rendered as a vertical list of horizontal cards (image left, text right)
 * separated by dividers, matching the BCV Points Forts teaser list.
 * @param {Element} block The block element
 */
function classifyBody(body) {
  // Tag the body paragraphs so CSS can style category / suite / author / date / tags
  // to match the source design. Order in authored content:
  //   p>strong (category), heading (title), p (excerpt), p>a (Suite),
  //   p>em (author), p (date), p with multiple tag links (keywords)
  const dateRe = /^\s*\d{1,2}\s+[a-zàâäéèêëîïôöùûüç]+\s+\d{4}\s*$/i;

  [...body.children].forEach((el) => {
    if (el.matches('h1, h2, h3, h4, h5, h6')) {
      el.classList.add('cards-teaser-card-title');
      return;
    }
    if (el.tagName !== 'P') return;

    const text = el.textContent.trim();
    const links = el.querySelectorAll('a');
    const onlyStrong = el.children.length === 1 && el.querySelector('strong') && !el.querySelector('a');
    const onlyEm = el.querySelector('em') && !el.querySelector('a');
    const tagLinks = el.querySelectorAll('a[href*="recherche"], a[href*="tag="]');

    if (links.length === 1 && /^suite$/i.test(links[0].textContent.trim())) {
      el.classList.add('cards-teaser-card-suite');
    } else if (onlyStrong) {
      el.classList.add('cards-teaser-card-category');
    } else if (tagLinks.length >= 1 && tagLinks.length === links.length) {
      el.classList.add('cards-teaser-card-tags');
    } else if (onlyEm || /^par\b/i.test(text)) {
      el.classList.add('cards-teaser-card-author');
    } else if (dateRe.test(text)) {
      el.classList.add('cards-teaser-card-date');
    } else {
      el.classList.add('cards-teaser-card-excerpt');
    }
  });
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-teaser-card-image';
      else {
        div.className = 'cards-teaser-card-body';
        classifyBody(div);
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }])));
  block.replaceChildren(ul);
}
