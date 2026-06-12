/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroArticleParser from './parsers/hero-article.js';
import cardsTeaserParser from './parsers/cards-teaser.js';
import fragmentParser from './parsers/fragment.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/pointsforts-cleanup.js';
import sectionsTransformer from './transformers/pointsforts-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-article': heroArticleParser,
  'cards-teaser': cardsTeaserParser,
  fragment: fragmentParser,
};

// PAGE TEMPLATE CONFIGURATION - embedded from page-templates.json (article-hub)
const PAGE_TEMPLATE = {
  name: 'article-hub',
  description: 'Points Forts hub/listing homepage: header with nav and search, featured hero article, grid of article teaser cards, sidebar, pagination, footer.',
  urls: [
    'https://www.bcv.ch/pointsforts.html',
  ],
  sections: [
    { section: 1, style: 'light', selector: '.heroarticleteaser' },
    { section: 2, style: 'light', selector: '.articleteaserlist' },
  ],
  blocks: [
    { name: 'hero-article', instances: ['.bcv-pfc-hero-article-teaser'] },
    { name: 'cards-teaser', instances: ['.articleteaserlist .bcv-pfc-article-teaser'] },
    { name: 'fragment', instances: ['.experiencefragment .cmp-experiencefragment'] },
  ],
};

// TRANSFORMER REGISTRY (section transformer runs only when 2+ sections)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. discover blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. parse each block
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
