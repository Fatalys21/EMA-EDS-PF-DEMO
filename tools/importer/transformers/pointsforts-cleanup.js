/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: BCV "Points Forts" site-wide cleanup.
 *
 * Removes non-authorable site chrome and global widgets so the imported
 * document contains only page-level authorable content, and collapses the
 * redundant AEM (classic) grid wrapper divs.
 *
 * ALL selectors below were verified against the captured DOM in:
 *   - migration-work/pointsforts-hub/cleaned.html      (article-hub template)
 *   - migration-work/pointsforts-article/cleaned.html  (article-detail template)
 *
 * NOTE: bare <header>, <footer> and <nav> tags are NOT removed. In this source
 * they appear as authorable content inside the article-teaser cards
 * (header.bcv-pfc-hero-article-teaser__title, the per-card <footer> with author/
 * tags/date, header.bcv-pfc-portlet__title). Only the site shell header/footer
 * (the .header / .footer wrappers) and the named global widgets are stripped.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Modals / overlays that can block or pollute block parsing.
    // Found in captured DOM:
    //   <div class="cp02-social-disclaimer hidden"> ... cookie / social disclaimer
    //   <div class="modal"><div class="bcv-pfc-modal"> ... generic modal shell
    WebImporter.DOMUtils.remove(element, [
      '.cp02-social-disclaimer',
      '.modal',
      '.bcv-pfc-modal',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome & global utility widgets.
    // Found in captured DOM:
    //   <div class="header"><header class="bcv-pfc-header"> ... site header + nav + search
    //   <div class="footer"><footer class="bcv-pfc-footer"> ... site footer (copyright, terms, logos)
    //   <div class="contextmenu"> ... floating Partager/Imprimer/RSS/notifications/Haut de page widget
    //   <div class="bcv-pfc-paging"> ... listing pagination (page 1 of ~70, generated not authored)
    WebImporter.DOMUtils.remove(element, [
      '.header',
      '.footer',
      '.contextmenu',
      '.bcv-pfc-paging',
    ]);

    // Collapse redundant AEM (classic) grid wrapper divs. These carry no
    // authorable content of their own — they only nest their children — so we
    // unwrap them (hoist children up) rather than delete, preserving content.
    // Found in captured DOM: .aem-Grid, .aem-GridColumn, .cmp-container,
    //   .responsivegrid, .cmp-text, .cmp-experiencefragment.
    const WRAPPER_SELECTORS = [
      '.aem-Grid',
      '.aem-GridColumn',
      '.cmp-container',
      '.responsivegrid',
      '.cmp-text',
      '.cmp-experiencefragment',
    ];
    let wrappers = element.querySelectorAll(WRAPPER_SELECTORS.join(','));
    // Iterate repeatedly because unwrapping a parent can expose nested wrappers.
    while (wrappers.length) {
      wrappers.forEach((wrapper) => {
        // Only unwrap plain layout DIVs; never touch semantic elements that
        // may have picked up a grid class.
        if (wrapper.tagName === 'DIV' && wrapper.parentNode) {
          while (wrapper.firstChild) {
            wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
          }
          wrapper.remove();
        } else {
          // Strip the layout classes so they don't re-match on the next pass.
          WRAPPER_SELECTORS.forEach((sel) => wrapper.classList.remove(sel.slice(1)));
        }
      });
      const next = element.querySelectorAll(WRAPPER_SELECTORS.join(','));
      // Guard against an infinite loop if nothing changed.
      if (next.length === wrappers.length) break;
      wrappers = next;
    }

    // Strip leftover non-content elements & data-layer / tracking attributes.
    WebImporter.DOMUtils.remove(element, ['link', 'noscript']);
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer');
      el.removeAttribute('data-cmp-data-layer-enabled');
      el.removeAttribute('data-cmp-hook-image');
    });
  }
}
