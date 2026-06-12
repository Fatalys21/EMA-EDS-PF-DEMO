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

  // tools/importer/import-article-hub.js
  var import_article_hub_exports = {};
  __export(import_article_hub_exports, {
    default: () => import_article_hub_default
  });

  // tools/importer/parsers/hero-article.js
  function parse(element, { document: document2 }) {
    const mediaImg = element.querySelector(
      ".bcv-pfc-hero-article-teaser__media img, .bcv-pfc-hero-article-teaser__media picture, img"
    );
    let mediaContent = null;
    if (mediaImg) {
      const mediaLink = mediaImg.closest("a");
      mediaContent = mediaLink || mediaImg;
    }
    const contentCell = [];
    const titleEl = element.querySelector(
      ".bcv-pfc-hero-article-teaser__title h1, .bcv-pfc-hero-article-teaser__title h2, .bcv-pfc-hero-article-teaser__title h3, header h2, h2.title, h1"
    );
    if (titleEl) contentCell.push(titleEl);
    const excerptParas = Array.from(
      element.querySelectorAll(".bcv-pfc-hero-article-teaser__text-wrapper > a > p, .bcv-pfc-hero-article-teaser__text-wrapper > p")
    );
    excerptParas.forEach((p) => contentCell.push(p));
    const author = element.querySelector(".bcv-pfc-hero-article-teaser__author");
    if (author) {
      const authorP = document2.createElement("p");
      authorP.append(...author.childNodes);
      contentCell.push(authorP);
    }
    const category = element.querySelector(
      ".bcv-pfc-hero-article-teaser__list-meta-category a, .bcv-pfc-hero-article-teaser__list-meta-category"
    );
    if (category) {
      const categoryP = document2.createElement("p");
      categoryP.append(category);
      contentCell.push(categoryP);
    }
    const tagsWrap = element.querySelector(".bcv-pfc-hero-article-teaser__list-tags .bcv-pfc-tags, .bcv-pfc-hero-article-teaser__list-tags");
    if (tagsWrap) {
      const tagTitle = tagsWrap.querySelector(".bcv-pfc-tags__title");
      const tagLinks = Array.from(tagsWrap.querySelectorAll("ul li a"));
      if (tagLinks.length) {
        const tagsP = document2.createElement("p");
        if (tagTitle) {
          const label = document2.createElement("em");
          label.textContent = `${tagTitle.textContent.trim()} `;
          tagsP.append(label);
        }
        tagLinks.forEach((a, i) => {
          if (i > 0) tagsP.append(document2.createTextNode(", "));
          tagsP.append(a);
        });
        contentCell.push(tagsP);
      }
    }
    const more = element.querySelector("a.bcv-pfc-hero-article-teaser__more");
    if (more) {
      const moreP = document2.createElement("p");
      moreP.append(more);
      contentCell.push(moreP);
    }
    const cells = [];
    cells.push([mediaContent || ""]);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-article", cells });
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

  // tools/importer/parsers/fragment.js
  function parse3(element, { document: document2 }) {
    const fragmentPath = "/pointsforts/fragments/hub-sidebar";
    const link = document2.createElement("a");
    link.href = fragmentPath;
    link.textContent = fragmentPath;
    const cells = [[link]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "fragment", cells });
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

  // tools/importer/import-article-hub.js
  var parsers = {
    "hero-article": parse,
    "cards-teaser": parse2,
    fragment: parse3
  };
  var PAGE_TEMPLATE = {
    name: "article-hub",
    description: "Points Forts hub/listing homepage: header with nav and search, featured hero article, grid of article teaser cards, sidebar, pagination, footer.",
    urls: [
      "https://www.bcv.ch/pointsforts.html"
    ],
    sections: [
      { section: 1, style: "light", selector: ".heroarticleteaser" },
      { section: 2, style: "light", selector: ".articleteaserlist" }
    ],
    blocks: [
      { name: "hero-article", instances: [".bcv-pfc-hero-article-teaser"] },
      { name: "cards-teaser", instances: [".articleteaserlist .bcv-pfc-article-teaser"] },
      { name: "fragment", instances: [".experiencefragment .cmp-experiencefragment"] }
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
  var import_article_hub_default = {
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
  return __toCommonJS(import_article_hub_exports);
})();
