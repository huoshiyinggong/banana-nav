import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const HOT_SEARCH_URL = "https://top.baidu.com/api/board?platform=pc&tab=homepage";

async function requestJson(url, headers = {}, fetcher = fetch) {
  const response = await fetcher(url, {
    headers: { Accept: "application/json", ...headers },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`数据源 HTTP ${response.status}`);
  return response.json();
}

export function normalizeHotItems(payload) {
  const cards = payload?.data?.cards || [];
  const card = cards.find((item) => item.component === "hotList");
  const items = (card?.content || []).map((item) => ({
    title: String(item.word || item.query || "").trim(),
    url: /^https?:\/\//i.test(item.url || item.rawUrl || "") ? item.url || item.rawUrl : "",
    metric: String(item.hotScore || ""),
  })).filter((item) => item.title).slice(0, 10);
  if (!items.length) throw new Error("百度热搜返回空列表");
  return items;
}

function dayLabel(date, index) {
  if (index === 0) return "今天";
  return new Intl.DateTimeFormat("zh-CN", { weekday: "short", timeZone: "Asia/Shanghai" }).format(new Date(`${date}T12:00:00+08:00`));
}

export function normalizeWeather(current, forecast, hourly, config) {
  const now = current.now;
  if (current.code !== "200" || !now || now.temp == null || forecast.code !== "200" || !forecast.daily?.length) {
    throw new Error(`和风数据不可用（${current.code || "未知"}/${forecast.code || "未知"}）`);
  }
  const daily = forecast.daily.slice(0, 7).map((item, index) => ({
    date: item.fxDate, label: dayLabel(item.fxDate, index),
    text: item.textDay || item.textNight || "", icon: item.iconDay || item.iconNight || "",
    tempMin: item.tempMin, tempMax: item.tempMax,
    sunrise: item.sunrise, sunset: item.sunset,
    humidity: item.humidity, precip: item.precip, pressure: item.pressure, uvIndex: item.uvIndex,
  }));
  const fields = ["temp", "feelsLike", "text", "icon", "obsTime", "windDir", "windScale", "windSpeed", "humidity", "precip", "pressure", "vis", "cloud", "dew"];
  return {
    city: config.city, province: config.province, locationName: `${config.province} · ${config.city}`,
    current: Object.fromEntries(fields.map((key) => [key, now[key]])),
    range: { min: daily[0].tempMin, max: daily[0].tempMax },
    daily, forecast: daily.slice(1).map((item, index) => ({ ...item, label: index === 0 ? "明天" : item.label })),
    hourly: hourly?.code === "200" && Array.isArray(hourly.hourly) ? hourly.hourly.slice(0, 24).map((item) => ({
      fxTime: item.fxTime, temp: item.temp, icon: item.icon, text: item.text,
    })) : [],
    updateTime: current.updateTime || now.obsTime,
    refer: { sources: [...new Set([...(current.refer?.sources || []), ...(forecast.refer?.sources || [])])], license: [...new Set([...(current.refer?.license || []), ...(forecast.refer?.license || [])])] },
  };
}

export async function fetchWeather(env = process.env, fetcher = fetch) {
  if (!env.QWEATHER_API_KEY) throw new Error("未配置 QWEATHER_API_KEY");
  const host = env.QWEATHER_API_HOST || "m562b8gw6w.re.qweatherapi.com";
  if (!/^[a-z0-9-]+(?:\.re)?\.qweatherapi\.com$/i.test(host)) throw new Error("QWEATHER_API_HOST 格式不正确");
  const location = env.QWEATHER_LOCATION || "114.04,22.69";
  const query = new URLSearchParams({ location, lang: "zh" });
  const headers = { "X-QW-Api-Key": env.QWEATHER_API_KEY };
  const get = (path) => requestJson(`https://${host}/v7/weather/${path}?${query}`, headers, fetcher);
  const [current, daily, hourlyResult] = await Promise.all([get("now"), get("7d"), get("24h").catch(() => null)]);
  return normalizeWeather(current, daily, hourlyResult, {
    city: env.QWEATHER_CITY_NAME || "龙华", province: env.QWEATHER_PROVINCE_NAME || "广东省",
  });
}

export function shouldRefreshWeather(previous, now, hasKey) {
  if (hasKey && previous?.status === "unconfigured") return true;
  const attempted = Date.parse(previous?.lastAttemptAt || "");
  return !Number.isFinite(attempted) || now - attempted >= 30 * 60 * 1000;
}

export async function refreshSnapshot(previous, loader, source, now, configured = true) {
  const lastAttemptAt = new Date(now).toISOString();
  if (!configured) return { source, status: "unconfigured", fetchedAt: previous?.fetchedAt || null, lastAttemptAt, data: previous?.data || null, error: "天气尚未配置 GitHub Secret" };
  try {
    return { source, status: "ok", fetchedAt: lastAttemptAt, lastAttemptAt, data: await loader() };
  } catch (error) {
    // Never put response bodies, headers or secret values in public JSON/logs.
    return { source, status: "error", fetchedAt: previous?.fetchedAt || null, lastAttemptAt, data: previous?.data || null, error: "数据源更新失败，保留上次成功数据" };
  }
}

export async function main() {
  const dir = resolve("data");
  await mkdir(dir, { recursive: true });
  async function read(name) {
    try { return JSON.parse(await readFile(resolve(dir, name), "utf8")); }
    catch (error) { if (error.code === "ENOENT") return null; throw error; }
  }
  const now = Date.now();
  const oldHot = await read("hot-search.json");
  const hot = await refreshSnapshot(oldHot, async () => normalizeHotItems(await requestJson(HOT_SEARCH_URL, { "User-Agent": "Mozilla/5.0 BananaNavigation/1.0" })), "百度热搜", now);
  await writeFile(resolve(dir, "hot-search.json"), JSON.stringify(hot, null, 2) + "\n");
  const oldWeather = await read("weather.json");
  if (shouldRefreshWeather(oldWeather, now, Boolean(process.env.QWEATHER_API_KEY))) {
    const weather = await refreshSnapshot(oldWeather, () => fetchWeather(), "和风天气", now, Boolean(process.env.QWEATHER_API_KEY));
    await writeFile(resolve(dir, "weather.json"), JSON.stringify(weather, null, 2) + "\n");
    console.log(`Weather: ${weather.status}`);
  }
  console.log(`Hot search: ${hot.status}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(() => { console.error("更新程序失败，请检查数据文件和工作流配置"); process.exitCode = 1; });
}
