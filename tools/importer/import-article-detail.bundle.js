/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-article-detail.js
  var import_article_detail_exports = {};
  __export(import_article_detail_exports, {
    default: () => import_article_detail_default
  });

  // tools/importer/parsers/embed-video.js
  function parse(element, { document: document2 }) {
    const KALTURA_ENTRY_ID = "0_bg7swsz2";
    const KALTURA_PARTNER_ID = "10011";
    const KALTURA_UICONF_ID = "23448554";
    const kalturaUrl = `https://cdnapisec.kaltura.com/p/${KALTURA_PARTNER_ID}/sp/${KALTURA_PARTNER_ID}00/embedIframeJs/uiconf_id/${KALTURA_UICONF_ID}/partner_id/${KALTURA_PARTNER_ID}?iframeembed=true&entry_id=${KALTURA_ENTRY_ID}`;
    const cellContent = [];
    const poster = element.querySelector(".bcv-bc-20-video__wrapper img, .bcv-bc-20-video__text + img, img");
    if (poster && poster.getAttribute("src")) {
      cellContent.push(poster);
    }
    const link = document2.createElement("a");
    link.href = kalturaUrl;
    link.textContent = kalturaUrl;
    cellContent.push(link);
    const cells = [cellContent];
    const block = WebImporter.Blocks.createBlock(document2, { name: "embed-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-teaser.js
  function parse2(element, { document: document2 }) {
    const img = element.querySelector(".bcv-pfc-article-teaser__media img, .bcv-pfc-portlet__media-left img, img");
    const body = [];
    const category = element.querySelector(".bcv-pfc-article-teaser__list-meta-category a, .bcv-pfc-article-teaser__list-meta-category");
    if (category) {
      const catP = document2.createElement("p");
      const strong = document2.createElement("strong");
      strong.textContent = (category.textContent || "").trim();
      catP.append(strong);
      body.push(catP);
    }
    const heading = element.querySelector(".bcv-pfc-article-teaser__title, .bcv-pfc-portlet__media-body h3, h2, h3");
    if (heading) body.push(heading);
    const excerptLink = element.querySelector(".bcv-pfc-article-teaser__text-link, .bcv-pfc-portlet__media-body-link");
    if (excerptLink) {
      const excerptP = document2.createElement("p");
      excerptP.textContent = (excerptLink.textContent || "").trim();
      body.push(excerptP);
    }
    const textContainer = element.querySelector(".bcv-pfc-article-teaser__text, .bcv-pfc-portlet__media-body");
    if (textContainer) {
      const ctaLink = Array.from(textContainer.querySelectorAll(":scope p > a")).find(
        (a) => !a.classList.contains("bcv-pfc-article-teaser__text-link") && !a.classList.contains("bcv-pfc-portlet__media-body-link")
      );
      if (ctaLink) {
        const ctaP = document2.createElement("p");
        ctaP.append(ctaLink);
        body.push(ctaP);
      }
    }
    const author = element.querySelector(".bcv-pfc-article-teaser__author");
    if (author) {
      const authorP = document2.createElement("p");
      const em = document2.createElement("em");
      em.textContent = (author.textContent || "").replace(/\s+/g, " ").trim();
      authorP.append(em);
      body.push(authorP);
    }
    const date = element.querySelector(".bcv-pfc-article-teaser__list-meta .date, .date");
    if (date) {
      const dateP = document2.createElement("p");
      dateP.textContent = (date.textContent || "").trim();
      body.push(dateP);
    }
    const tagLinks = Array.from(element.querySelectorAll(".bcv-pfc-tags ul li a"));
    if (tagLinks.length) {
      const tagsP = document2.createElement("p");
      tagLinks.forEach((a, i) => {
        if (i > 0) tagsP.append(document2.createTextNode(" \xB7 "));
        tagsP.append(a);
      });
      body.push(tagsP);
    }
    const imageCell = [];
    if (img) imageCell.push(img);
    const cells = [[imageCell, body]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-teaser", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/pointsforts-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".cp02-social-disclaimer",
        ".modal",
        ".bcv-pfc-modal"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".header",
        ".footer",
        ".contextmenu",
        ".bcv-pfc-paging"
      ]);
      const WRAPPER_SELECTORS = [
        ".aem-Grid",
        ".aem-GridColumn",
        ".cmp-container",
        ".responsivegrid",
        ".cmp-text",
        ".cmp-experiencefragment"
      ];
      let wrappers = element.querySelectorAll(WRAPPER_SELECTORS.join(","));
      while (wrappers.length) {
        wrappers.forEach((wrapper) => {
          if (wrapper.tagName === "DIV" && wrapper.parentNode) {
            while (wrapper.firstChild) {
              wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
            }
            wrapper.remove();
          } else {
            WRAPPER_SELECTORS.forEach((sel) => wrapper.classList.remove(sel.slice(1)));
          }
        });
        const next = element.querySelectorAll(WRAPPER_SELECTORS.join(","));
        if (next.length === wrappers.length) break;
        wrappers = next;
      }
      WebImporter.DOMUtils.remove(element, ["link", "noscript"]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer");
        el.removeAttribute("data-cmp-data-layer-enabled");
        el.removeAttribute("data-cmp-hook-image");
      });
    }
  }

  // tools/importer/transformers/pointsforts-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const template = payload && payload.template || {};
    const sections = Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || document;
    const resolveBoundary = (selector) => {
      const match = element.querySelector(selector);
      if (!match) return null;
      let node = match;
      while (node.parentNode && node.parentNode !== element) {
        node = node.parentNode;
      }
      return node.parentNode === element ? node : match;
    };
    const ordered = [...sections].sort((a, b) => (b.section || 0) - (a.section || 0));
    ordered.forEach((section) => {
      const boundary = resolveBoundary(section.selector);
      if (!boundary) return;
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (boundary.nextSibling) {
          boundary.parentNode.insertBefore(metaBlock, boundary.nextSibling);
        } else {
          boundary.parentNode.appendChild(metaBlock);
        }
      }
      if ((section.section || 0) > 1) {
        const hr = doc.createElement("hr");
        boundary.parentNode.insertBefore(hr, boundary);
      }
    });
  }

  // tools/importer/import-article-detail.js
  var parsers = {
    "embed-video": parse,
    "cards-teaser": parse2
  };
  var PAGE_TEMPLATE = {
    name: "article-detail",
    description: "Points Forts article detail page: header, Kaltura video stage, article body, related articles, footer.",
    urls: [
      "https://www.bcv.ch/pointsforts/marches/2026/un-mois-en-3-minutes-mai-2026.html",
      "https://www.bcv.ch/pointsforts/entrepreneurs/2026/quels-outils-pour-la-geston-de-ma-pme-.html",
      "https://www.bcv.ch/pointsforts/votre-argent/2026/organiser-son-patrimoine-en-vue-de-sa-retraite.html",
      "https://www.bcv.ch/pointsforts/entrepreneurs/2026/pme--quand-demander-une-garantie-bancaire.html",
      "https://www.bcv.ch/pointsforts/dans-le-canton/2026/pib-vaudois--croissance-ralentie-dans-un-contexte-incertain.html"
    ],
    sections: [
      { section: 1, style: "light", selector: ".bcv-pfc-stage" },
      { section: 2, style: "light", selector: ".bcv-pfc-tags" },
      { section: 3, style: "light", selector: ".relatedarticles" }
    ],
    blocks: [
      { name: "embed-video", instances: [".bcv-bc-20-video"] },
      { name: "cards-teaser", instances: [".relatedarticles .bcv-pfc-portlet__media"] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_article_detail_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_article_detail_exports);
})();
