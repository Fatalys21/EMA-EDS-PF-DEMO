/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the "hero-article" block variant.
 * Base block: hero.
 * Source: https://www.bcv.ch/pointsforts.html (.bcv-pfc-hero-article-teaser)
 * Generated for the BCV Points Forts featured-article teaser.
 *
 * Target structure (from blocks/hero-article/hero-article.js — a 2-cell block):
 *   Cell 1 (media):   the featured image, kept wrapped in its link to the article.
 *   Cell 2 (content): article title (heading, linked to the article), excerpt,
 *                     author byline, category label, keyword tags, and the
 *                     "Suite" read-more link.
 */
export default function parse(element, { document }) {
  // --- Cell 1: media (linked lead image) --------------------------------
  // Prefer the linked image wrapper so the article link is preserved.
  const mediaImg = element.querySelector(
    '.bcv-pfc-hero-article-teaser__media img, .bcv-pfc-hero-article-teaser__media picture, img',
  );
  let mediaContent = null;
  if (mediaImg) {
    // Keep the anchor wrapper if the image is linked to the article.
    const mediaLink = mediaImg.closest('a');
    mediaContent = mediaLink || mediaImg;
  }

  // --- Cell 2: content --------------------------------------------------
  const contentCell = [];

  // Title: h2.h1.title containing a link to the article. Normalise to a
  // heading element (the source uses an h2 styled as h1).
  const titleEl = element.querySelector(
    '.bcv-pfc-hero-article-teaser__title h1, .bcv-pfc-hero-article-teaser__title h2, .bcv-pfc-hero-article-teaser__title h3, header h2, h2.title, h1',
  );
  if (titleEl) contentCell.push(titleEl);

  // Excerpt: paragraph(s) inside the text wrapper. The source wraps the
  // paragraph in a link to the article; keep the paragraph text and unwrap
  // any redundant link so the excerpt reads as body copy.
  const excerptParas = Array.from(
    element.querySelectorAll('.bcv-pfc-hero-article-teaser__text-wrapper > a > p, .bcv-pfc-hero-article-teaser__text-wrapper > p'),
  );
  excerptParas.forEach((p) => contentCell.push(p));

  // Author byline: "Par <author>".
  const author = element.querySelector('.bcv-pfc-hero-article-teaser__author');
  if (author) {
    const authorP = document.createElement('p');
    authorP.append(...author.childNodes);
    contentCell.push(authorP);
  }

  // Category label (e.g. "Marchés").
  const category = element.querySelector(
    '.bcv-pfc-hero-article-teaser__list-meta-category a, .bcv-pfc-hero-article-teaser__list-meta-category',
  );
  if (category) {
    const categoryP = document.createElement('p');
    categoryP.append(category);
    contentCell.push(categoryP);
  }

  // Keyword tags: title ("Mots-clés:") + list of tag links.
  const tagsWrap = element.querySelector('.bcv-pfc-hero-article-teaser__list-tags .bcv-pfc-tags, .bcv-pfc-hero-article-teaser__list-tags');
  if (tagsWrap) {
    const tagTitle = tagsWrap.querySelector('.bcv-pfc-tags__title');
    const tagLinks = Array.from(tagsWrap.querySelectorAll('ul li a'));
    if (tagLinks.length) {
      const tagsP = document.createElement('p');
      if (tagTitle) {
        const label = document.createElement('em');
        label.textContent = `${tagTitle.textContent.trim()} `;
        tagsP.append(label);
      }
      tagLinks.forEach((a, i) => {
        if (i > 0) tagsP.append(document.createTextNode(', '));
        tagsP.append(a);
      });
      contentCell.push(tagsP);
    }
  }

  // "Suite" read-more link.
  const more = element.querySelector('a.bcv-pfc-hero-article-teaser__more');
  if (more) {
    const moreP = document.createElement('p');
    moreP.append(more);
    contentCell.push(moreP);
  }

  // Each row has a single cell. The media cell holds the linked image; the
  // content cell holds all text/metadata stacked vertically. Wrapping
  // contentCell in an extra array makes it ONE cell (the array of nodes is the
  // cell's content) rather than spreading each node into its own column.
  const cells = [];
  cells.push([mediaContent || '']);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article', cells });
  element.replaceWith(block);
}
