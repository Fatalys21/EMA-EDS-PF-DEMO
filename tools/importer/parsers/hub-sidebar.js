/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the Points Forts hub sidebar experience fragment.
 * Base block: hub-sidebar.
 * Source: https://www.bcv.ch/pointsforts.html
 * Selector: .cmp-experiencefragment--Home-PointsForts1 (the sidebar XF)
 *
 * The source sidebar is a stack of four portlets:
 *   - "S'abonner"               (bcv-pfc-portlet--text-image): intro + RSS/email links
 *   - "Informations financières"(bcv-pfc-portlet--text-image): intro + "Accès directs" links
 *   - "DÉCOUVRIR"               (bcv-pfc-portlet--article): related-article items (image + title)
 *   - "SUR LES RÉSEAUX"         (bcv-pfc-portlet): social links (Instagram/X/LinkedIn/Facebook)
 *
 * Each portlet becomes one row of a `hub-sidebar` block: cell 1 = the portlet
 * title, cell 2 = the portlet body content (links/images preserved). The
 * `hub-sidebar` block decorator (blocks/hub-sidebar) renders the header bars,
 * link lists, related-article thumbnails and social row.
 */
export default function parse(element, { document }) {
  const doc = document;
  const rows = [];

  const portlets = element.querySelectorAll('.bcv-pfc-portlet');
  portlets.forEach((portlet) => {
    const titleEl = portlet.querySelector('.bcv-pfc-portlet__title, header');
    const title = titleEl ? titleEl.textContent.trim() : '';

    // Body = everything in the portlet except its title header.
    const body = doc.createElement('div');
    [...portlet.children].forEach((child) => {
      if (titleEl && (child === titleEl || child.contains(titleEl))) return;
      body.append(child.cloneNode(true));
    });

    // Strip screen-reader-only spans' icon glyph siblings; keep readable label.
    body.querySelectorAll('a').forEach((a) => {
      const sr = a.querySelector('.sr-only');
      if (sr) {
        const label = sr.textContent.trim();
        a.textContent = label;
      }
    });

    const titleCell = doc.createElement('p');
    titleCell.textContent = title;

    rows.push([titleCell, body]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hub-sidebar',
    cells: rows,
  });

  element.replaceWith(block);
}
