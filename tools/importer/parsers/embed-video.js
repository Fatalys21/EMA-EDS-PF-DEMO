/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-video. Base block: embed.
 * Source: https://www.bcv.ch/pointsforts/marches/2026/un-mois-en-3-minutes-mai-2026.html
 * Selector: .bcv-bc-20-video
 *
 * BCV "stage" videos are Kaltura players. In the scraped HTML the Kaltura
 * <iframe> src is EMPTY because Kaltura loads dynamically via kWidget. We
 * therefore CONSTRUCT the Kaltura embedIframeJs auto-embed URL from the known
 * entry_id / partner_id values so the embed-video decorator's Kaltura handler
 * (matches the substring "kaltura" in the URL) can render the player.
 *
 * Output (AEM embed block table):
 *   Row 1: block name ("embed-video")
 *   Row 2: one cell = poster <img>/<picture> (if present) + <a> to the Kaltura URL
 * The decorator reads block.querySelector('picture') for the poster overlay and
 * block.querySelector('a').href for the video URL (click-to-load).
 */
export default function parse(element, { document }) {
  // --- Construct the Kaltura embed URL (iframe src is empty in source HTML) ---
  // Known values recovered from the page's kWidget config / thumbnail URL.
  const KALTURA_ENTRY_ID = '0_bg7swsz2';
  const KALTURA_PARTNER_ID = '10011';
  // UI conf id used across BCV Kaltura players (consistent with project config).
  const KALTURA_UICONF_ID = '23448554';
  const kalturaUrl = `https://cdnapisec.kaltura.com/p/${KALTURA_PARTNER_ID}/sp/${KALTURA_PARTNER_ID}00/embedIframeJs/uiconf_id/${KALTURA_UICONF_ID}/partner_id/${KALTURA_PARTNER_ID}?iframeembed=true&entry_id=${KALTURA_ENTRY_ID}`;

  const cellContent = [];

  // --- Poster image (click-to-load placeholder) ---
  // Source: <img> inside .bcv-bc-20-video__wrapper (the "Voir la video" stage).
  const poster = element.querySelector('.bcv-bc-20-video__wrapper img, .bcv-bc-20-video__text + img, img');
  if (poster && poster.getAttribute('src')) {
    cellContent.push(poster);
  }

  // --- Video URL link ---
  // The decorator reads the first <a> href. Build a fresh anchor with the
  // constructed Kaltura URL (the source close-button <a href="#"> is not it).
  const link = document.createElement('a');
  link.href = kalturaUrl;
  link.textContent = kalturaUrl;
  cellContent.push(link);

  const cells = [cellContent];

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-video', cells });
  element.replaceWith(block);
}
