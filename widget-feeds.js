const widgetFeedRoot = "https://raw.githubusercontent.com/huoshiyinggong/banana-nav/main/data/";
let widgetRefreshPromise = null;
let widgetLastRefresh = 0;

function widgetFeedStatus(snapshot, maxAgeMs) {
  const timestamp = Date.parse(snapshot?.fetchedAt || "");
  if (!Number.isFinite(timestamp)) return snapshot?.status === "unconfigured" ? "待配置和风密钥" : snapshot?.status === "error" ? "更新失败" : "等待首次更新";
  const label = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(timestamp));
  return `${label} 更新${Date.now() - timestamp > maxAgeMs || snapshot.status !== "ok" ? " · 已过期" : ""}`;
}

async function readWidgetFeed(name) {
  const key = `banana-widget-${name}-v1`;
  try {
    // Action commits do not rebuild Pages; read public snapshots from the branch.
    const response = await fetch(`${widgetFeedRoot}${name}.json?t=${Math.floor(Date.now() / 60000)}`, { cache: "no-store", credentials: "omit", signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const snapshot = await response.json();
    if (!snapshot || typeof snapshot.status !== "string") throw new Error("Invalid feed");
    localStorage.setItem(key, JSON.stringify(snapshot));
    return snapshot;
  } catch (error) {
    const cached = localStorage.getItem(key);
    if (cached) {
      try { return { ...JSON.parse(cached), status: "error" }; }
      catch (parseError) { localStorage.removeItem(key); }
    }
    return { status: "error", data: null, fetchedAt: null };
  }
}

function refreshWidgetFeeds() {
  if (widgetRefreshPromise) return widgetRefreshPromise;
  widgetLastRefresh = Date.now();
  widgetRefreshPromise = Promise.all([readWidgetFeed("weather"), readWidgetFeed("hot-search")]).then(([weather, hot]) => {
    const weatherStatus = document.querySelector("#weather-feed-status");
    const hotStatus = document.querySelector("#hot-feed-status");
    if (weather.data?.current && Array.isArray(weather.data.daily) && weather.fetchedAt) {
      renderWeatherWidget(weather.data);
      weatherToggle.disabled = false;
      document.querySelector("#weather-detail-updated").textContent = `观测 ${formatWeatherTime(weather.data.current.obsTime || weather.data.updateTime)} · ${widgetFeedStatus(weather, 90 * 60000)}`;
    } else {
      weatherToggle.disabled = true;
      weatherCity.textContent = "龙华";
      weatherTemp.textContent = "—";
      weatherText.textContent = "暂无天气";
      weatherRange.textContent = "等待天气更新";
      weatherDays.innerHTML = "";
    }
    weatherStatus.textContent = widgetFeedStatus(weather, 90 * 60000);
    weatherStatus.title = "来源：和风天气；目标刷新间隔约 30 分钟，可能延迟";
    if (!Array.isArray(hot.data) || !hot.fetchedAt || !applyHotSearchItems(hot.data)) trendList.innerHTML = "<li><span>暂未获取热搜，点击查看百度榜单</span></li>";
    hotStatus.textContent = widgetFeedStatus(hot, 30 * 60000);
    hotStatus.title = "来源：百度热搜；目标刷新间隔约 10 分钟，可能延迟";
  }).finally(() => { widgetRefreshPromise = null; });
  return widgetRefreshPromise;
}

setInterval(() => { if (!document.hidden) refreshWidgetFeeds(); }, 5 * 60000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && Date.now() - widgetLastRefresh > 60000) refreshWidgetFeeds();
});
