/*
 * Shared data helpers for Points Forts article blocks.
 * Fetches the published query indices (articles + authors) once and caches them,
 * so the homepage feed, related-articles, and author byline all read the same data.
 * Every consumer must degrade gracefully when an index is unavailable (e.g. local
 * dev before publish), so these helpers resolve to empty arrays on failure.
 */

const ARTICLE_INDEX = '/pointsforts/query-index.json';
const AUTHOR_INDEX = '/pointsforts/authors-index.json';

const cache = new Map();

async function fetchIndex(path) {
  if (cache.has(path)) return cache.get(path);
  const promise = (async () => {
    try {
      const resp = await fetch(path);
      if (!resp.ok) return [];
      const json = await resp.json();
      return Array.isArray(json.data) ? json.data : [];
    } catch (e) {
      return [];
    }
  })();
  cache.set(path, promise);
  return promise;
}

/** Normalize a link/path to an index key: strip origin, trailing slash and .html. */
export function normalizePath(href) {
  if (!href) return '';
  let path = href;
  try {
    path = new URL(href, window.location.href).pathname;
  } catch (e) {
    // href was already a bare path
  }
  return path.replace(/\.html$/, '').replace(/\/$/, '');
}

export async function getArticles() {
  return fetchIndex(ARTICLE_INDEX);
}

export async function getArticleByPath(href) {
  const key = normalizePath(href);
  const articles = await getArticles();
  return articles.find((a) => normalizePath(a.path) === key) || null;
}

export async function getAuthorByPath(href) {
  const key = normalizePath(href);
  const authors = await fetchIndex(AUTHOR_INDEX);
  return authors.find((a) => normalizePath(a.path) === key) || null;
}

/** Split a comma-separated tags string into a trimmed, lowercased set. */
export function parseTags(tags) {
  if (!tags) return [];
  return tags.split(',').map((t) => t.trim()).filter(Boolean);
}
