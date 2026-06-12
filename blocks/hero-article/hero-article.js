import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Featured article teaser ("hero-article").
 * Expected authored structure: a 2-cell block.
 *   Cell 1: the featured image (optionally wrapped in a link to the article).
 *   Cell 2: heading (article title), excerpt paragraph(s), author byline,
 *           category and/or keyword tags, and an optional "Suite" read-more link.
 *
 * The block lays the image and the text content out side-by-side on wider
 * viewports and stacks them on small screens.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // The block is authored as two rows: row 1 = image, row 2 = text content.
  // (Older authoring used a single row with two cells; support both.)
  let mediaCell;
  let contentCell;
  if (rows.length >= 2) {
    [mediaCell, contentCell] = rows.map((r) => r.firstElementChild || r);
  } else {
    const cells = [...rows[0].children];
    [mediaCell, contentCell] = cells;
  }

  if (mediaCell) {
    mediaCell.className = 'hero-article-media';
    mediaCell.querySelectorAll('picture > img').forEach((img) => {
      img.closest('picture').replaceWith(
        createOptimizedPicture(img.src, img.alt, true, [{ width: '960' }]),
      );
    });
  }

  if (contentCell) {
    contentCell.className = 'hero-article-content';

    // EDS may wrap the content in an extra <div>; classify every <p> by role
    // (the source orders these differently, so we identify by content).
    const paragraphs = [...contentCell.querySelectorAll('p')];
    paragraphs.forEach((p) => {
      const link = p.querySelector('a');
      const text = p.textContent.trim();
      const href = link ? link.getAttribute('href') || '' : '';
      const tagLabel = p.querySelector('em');

      if (link && /\?tag=/.test(href)) {
        // keyword tags row (optional "Mots-clés:" label + tag links)
        p.classList.add('hero-article-tags');
        if (tagLabel && /mots-cl/i.test(tagLabel.textContent)) {
          tagLabel.classList.add('hero-article-tags-label');
        }
      } else if (link && text.toLowerCase() === 'suite') {
        // read-more link
        p.classList.add('hero-article-suite');
        link.classList.add('hero-article-suite-link');
      } else if (/^par\s/i.test(text)) {
        // author byline ("Par ...")
        p.classList.add('hero-article-author');
      } else if (link && /\.html$/.test(href) && p.children.length === 1
        && link.textContent.trim() === text) {
        // standalone category link (e.g. "Marchés")
        p.classList.add('hero-article-category');
      } else {
        // remaining body paragraph(s) = excerpt
        p.classList.add('hero-article-excerpt');
      }
    });
  }
}
