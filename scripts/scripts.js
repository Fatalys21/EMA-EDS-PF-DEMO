import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
} from './aem.js';

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Turns a loose author byline (a photo link + a "Par [Name](author-page), Role"
 * paragraph, both pointing at /pointsforts/auteurs/) into an article-author block,
 * so authors can just paste the byline instead of inserting a block table.
 * Inert when an explicit .article-author block is already present.
 * @param {Element} main The container element
 */
function buildAuthorAutoBlock(main) {
  if (main.querySelector('.article-author')) return;
  const bylineLink = [...main.querySelectorAll('p a[href*="/auteurs/"]')]
    .find((a) => /^\s*par\b/i.test(a.closest('p').textContent));
  if (!bylineLink) return;

  const bylineP = bylineLink.closest('p');
  // Capture the insertion point before buildBlock moves the byline into the block.
  const parent = bylineP.parentNode;
  const anchor = bylineP.nextSibling;

  const cell = [];
  // Include an immediately-preceding author photo paragraph if present.
  const prev = bylineP.previousElementSibling;
  if (prev && prev.tagName === 'P' && prev.querySelector('a[href*="/auteurs/"] picture')) {
    cell.push(prev);
  }
  cell.push(bylineP);

  const block = buildBlock('article-author', { elems: cell });
  parent.insertBefore(block, anchor);
}

/**
 * Turns a "CES ARTICLES POURRAIENT VOUS INTÉRESSER" heading into an
 * article-related block seeded with any authored teaser links, so the related
 * list can be curated by links and auto-filled from the index.
 * Inert when an explicit .article-related block is already present.
 * @param {Element} main The container element
 */
function buildRelatedAutoBlock(main) {
  if (main.querySelector('.article-related')) return;
  const heading = [...main.querySelectorAll('h2, h3')]
    .find((h) => /ces articles pourraient vous/i.test(h.textContent));
  if (!heading) return;

  const section = heading.closest('.section') || heading.parentElement;
  // Collect article links authored in the related section (skip "Suite" links).
  const links = [...section.querySelectorAll('a[href*="/pointsforts/"]')]
    .filter((a) => !/^\s*suite\s*$/i.test(a.textContent) && !a.querySelector('picture'));
  const seen = new Set();
  const rows = [];
  links.forEach((a) => {
    const href = a.getAttribute('href');
    if (seen.has(href)) return;
    seen.add(href);
    const link = document.createElement('a');
    link.href = href;
    link.textContent = a.textContent.trim();
    rows.push([{ elems: [link] }]);
  });

  const block = buildBlock('article-related', rows.length ? rows : [[{ elems: [] }]]);
  // Replace the authored teasers (keep the heading) with the block.
  section.querySelectorAll('.cards-teaser').forEach((c) => c.remove());
  heading.after(block);
}

/**
 * On the Points Forts hub homepage, replaces the manually authored featured hero
 * and teaser-card list with a single live article-feed block (driven by the query
 * index), so the latest published articles surface automatically. The hub sidebar
 * fragment is preserved. Runs only on /pointsforts and is inert once an explicit
 * .article-feed block exists.
 * @param {Element} main The container element
 */
function buildFeedAutoBlock(main) {
  const path = window.location.pathname.replace(/\.html$/, '');
  if (path !== '/pointsforts') return;
  if (main.querySelector('.article-feed')) return;

  const hero = main.querySelector('.hero-article');
  if (!hero) return;

  const block = buildBlock('article-feed', [[{ elems: [] }]]);
  hero.replaceWith(block);
  main.querySelectorAll('.cards-teaser').forEach((c) => c.remove());
}

/**
 * Normalizes the article "stage" so image-led and video-led articles look alike.
 * Video articles already use the embed-video block; here we tag the featured
 * image that leads an article's first section with an article-stage class so it
 * gets the same responsive framing. Only runs inside a /pointsforts/ article
 * (a page whose first section leads with a lone picture and has a following
 * body section), never on the hub or author pages.
 * @param {Element} main The container element
 */
function decorateArticleStage(main) {
  // Runs before decorateSections, so the DOM is still main > div > (p|block).
  const first = main.querySelector(':scope > div');
  if (!first) return;
  // Skip when the stage is a video (embed-video owns its own framing).
  if (first.querySelector('.embed-video')) return;
  const leadPicture = first.querySelector(':scope > p:first-child > picture');
  if (!leadPicture) return;
  const p = leadPicture.closest('p');
  if (p.textContent.trim()) return; // must be an image-only paragraph
  p.classList.add('article-stage');
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // Tag article-detail pages (/pointsforts/{section}/{year}/{slug}) so article
    // styling can be scoped away from the hub, author, and search pages.
    if (/\/pointsforts\/[^/]+\/\d{4}\/[^/]+$/.test(window.location.pathname.replace(/\.html$/, ''))) {
      document.body.classList.add('article-detail');
    }
    decorateArticleStage(main);
    buildFeedAutoBlock(main);
    buildAuthorAutoBlock(main);
    buildRelatedAutoBlock(main);
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Consumes section-metadata blocks and applies them to their parent section
 * as data attributes and style classes, then removes the block. The project's
 * aem.js decorateSections does not handle section-metadata, so we do it here.
 * @param {Element} main The main element
 */
function decorateSectionMetadata(main) {
  main.querySelectorAll('.section-metadata').forEach((meta) => {
    const section = meta.closest('.section');
    if (!section) return;
    [...meta.children].forEach((row) => {
      if (row.children.length === 2) {
        const key = row.children[0].textContent.trim().toLowerCase();
        const value = row.children[1].textContent.trim();
        if (key === 'style') {
          value.split(',').forEach((s) => {
            const cls = s.trim().toLowerCase().replace(/\s+/g, '-');
            if (cls) section.classList.add(cls);
          });
        } else if (key) {
          section.dataset[key] = value;
        }
      }
    });
    meta.remove();
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateSectionMetadata(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
