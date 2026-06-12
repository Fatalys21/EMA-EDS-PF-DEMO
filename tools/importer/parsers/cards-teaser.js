/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-teaser. Base block: cards.
 * Sources:
 *   - Hub teaser grid:  .articleteaserlist .bcv-pfc-article-teaser
 *       (https://www.bcv.ch/pointsforts.html)
 *   - Article-detail related articles: .relatedarticles .bcv-pfc-portlet__media
 *       (https://www.bcv.ch/pointsforts/.../*.html)
 * Generated: 2026-06-12
 *
 * The page-templates.json selectors target an individual card element, so this
 * parser receives ONE source card per invocation and emits a single card row:
 *   Cell 1: thumbnail image (linked picture).
 *   Cell 2: category label, title (heading + link), excerpt, optional author byline,
 *           publication date, and keyword tags.
 *
 * Both DOM variants are handled. Optional fields (author, date, tags, category) are
 * absent on the related-articles variant and are simply skipped when not found.
 */
export default function parse(element, { document }) {
  // ----- Cell 1: thumbnail image (may be wrapped in a link) -----
  // Hub: .bcv-pfc-article-teaser__media img | Related: .bcv-pfc-portlet__media-left img
  const img = element.querySelector('.bcv-pfc-article-teaser__media img, .bcv-pfc-portlet__media-left img, img');

  // ----- Cell 2: text content -----
  const body = [];

  // Category label (hub variant only) e.g. "Entreprises".
  const category = element.querySelector('.bcv-pfc-article-teaser__list-meta-category a, .bcv-pfc-article-teaser__list-meta-category');
  if (category) {
    const catP = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = (category.textContent || '').trim();
    catP.append(strong);
    body.push(catP);
  }

  // Title: prefer the dedicated teaser/portlet heading; fall back to any heading.
  // Hub: h2.bcv-pfc-article-teaser__title | Related: .bcv-pfc-portlet__media-body h3
  const heading = element.querySelector('.bcv-pfc-article-teaser__title, .bcv-pfc-portlet__media-body h3, h2, h3');
  if (heading) body.push(heading);

  // Excerpt: the descriptive text link inside the teaser text block.
  // Hub: a.bcv-pfc-article-teaser__text-link | Related: a.bcv-pfc-portlet__media-body-link
  const excerptLink = element.querySelector('.bcv-pfc-article-teaser__text-link, .bcv-pfc-portlet__media-body-link');
  if (excerptLink) {
    const excerptP = document.createElement('p');
    excerptP.textContent = (excerptLink.textContent || '').trim();
    body.push(excerptP);
  }

  // "Suite" call-to-action: the trailing link in the text paragraph that is NOT
  // the excerpt link (excludes the excerpt and any author/tag/category links).
  const textContainer = element.querySelector('.bcv-pfc-article-teaser__text, .bcv-pfc-portlet__media-body');
  if (textContainer) {
    const ctaLink = Array.from(textContainer.querySelectorAll(':scope p > a')).find(
      (a) => !a.classList.contains('bcv-pfc-article-teaser__text-link')
        && !a.classList.contains('bcv-pfc-portlet__media-body-link'),
    );
    if (ctaLink) {
      const ctaP = document.createElement('p');
      ctaP.append(ctaLink);
      body.push(ctaP);
    }
  }

  // Author byline (hub variant only) e.g. "Par Rachel Perroud".
  const author = element.querySelector('.bcv-pfc-article-teaser__author');
  if (author) {
    const authorP = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = (author.textContent || '').replace(/\s+/g, ' ').trim();
    authorP.append(em);
    body.push(authorP);
  }

  // Publication date (hub variant only) e.g. "3 juin 2026".
  const date = element.querySelector('.bcv-pfc-article-teaser__list-meta .date, .date');
  if (date) {
    const dateP = document.createElement('p');
    dateP.textContent = (date.textContent || '').trim();
    body.push(dateP);
  }

  // Keyword tags (hub variant only): preserve as links inside one paragraph.
  const tagLinks = Array.from(element.querySelectorAll('.bcv-pfc-tags ul li a'));
  if (tagLinks.length) {
    const tagsP = document.createElement('p');
    tagLinks.forEach((a, i) => {
      if (i > 0) tagsP.append(document.createTextNode(' · '));
      tagsP.append(a);
    });
    body.push(tagsP);
  }

  // ----- Assemble single card row: [imageCell, bodyCell] -----
  const imageCell = [];
  if (img) imageCell.push(img);

  const cells = [[imageCell, body]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', cells });
  element.replaceWith(block);
}
