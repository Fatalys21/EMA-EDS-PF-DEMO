import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  // dual-fetch: localhost / aem up serves the html-folder at /content; fall back to footerPath
  let fragment = null;
  const resp = await fetch('/content/footer.plain.html');
  if (resp.ok) {
    const html = await resp.text();
    fragment = document.createElement('div');
    fragment.innerHTML = html;
  } else {
    fragment = await loadFragment(footerPath);
  }

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // label sections: brand, navigation, legal
  const sectionClasses = ['footer-brand', 'footer-nav', 'footer-legal'];
  sectionClasses.forEach((c, i) => {
    if (footer.children[i]) footer.children[i].classList.add(c);
  });

  block.append(footer);
}
