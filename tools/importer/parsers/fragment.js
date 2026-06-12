/* eslint-disable */
/* global WebImporter */
/**
 * Parser for fragment. Base block: fragment.
 * Source: https://www.bcv.ch/pointsforts.html
 * Selector: .experiencefragment .cmp-experiencefragment
 * Generated: 2026-06-12
 *
 * The BCV Points Forts hub sidebar is an AEM Experience Fragment containing
 * stacked informational portlets ("S'abonner", "Informations financières",
 * "DÉCOUVRIR", "SUR LES RÉSEAUX"). For the EDS migration this reusable sidebar
 * is modeled as a standard EDS fragment block that REFERENCES a separate
 * fragment document. The vanilla fragment block decorator
 * (blocks/fragment/fragment.js) reads the first <a> href (falling back to the
 * cell text) and loads `${path}.plain.html`. The sidebar's actual content is
 * authored separately at the referenced path; here we emit only the reference
 * the decorator needs to load it.
 */
export default function parse(element, { document }) {
  // Path to the reusable fragment document holding the hub sidebar content.
  const fragmentPath = '/pointsforts/fragments/hub-sidebar';

  // The fragment block decorator loads the fragment from the first <a> href
  // (or the trimmed cell text). Emit an anchor so the path is unambiguous.
  const link = document.createElement('a');
  link.href = fragmentPath;
  link.textContent = fragmentPath;

  // Standard EDS fragment block: single row, single cell containing the
  // reference to the fragment document path.
  const cells = [[link]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'fragment', cells });
  element.replaceWith(block);
}
