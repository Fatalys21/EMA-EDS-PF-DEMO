import { createOptimizedPicture } from '../../scripts/aem.js';
import { getAuthorByPath, normalizePath } from '../../scripts/article-data.js';

/**
 * Article author byline ("article-author").
 * Authoring contract: a single cell containing a link to the author page, e.g.
 *   | article-author |
 *   | [Rachel Perroud](/pointsforts/auteurs/rachel-perroud) |
 *
 * The block resolves the author's photo, name and role from the authors index
 * (authored once on the author page). If the index is unavailable it falls back
 * to any inline photo / name / role the author left in the block, so the byline
 * always renders.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // The author-page link is the anchor that points at /pointsforts/auteurs/.
  const links = [...block.querySelectorAll('a')];
  const authorLink = links.find((a) => /\/auteurs\//.test(a.getAttribute('href') || ''))
    || links[0];

  // Inline fallbacks harvested from whatever the author already typed.
  const inlineImg = block.querySelector('picture img');
  const inlineName = authorLink ? authorLink.textContent.trim() : '';
  const inlineRole = (() => {
    // "Par **Name**, Role, BCV" → the role is the text after the name link.
    const byline = [...block.querySelectorAll('p')].find((p) => p.querySelector('a') === authorLink);
    if (!byline) return '';
    const clone = byline.cloneNode(true);
    clone.querySelectorAll('a, picture, img').forEach((el) => el.remove());
    return clone.textContent.replace(/^\s*par\s*/i, '').replace(/^[\s,]+/, '').trim();
  })();

  const href = authorLink ? authorLink.getAttribute('href') : '';
  const record = href ? await getAuthorByPath(href) : null;

  const name = (record && record.name) || inlineName;
  const role = (record && record.role) || inlineRole;
  const imageSrc = (record && record.image) || (inlineImg && inlineImg.src);
  const authorHref = href ? normalizePath(href) : '';

  if (!name && !imageSrc) return; // nothing to render

  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'article-author-card';

  if (imageSrc) {
    const photoLink = document.createElement('a');
    photoLink.href = authorHref || '#';
    photoLink.className = 'article-author-photo';
    photoLink.append(createOptimizedPicture(imageSrc, name, false, [{ width: '200' }]));
    wrapper.append(photoLink);
  }

  const info = document.createElement('div');
  info.className = 'article-author-info';
  info.insertAdjacentHTML('beforeend', '<p class="article-author-label">Par</p>');

  const nameEl = document.createElement('p');
  nameEl.className = 'article-author-name';
  if (authorHref) {
    const a = document.createElement('a');
    a.href = authorHref;
    a.textContent = name;
    nameEl.append(a);
  } else {
    nameEl.textContent = name;
  }
  info.append(nameEl);

  if (role) {
    const roleEl = document.createElement('p');
    roleEl.className = 'article-author-role';
    roleEl.textContent = role;
    info.append(roleEl);
  }

  wrapper.append(info);
  block.append(wrapper);
}
