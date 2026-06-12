/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: BCV "Points Forts" section boundaries.
 *
 * Establishes EDS section boundaries for both Points Forts templates by:
 *   - inserting an <hr> before every section except the first, and
 *   - appending a "Section Metadata" block (with the section's style) for every
 *     section that declares a style.
 *
 * Section definitions come from payload.template.sections (tools/importer/
 * page-templates.json). Each section declares a `selector` identifying the
 * first content element of that section, a `style`, and its `section` index.
 *
 * Selectors were verified against the captured DOM:
 *   - article-hub      (migration-work/pointsforts-hub/cleaned.html):
 *       section 1 -> .heroarticleteaser   (featured hero article)
 *       section 2 -> .articleteaserlist   (main teaser grid + sidebar)
 *   - article-detail   (migration-work/pointsforts-article/cleaned.html):
 *       section 1 -> .bcv-pfc-stage       (Kaltura video stage)
 *       section 2 -> .bcv-pfc-tags        (article body: tags/title/lead)
 *       section 3 -> .relatedarticles     (related articles cards)
 *
 * Runs in afterTransform only.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const template = (payload && payload.template) || {};
  const sections = Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;

  const doc = element.ownerDocument || document;

  // Resolve the boundary element for a section: the section selector's matched
  // element hoisted to its highest ancestor that is still a direct/intermediate
  // child of `element`, so the <hr>/metadata are inserted at the top level of
  // the document rather than buried inside the matched node.
  const resolveBoundary = (selector) => {
    const match = element.querySelector(selector);
    if (!match) return null;
    let node = match;
    while (node.parentNode && node.parentNode !== element) {
      node = node.parentNode;
    }
    return node.parentNode === element ? node : match;
  };

  // Process sections in reverse so inserted nodes never shift the positions of
  // boundaries we have yet to process.
  const ordered = [...sections].sort((a, b) => (b.section || 0) - (a.section || 0));

  ordered.forEach((section) => {
    const boundary = resolveBoundary(section.selector);
    if (!boundary) return;

    // Section Metadata block (only when a style is declared) — placed at the
    // end of the section, i.e. before the next boundary / after this content.
    if (section.style) {
      const metaBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      // Insert the metadata right after the section's boundary element so it
      // associates with this section.
      if (boundary.nextSibling) {
        boundary.parentNode.insertBefore(metaBlock, boundary.nextSibling);
      } else {
        boundary.parentNode.appendChild(metaBlock);
      }
    }

    // Section break before every section except the first.
    if ((section.section || 0) > 1) {
      const hr = doc.createElement('hr');
      boundary.parentNode.insertBefore(hr, boundary);
    }
  });
}
