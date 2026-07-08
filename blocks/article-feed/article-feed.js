import { loadCSS } from '../../scripts/aem.js';
import { getArticles, normalizePath, parseTags } from '../../scripts/article-data.js';

/**
 * Homepage article feed ("article-feed").
 * Authoring contract: a single block, optionally with a category label —
 *   | article-feed |          → all articles (homepage)
 *   | article-feed |
 *   | Marchés       |          → only articles in the "Marchés" category
 * It fetches the article index, sorts by publication date (newest first), and
 * renders the latest article as a hero teaser and the remainder as a list of
 * teaser cards, reusing the already-styled hero-article and cards-teaser blocks.
 * The homepage and category pages therefore stay up to date automatically as
 * articles are added.
 * @param {Element} block The block element
 */

/** Build a "?tag=pointsforts__slug" search link matching the source tag URLs. */
function tagSlug(label) {
  return label
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Category label → section path slug. The visible label ("Entreprises") differs
// from the section slug ("entrepreneurs"), so map the known categories explicitly.
const CATEGORY_PATHS = {
  entreprises: 'entrepreneurs',
  'votre argent': 'votre-argent',
  marchés: 'marches',
  'dans le canton': 'dans-le-canton',
};

function categoryPath(category) {
  const key = (category || '').trim().toLowerCase();
  const slug = CATEGORY_PATHS[key] || tagSlug(category);
  return `/pointsforts/${slug}.html`;
}

function tagsHTML(tags, separator) {
  return parseTags(tags)
    .map((t) => `<a href="/pointsforts/recherche.html?tag=pointsforts__${tagSlug(t)}">${t}</a>`)
    .join(separator);
}

function formatDate(iso) {
  if (!iso) return '';
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function buildHero(article) {
  const href = normalizePath(article.path);
  const hero = document.createElement('div');
  hero.className = 'hero-article';
  hero.innerHTML = `
    <div><div><a href="${href}"><picture><img src="${article.image}" alt=""></picture></a></div></div>
    <div><div>
      <h2 id="hero-title"><a href="${href}">${article.title || ''}</a></h2>
      <p>${article.description || ''}</p>
      ${article.author ? `<p>Par <a href="${normalizePath(article.authorPath || '')}">${article.author}</a></p>` : ''}
      ${article.category ? `<p><a href="${categoryPath(article.category)}">${article.category}</a></p>` : ''}
      ${article.tags ? `<p><em>Mots-clés:</em> ${tagsHTML(article.tags, ', ')}</p>` : ''}
      <p><a href="${href}">Suite</a></p>
    </div></div>`;
  return hero;
}

function buildCard(article) {
  const href = normalizePath(article.path);
  const card = document.createElement('div');
  card.className = 'cards-teaser';
  card.innerHTML = `
    <div>
      <div><picture><img src="${article.image}" alt=""></picture></div>
      <div>
        ${article.category ? `<p><strong>${article.category}</strong></p>` : ''}
        <h2 id="card-title"><a href="${href}">${article.title || ''}</a></h2>
        <p>${article.description || ''}</p>
        <p><a href="${href}">Suite</a></p>
        ${article.author ? `<p><em>Par ${article.author}</em></p>` : ''}
        ${article.publicationDate ? `<p>${formatDate(article.publicationDate)}</p>` : ''}
        ${article.tags ? `<p>${tagsHTML(article.tags, ' · ')}</p>` : ''}
      </div>
    </div>`;
  return card;
}

export default async function decorate(block) {
  // Optional category filter: if the block has authored text (e.g. "Marchés"),
  // limit the feed to that category. Read it before clearing the block.
  const categoryFilter = block.textContent.trim().toLowerCase();

  // Only real article-detail pages belong in the feed. Guard against index rows
  // that lack a template (older content) by also requiring a dated, sectioned
  // path (/pointsforts/{section}/{year}/{slug}) and excluding the hub itself.
  const isArticle = (a) => {
    const path = normalizePath(a.path);
    if (path === '/pointsforts') return false;
    if (a.template && a.template !== 'article-detail') return false;
    return /^\/pointsforts\/[^/]+\/\d{4}\/[^/]+$/.test(path);
  };

  const articles = (await getArticles())
    .filter(isArticle)
    .filter((a) => !categoryFilter || (a.category || '').trim().toLowerCase() === categoryFilter)
    .sort((a, b) => new Date(b.publicationDate || 0) - new Date(a.publicationDate || 0));

  // If the index has no usable articles yet (e.g. before publish), leave the
  // authored hero/cards in place rather than blanking the homepage.
  if (!articles.length) return;

  block.textContent = '';
  const [latest, ...rest] = articles;
  const frag = document.createDocumentFragment();
  frag.append(buildHero(latest));
  rest.forEach((article) => frag.append(buildCard(article)));
  block.append(frag);

  // Decorate the generated teasers with the existing, already-styled blocks.
  // Load their CSS too: because these blocks are created here (not via the normal
  // EDS loadBlock flow) their stylesheets aren't auto-injected, so the chevron
  // notch and horizontal card layout would be missing without this.
  const base = window.hlx.codeBasePath;
  const [{ default: decorateHero }, { default: decorateCards }] = await Promise.all([
    import('../hero-article/hero-article.js'),
    import('../cards-teaser/cards-teaser.js'),
    loadCSS(`${base}/blocks/hero-article/hero-article.css`),
    loadCSS(`${base}/blocks/cards-teaser/cards-teaser.css`),
  ]);
  block.querySelectorAll('.hero-article').forEach((el) => decorateHero(el));
  block.querySelectorAll('.cards-teaser').forEach((el) => decorateCards(el));
}
