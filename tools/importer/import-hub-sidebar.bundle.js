/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // tools/importer/import-hub-sidebar.js
  var import_hub_sidebar_exports = {};
  __export(import_hub_sidebar_exports, {
    default: () => import_hub_sidebar_default
  });

  // tools/importer/parsers/hub-sidebar.js
  function parse(element, { document }) {
    const doc = document;
    const rows = [];
    const portlets = element.querySelectorAll(".bcv-pfc-portlet");
    portlets.forEach((portlet) => {
      const titleEl = portlet.querySelector(".bcv-pfc-portlet__title, header");
      const title = titleEl ? titleEl.textContent.trim() : "";
      const body = doc.createElement("div");
      [...portlet.children].forEach((child) => {
        if (titleEl && (child === titleEl || child.contains(titleEl))) return;
        body.append(child.cloneNode(true));
      });
      body.querySelectorAll("a").forEach((a) => {
        const sr = a.querySelector(".sr-only");
        if (sr) {
          const label = sr.textContent.trim();
          a.textContent = label;
        }
      });
      const titleCell = doc.createElement("p");
      titleCell.textContent = title;
      rows.push([titleCell, body]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "hub-sidebar",
      cells: rows
    });
    element.replaceWith(block);
  }

  // tools/importer/import-hub-sidebar.js
  var parsers = {
    "hub-sidebar": parse
  };
  var PAGE_TEMPLATE = {
    name: "hub-sidebar",
    description: 'Points Forts hub sidebar experience fragment: subscription, financial info, related-articles ("D\xE9couvrir") and social portlets.',
    urls: [
      "https://www.bcv.ch/pointsforts.html"
    ],
    // Output the fragment document at the path the hub page references.
    outputPath: "/pointsforts/fragments/hub-sidebar",
    blocks: [
      { name: "hub-sidebar", instances: [".cmp-experiencefragment--Home-PointsForts1"] }
    ]
  };
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_hub_sidebar_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const xf = document.querySelector(PAGE_TEMPLATE.blocks[0].instances[0]);
      const main = document.createElement("div");
      if (xf) main.append(xf.cloneNode(true));
      const pageBlocks = findBlocksOnPage(main, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        }
      });
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      return [{
        element: main,
        path: PAGE_TEMPLATE.outputPath,
        report: {
          title: "Points Forts Hub Sidebar",
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_hub_sidebar_exports);
})();
