import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { pathToFileURL } from "node:url";

export function imageExtension(bytes) {
  const hex = bytes.subarray(0, 12).toString("hex");
  if (hex.startsWith("89504e470d0a1a0a")) return "png";
  if (hex.startsWith("ffd8ff")) return "jpg";
  if (hex.startsWith("474946383761") || hex.startsWith("474946383961")) return "gif";
  if (hex.startsWith("00000100")) return "ico";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  return "";
}

export function publicAddress(address) {
  if (isIP(address) !== 4) return false;
  const [a, b] = address.split(".").map(Number);
  return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127));
}

async function download(source) {
  let url = new URL(source);
  const signal = AbortSignal.timeout(5000);
  for (let redirects = 0; redirects < 4; redirects++) {
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) throw new Error("非公开图片地址");
    const addresses = await lookup(url.hostname, { all: true, family: 4 });
    if (!addresses.length || addresses.some(({ address }) => !publicAddress(address))) throw new Error("非公网地址");
    const response = await fetch(url, { signal, redirect: "manual" });
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      url = new URL(response.headers.get("location"), url);
      continue;
    }
    if (!response.ok || Number(response.headers.get("content-length")) > 262144) throw new Error("图片不可用");
    const chunks = [];
    let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 262144) throw new Error("图片过大");
      chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks);
    const extension = imageExtension(bytes);
    if (!extension) throw new Error("不是支持的图片文件");
    return { bytes, extension };
  }
  throw new Error("重定向过多");
}

export async function cacheIcons(input = "sites.json") {
  const sections = JSON.parse(await readFile(input, "utf8"));
  let previous = {};
  try { previous = JSON.parse(await readFile("data/icon-assets.json", "utf8")); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const sites = sections.flatMap(section => section.sites);
  const sources = [...new Set(sites
    .map(site => site.icon).filter(source => /^https?:\/\//.test(source || "")))];
  const manifest = {};
  let downloaded = 0;
  let failed = 0;
  await mkdir("assets/site-icons", { recursive: true });
  await mkdir("data", { recursive: true });
  const queue = [...sources];
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const source = queue.shift();
      const saved = previous[source];
      if (/^assets\/site-icons\/[a-f0-9]+\.(png|jpg|gif|webp|ico)$/.test(saved || "")) {
        try { await access(saved); manifest[source] = saved; continue; }
        catch (_) { /* Re-fetch a missing archived file. */ }
      }
      try {
        let image;
        const site = sites.find(site => site.icon === source);
        const candidates = [source, `https://a.favicon.im/${new URL(site.url).hostname}?larger=true`];
        for (const candidate of new Set(candidates)) {
          try { image = await download(candidate); break; }
          catch (_) { /* Try the favicon provider only if the saved image failed. */ }
        }
        if (!image) throw new Error("图标暂不可用");
        const { bytes, extension } = image;
        const hash = createHash("sha256").update(bytes).digest("hex");
        const path = `assets/site-icons/${hash}.${extension}`;
        await writeFile(path, bytes);
        manifest[source] = path;
        downloaded++;
      } catch (_) { failed++; }
    }
  }));
  const ordered = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile("data/icon-assets.json", JSON.stringify(ordered, null, 2) + "\n");
  console.log(`Icons: ${sources.length} sources, ${Object.keys(manifest).length} archived, ${downloaded} downloaded, ${failed} retain remote fallback`);
  return ordered;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await cacheIcons(process.argv[2]);
}
