/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the Points Forts category landing pages.
 *
 * These four pages back the top-navigation menu (Marchés, Votre argent,
 * Entreprises, Dans le canton). They have no dedicated source URL on bcv.ch —
 * on the origin the sections are rendered by a server-side listing component —
 * so each page is synthesized here as a single self-populating `article-feed`
 * block. The block reads the published article query index at runtime and
 * filters to the category named in its first cell, so the listings stay in sync
 * as articles are added.
 *
 * One category is produced per run; the category is passed via the `category`
 * query parameter on the (otherwise ignored) source URL, e.g.
 *   https://www.bcv.ch/pointsforts.html?category=marches
 */

// section slug -> { label used by the feed filter, page Title }
const CATEGORIES = {
  marches: { label: 'Marchés', title: "Marchés | POINTSFORTS - BCV" },
  'votre-argent': { label: 'Votre argent', title: "Votre argent | POINTSFORTS - BCV" },
  entrepreneurs: { label: 'Entreprises', title: "Entreprises | POINTSFORTS - BCV" },
  'dans-le-canton': { label: 'Dans le canton', title: "Dans le canton | POINTSFORTS - BCV" },
};

function categoryFromUrl(url) {
  try {
    const slug = new URL(url).searchParams.get('category');
    return CATEGORIES[slug] ? slug : null;
  } catch (e) {
    return null;
  }
}

export default {
  transform: (payload) => {
    const { document, url } = payload;

    const slug = categoryFromUrl(url);
    if (!slug) {
      throw new Error(`Missing/unknown ?category= in URL: ${url}`);
    }
    const { label, title } = CATEGORIES[slug];

    const main = document.createElement('div');

    // Section 1: an article-feed block whose single cell carries the category
    // label. The block decorator filters the article index to that category.
    const feed = WebImporter.Blocks.createBlock(document, {
      name: 'article-feed',
      cells: [[label]],
    });
    main.append(feed);

    // Page metadata: just the Title (the feed supplies the article listing).
    const metadata = WebImporter.Blocks.createBlock(document, {
      name: 'Metadata',
      cells: [['Title', title]],
    });
    main.append(metadata);

    return [{
      element: main,
      path: `/pointsforts/${slug}`,
      report: {
        title,
        template: 'category-hub',
        category: label,
        blocks: ['article-feed'],
      },
    }];
  },
};
