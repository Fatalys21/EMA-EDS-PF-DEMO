/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import hubSidebarParser from './parsers/hub-sidebar.js';

// PARSER REGISTRY
const parsers = {
  'hub-sidebar': hubSidebarParser,
};

// PAGE TEMPLATE CONFIGURATION - the reusable hub sidebar experience fragment
const PAGE_TEMPLATE = {
  name: 'hub-sidebar',
  description: 'Points Forts hub sidebar experience fragment: subscription, financial info, related-articles ("Découvrir") and social portlets.',
  urls: [
    'https://www.bcv.ch/pointsforts.html',
  ],
  // Output the fragment document at the path the hub page references.
  outputPath: '/pointsforts/fragments/hub-sidebar',
  blocks: [
    { name: 'hub-sidebar', instances: ['.cmp-experiencefragment--Home-PointsForts1'] },
  ],
};

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    // Isolate the sidebar experience fragment so nothing else from the hub page
    // (hero, teaser list, header, footer) ends up in the fragment document.
    const xf = document.querySelector(PAGE_TEMPLATE.blocks[0].instances[0]);
    const main = document.createElement('div');
    if (xf) main.append(xf.cloneNode(true));

    // Discover + parse blocks within the isolated fragment.
    const pageBlocks = findBlocksOnPage(main, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    // Built-in image rules only. A reusable fragment carries no page-level
    // metadata (that belongs to the pages that embed it), so createMetadata is
    // intentionally skipped to avoid a stray "Title" block in the fragment.
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    return [{
      element: main,
      path: PAGE_TEMPLATE.outputPath,
      report: {
        title: 'Points Forts Hub Sidebar',
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
