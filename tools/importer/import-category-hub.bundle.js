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

  // tools/importer/import-category-hub.js
  var import_category_hub_exports = {};
  __export(import_category_hub_exports, {
    default: () => import_category_hub_default
  });
  var CATEGORIES = {
    marches: { label: "March\xE9s", title: "March\xE9s | POINTSFORTS - BCV" },
    "votre-argent": { label: "Votre argent", title: "Votre argent | POINTSFORTS - BCV" },
    entrepreneurs: { label: "Entreprises", title: "Entreprises | POINTSFORTS - BCV" },
    "dans-le-canton": { label: "Dans le canton", title: "Dans le canton | POINTSFORTS - BCV" }
  };
  function categoryFromUrl(url) {
    try {
      const slug = new URL(url).searchParams.get("category");
      return CATEGORIES[slug] ? slug : null;
    } catch (e) {
      return null;
    }
  }
  var import_category_hub_default = {
    transform: (payload) => {
      const { document, url } = payload;
      const slug = categoryFromUrl(url);
      if (!slug) {
        throw new Error(`Missing/unknown ?category= in URL: ${url}`);
      }
      const { label, title } = CATEGORIES[slug];
      const main = document.createElement("div");
      const feed = WebImporter.Blocks.createBlock(document, {
        name: "article-feed",
        cells: [[label]]
      });
      main.append(feed);
      const metadata = WebImporter.Blocks.createBlock(document, {
        name: "Metadata",
        cells: [["Title", title]]
      });
      main.append(metadata);
      return [{
        element: main,
        path: `/pointsforts/${slug}`,
        report: {
          title,
          template: "category-hub",
          category: label,
          blocks: ["article-feed"]
        }
      }];
    }
  };
  return __toCommonJS(import_category_hub_exports);
})();
