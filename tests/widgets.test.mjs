import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeHotItems, normalizeWeather, fetchWeather, shouldRefreshWeather, refreshSnapshot, snapshotFailures } from "../scripts/refresh-widgets.mjs";

const config = { city: "龙华", province: "广东省" };
const current = { code: "200", now: { temp: "0", icon: "104", text: "阴", obsTime: "2026-11-23T12:00+08:00", precip: "0.0" } };
const daily = { code: "200", daily: Array.from({ length: 7 }, (_, i) => ({ fxDate: `2026-11-${23 + i}`, tempMin: "0", tempMax: "10", textDay: "阴", iconDay: "104", sunrise: "06:30", sunset: "18:00" })) };

test("normalizes Baidu list with a ten-item limit", () => {
  const input = { data: { cards: [{ component: "hotList", content: Array.from({ length: 12 }, (_, i) => ({ word: `热搜${i}`, hotScore: 100 + i, url: "https://www.baidu.com/" })) }] } };
  const items = normalizeHotItems(input);
  assert.equal(items.length, 10);
  assert.equal(items[0].metric, "100");
});

test("empty or unrelated hot response is rejected", () => {
  assert.throws(() => normalizeHotItems({ data: { cards: [] } }), /空列表/);
});

test("current Baidu homepage headlines are selected instead of themed boards", () => {
  const items = normalizeHotItems({ data: { cards: [
    { component: "topBoard", content: [{ word: "娱乐榜" }] },
    { component: "homeHeadline", content: [{ query: "综合新闻", hotScore: "123", rawUrl: "https://www.baidu.com/s?wd=test" }] },
  ] } });
  assert.equal(items[0].title, "综合新闻");
  assert.equal(items[0].metric, "123");
  assert.match(items[0].url, /^https:/);
  assert.throws(() => normalizeHotItems({ data: { cards: [{ component: "topBoard", content: [{ word: "娱乐榜" }] }] } }), /空列表/);
});

test("snapshot failure detection catches stale fallback even when fetching did not throw", () => {
  assert.deepEqual(snapshotFailures({ weather: { status: "ok" }, hot: { status: "error" } }), ["hot"]);
  assert.deepEqual(snapshotFailures({ weather: { status: "unconfigured" }, hot: { status: "ok" } }), ["weather"]);
  assert.deepEqual(snapshotFailures({ weather: { status: "ok" }, hot: { status: "ok" } }), []);
});

test("weather retains zero temperature and six future days", () => {
  const result = normalizeWeather(current, daily, null, config);
  assert.equal(result.current.temp, "0");
  assert.equal(result.daily.length, 7);
  assert.equal(result.forecast.length, 6);
  assert.equal(result.forecast[0].label, "明天");
  assert.deepEqual(result.hourly, []);
});

test("invalid required weather response is rejected", () => {
  assert.throws(() => normalizeWeather({code: "401"}, daily, null, config), /不可用/);
});

test("missing API key does not make a network request", async () => {
  await assert.rejects(fetchWeather({}, () => { throw new Error("should not fetch"); }), /未配置/);
});

test("key is only in request header, never output or URL", async () => {
  const urls = [];
  const result = await fetchWeather({ QWEATHER_API_KEY: "secret-test-value" }, async (url, options) => {
    urls.push(url);
    assert.equal(options.headers["X-QW-Api-Key"], "secret-test-value");
    return { ok: true, json: async () => url.includes("/now?") ? current : url.includes("/7d?") ? daily : { code: "200", hourly: [] } };
  });
  assert.equal(urls.length, 3);
  assert.ok(!JSON.stringify(result).includes("secret-test-value"));
  assert.ok(urls.every(url => !url.includes("secret-test-value")));
});

test("weather refresh is throttled for thirty minutes", () => {
  const now = Date.now();
  assert.equal(shouldRefreshWeather({status:"ok", lastAttemptAt: new Date(now - 29 * 60000).toISOString()}, now, true), false);
  assert.equal(shouldRefreshWeather({status:"ok", lastAttemptAt: new Date(now - 30 * 60000).toISOString()}, now, true), true);
  assert.equal(shouldRefreshWeather({status:"unconfigured", lastAttemptAt: new Date(now).toISOString()}, now, true), true);
});

test("failure keeps last successful data and timestamp, strips raw errors", async () => {
  const previous = { fetchedAt: "2026-11-23T00:00:00Z", data: ["cached"] };
  const result = await refreshSnapshot(previous, () => { throw new Error("secret-test-value"); }, "source", Date.now());
  assert.equal(result.status, "error");
  assert.equal(result.fetchedAt, previous.fetchedAt);
  assert.deepEqual(result.data, previous.data);
  assert.ok(!JSON.stringify(result).includes("secret-test-value"));
});

test("unconfigured weather never pretends to be fresh", async () => {
  const result = await refreshSnapshot(null, () => { throw new Error("unexpected"); }, "和风天气", Date.now(), false);
  assert.equal(result.status, "unconfigured");
  assert.equal(result.fetchedAt, null);
});
