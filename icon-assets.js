/* Cache image bytes, not just their remote addresses. No editor token is used. */
window.siteIconAssets = (() => {
  const cacheName = "banana-icon-bytes-v1";
  const repositoryBase = "https://raw.githubusercontent.com/huoshiyinggong/banana-nav/main/";
  let manifest = {};
  const bundledPaths = new Set();
  const pending = new Map();

  async function load() {
    try {
      manifest = JSON.parse(localStorage.getItem(cacheName) || "{}");
    } catch (_) { manifest = {}; }
    async function refresh(url, merge) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(2500) });
        if (!response.ok) return;
        const entries = await response.json();
        const valid = Object.fromEntries(Object.entries(entries).filter(([, path]) =>
          typeof path === "string" && /^assets\/site-icons\/[a-f0-9]+\.(png|jpg|gif|webp|ico)$/.test(path)));
        if (merge) Object.values(valid).forEach(path => bundledPaths.add(path));
        manifest = merge ? { ...valid, ...manifest } : valid;
        localStorage.setItem(cacheName, JSON.stringify(manifest));
      } catch (_) { /* The last successful manifest remains usable offline. */ }
    }
    // Use the bundled manifest for first paint. Actions updates are refreshed
    // independently, so a slow raw.githubusercontent.com never delays the grid.
    await refresh("data/icon-assets.json", true);
    void refresh(`${repositoryBase}data/icon-assets.json`, false);
  }

  function archived(source) {
    const path = manifest[source];
    return path ? (bundledPaths.has(path) ? path : repositoryBase + path) : "";
  }

  async function cached(source) {
    if (!window.caches || !source || source.startsWith("data:")) return "";
    try {
      const response = await (await caches.open(cacheName)).match(source);
      return response ? URL.createObjectURL(await response.blob()) : "";
    } catch (_) { return ""; }
  }

  function remember(source) {
    if (!window.caches || !/^https?:/.test(source) || pending.has(source)) return;
    const task = (async () => {
      try {
        const cache = await caches.open(cacheName);
        if (await cache.match(source)) return;
        const response = await fetch(source, {
          mode: "cors", credentials: "omit", cache: "force-cache",
          signal: AbortSignal.timeout(4000),
        });
        if (!response.ok || response.type === "opaque") return;
        const blob = await response.blob();
        if (!blob.type.startsWith("image/") || blob.size > 262144) return;
        await cache.put(source, new Response(blob, { headers: { "Content-Type": blob.type } }));
      } catch (_) { /* CORS/storage failures must not interrupt visible icons. */ }
    })();
    pending.set(source, task);
  }

  return { load, archived, cached, remember };
})();
