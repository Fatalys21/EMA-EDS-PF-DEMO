import { createOptimizedPicture } from '../../scripts/aem.js';
import {
  getArticles, getArticleByPath, normalizePath, parseTags,
} from '../../scripts/article-data.js';

const MAX_CARDS = 3;

/**
 * Related articles ("article-related").
 * Authoring contract — a single-column block where each row is one article link:
 *   | article-related |
 *   | [Article A](/pointsforts/...) |
 *   | [Article B](/pointsforts/...) |
 * The author may leave rows empty. For each pasted link the block fetches the
 * article's image, title and excerpt from the index and renders a card with a
 * "Suite" button. If fewer than 3 links are supplied it auto-fills the rest with
 * recent articles sharing the current page's category or keyword tags (newest
 * first), excluding the current page and any already-listed articles.
 * @param {Element} block The block element
 */

function buildCard(article) {
  const li = document.createElement('li');
  const href = normalizePath(article.path);

  const imageCell = document.createElement('div');
  imageCell.className = 'article-related-card-image';
  if (article.image) {
    const a = document.createElement('a');
    a.href = href;
    a.append(createOptimizedPicture(article.image, article.title || '', false, [{ width: '400' }]));
    imageCell.append(a);
  }

  const body = document.createElement('div');
  body.className = 'article-related-card-body';
  body.innerHTML = `
    <h3 class="article-related-card-title"><a href="${href}">${article.title || ''}</a></h3>
    <p class="article-related-card-excerpt">${article.description || ''}</p>
    <p class="article-related-card-suite"><a href="${href}">Suite</a></p>`;

  li.append(imageCell, body);
  return li;
}

async function resolveCurated(block) {
  const links = [...block.querySelectorAll('a[href]')];
  const results = await Promise.all(links.map(async (a) => {
    const href = a.getAttribute('href');
    const record = await getArticleByPath(href);
    // Fall back to whatever text the author linked when the index lacks the entry.
    return record || {
      path: href, title: a.textContent.trim(), description: '', image: '',
    };
  }));
  return results;
}

async function resolveAutoFill(exclude) {
  const articles = await getArticles();
  const currentPath = normalizePath(window.location.pathname);
  const current = articles.find((a) => normalizePath(a.path) === currentPath);
  const currentTags = current ? parseTags(current.tags) : [];
  const currentCategory = current ? current.category : '';

  const excluded = new Set([currentPath, ...exclude.map((a) => normalizePath(a.path))]);

  return articles
    .filter((a) => !excluded.has(normalizePath(a.path)))
    .filter((a) => a.template === 'article-detail' || !a.template)
    .map((a) => {
      const shared = parseTags(a.tags).filter((t) => currentTags.includes(t)).length;
      const sameCat = currentCategory && a.category === currentCategory ? 1 : 0;
      return { article: a, score: shared + sameCat };
    })
    .sort((x, y) => y.score - x.score
      || new Date(y.article.publicationDate || 0) - new Date(x.article.publicationDate || 0))
    .map((x) => x.article);
}

export default async function decorate(block) {
  const curated = await resolveCurated(block);
  const chosen = curated.filter((a) => a.title || a.image).slice(0, MAX_CARDS);

  if (chosen.length < MAX_CARDS) {
    const autofill = await resolveAutoFill(chosen);
    chosen.push(...autofill.slice(0, MAX_CARDS - chosen.length));
  }

  block.textContent = '';
  if (!chosen.length) return;

  const ul = document.createElement('ul');
  chosen.forEach((article) => ul.append(buildCard(article)));
  block.append(ul);
}
