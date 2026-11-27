import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { imageExtension, publicAddress } from "../scripts/cache-icons.mjs";

test("archive accepts image signatures, not HTML error pages", () => {
  assert.equal(imageExtension(Buffer.from("89504e470d0a1a0a00000000", "hex")), "png");
  assert.equal(imageExtension(Buffer.from("ffd8ffe00000000000000000", "hex")), "jpg");
  assert.equal(imageExtension(Buffer.from("<html>not an icon</html>")), "");
});

test("archive rejects private and local addresses", () => {
  for (const address of ["127.0.0.1", "10.1.1.1", "192.168.1.2", "172.16.1.1", "169.254.169.254", "::1", "100.64.1.1"]) {
    assert.equal(publicAddress(address), false);
  }
  assert.equal(publicAddress("8.8.8.8"), true);
});

test("manifest only resolves archived safe paths and keeps source-specific matches", async () => {
  const storage = new Map();
  const context = {
    window: {}, AbortSignal,
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    fetch: async () => ({ ok: true, json: async () => ({
      "https://example.com/icon.png": "assets/site-icons/abcdef.png",
      "https://bad.test/icon.png": "https://another.test/track.png",
    }) }),
  };
  vm.runInNewContext(await readFile(new URL("../icon-assets.js", import.meta.url), "utf8"), context);
  await context.window.siteIconAssets.load();
  assert.equal(context.window.siteIconAssets.archived("https://example.com/icon.png"), "assets/site-icons/abcdef.png");
  assert.equal(context.window.siteIconAssets.archived("https://bad.test/icon.png"), "");
  assert.equal(context.window.siteIconAssets.archived("https://example.com/new.png"), "");
});

test("image byte cache returns a local blob without fetching the source", async () => {
  let networkCalls = 0;
  const cache = { match: async () => ({ blob: async () => new Blob(["image"]) }) };
  const context = { window: { caches: true }, caches: { open: async () => cache },
    URL: { createObjectURL: () => "blob:cached-image" },
    fetch: async () => { networkCalls++; },
  };
  vm.runInNewContext(await readFile(new URL("../icon-assets.js", import.meta.url), "utf8"), context);
  assert.equal(await context.window.siteIconAssets.cached("https://example.com/icon.png"), "blob:cached-image");
  assert.equal(networkCalls, 0);
});

test("cached manifest does not wait for a slow network refresh", async () => {
  const context = {
    window: {}, AbortSignal,
    localStorage: {
      getItem: () => JSON.stringify({ "https://example.com/icon.png": "assets/site-icons/abcdef.png" }),
      setItem() {},
    },
    fetch: () => new Promise(() => {}),
  };
  vm.runInNewContext(await readFile(new URL("../icon-assets.js", import.meta.url), "utf8"), context);
  const result = await Promise.race([
    context.window.siteIconAssets.load().then(() => "ready"),
    new Promise(resolve => setTimeout(() => resolve("blocked"), 50)),
  ]);
  assert.equal(result, "ready");
  assert.equal(context.window.siteIconAssets.archived("https://example.com/icon.png"), "assets/site-icons/abcdef.png");
});

test("cached navigation renders before GitHub resolves, unchanged data does not rebuild icons", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");
  const start = source.indexOf("async function bootstrap() {");
  const end = source.indexOf('\ndocument.querySelector("#export-navigation")', start);
  const data = [{ title: "主页", sites: [] }];
  let finishSync;
  let renders = 0;
  const context = {
    sections: data, pendingBookmarkSite: null, isAdminMode: false,
    sectionsStorageKey: "sections", sectionsVersionKey: "version", sectionsDataVersion: "1",
    window: { siteIconAssets: { load: async () => {} }, githubNavigation: {
      token: "", load: () => new Promise(resolve => { finishSync = resolve; }),
    } },
    getBookmarkSiteFromUrl: () => null, loadSections: async () => {},
    refreshWidgetFeeds() {}, renderSections() { renders++; },
    ensureHomeSection() {}, removeFallbackSiteIcons() {},
    setAdminMode() {}, setSyncStatus() {}, handlePendingBookmarkSite() {},
    localStorage: { setItem() {} }, document: { querySelector: () => ({}) },
  };
  vm.runInNewContext(source.slice(start, end), context);
  const ready = context.bootstrap();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(renders, 1, "first paint must not wait for GitHub");
  finishSync(data);
  await ready;
  assert.equal(renders, 1, "unchanged synchronization must preserve loaded images");
});
