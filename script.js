const searchEngines = {
  baidu: {
    name: "百度",
    action: "https://www.baidu.com/s",
    queryKey: "wd",
    icon: "https://www.google.com/s2/favicons?domain=baidu.com&sz=128",
  },
  google: {
    name: "Google",
    action: "https://www.google.com/search",
    queryKey: "q",
    icon: "https://www.google.com/s2/favicons?domain=google.com&sz=128",
  },
};
const hotSearchItems = [
  "广西南宁防汛救灾发布会",
  "受贿超22亿元 杨春林被判死刑",
  "世界杯“最贵”的一场较量来了",
  "多部门部署开展防汛工作",
  "国产清洁机器人卖爆了",
];
const hotSearchTargetUrl =
  "https://top.baidu.com/board?platform=pc&tab=homepage&sa=sa=t_hotbrand";
const fallbackIcon = "assets/fallback-icon.svg";
const faviconSize = 256;
const cloudBaseSdkUrl = "https://static.cloudbase.net/cloudbase-js-sdk/latest/cloudbase.full.js";
const iconResolverFunctionName = "banana-icon";
const iconResolverCacheKey = "banana-nav-icon-resolver-cache-v4";
const minimumRasterIconSize = 64;
const maximumCachedResolvedIcons = 300;
const faviconImBaseUrl = "https://a.favicon.im";
const homeSectionTitle = "主页";
const iconOverrides = {
  "ai.qihuiai.com": "https://ai.qihuiai.com/home/favicon.ico",
  "antv.vision": "https://gw.alipayobjects.com/zos/antfincdn/FLrTNDvlna/antv.png",
  "larkcommunity.feishu.cn": "https://www.feishu.cn/favicon.ico",
  "meiye.art": "https://meiye.art/icon.png?9928a7ca2c030423",
  "preview.pro.ant.design": "https://preview.pro.ant.design/favicon.ico",
  "products.ls.graphics": "https://products.ls.graphics/zwosh/images/favicon.png",
  "www.gying.si": "https://favicon.yandex.net/favicon/www.gying.si",
  "www.meiye.art": "https://meiye.art/icon.png?9928a7ca2c030423",
  "www.xn--wcv59z.com": "https://www.xn--wcv59z.com/favicon.png",
  "www.xiaohongshu.com":
    "https://picasso-static.xiaohongshu.com/fe-platform/f43dc4a8baf03678996c62d8db6ebc01a82256ff.png",
  "www.zhisheji.com": "https://favicon.yandex.net/favicon/www.zhisheji.com",
  "xclient.info": "https://img.xclient.info/icon/favicon.ico",
  "zhisheji.com": "https://favicon.yandex.net/favicon/zhisheji.com",
};
const sectionsStorageKey = "banana-nav-sections-v1";
const sectionsVersionKey = "banana-nav-sections-version-v1";
const sectionsDataVersion = "20260709-banana-home-category-v1";
const adminStorageKey = "banana-nav-admin-mode-v1";
const themeStorageKey = "banana-nav-theme-v1";
const wallpaperStorageKey = "banana-nav-wallpaper-v1";
const defaultWallpaper = "assets/default-wallpaper.jpeg";
const cloudConfig = {
  envId: "daohang-d8gwjtleca5373256",
  collection: "banana_nav_data",
  docId: "main",
};
const memoCollection = "banana_memos";
const weatherApiUrl = "https://daohang-d8gwjtleca5373256.service.tcloudbase.com/banana-weather";
const qweatherIconBaseUrl = "https://cdn.jsdelivr.net/npm/qweather-icons@1.8.0/icons";
const weatherFallbackIcon = "assets/weather-dense-cloud.svg";
const qweatherFillIconMap = {
  150: "100",
  151: "101",
  152: "102",
  153: "103",
  154: "104",
  350: "300",
  351: "301",
  456: "406",
  457: "407",
};
const calendarHolidayCollection = "banana_calendar_holidays";

let sections = [
  {
    title: "AI工具",
    sites: [
      {
        name: "文心一言",
        url: "https://yiyan.baidu.com",
        description: "yiyan.baidu.com",
      },
    ],
  },
];

let currentEngine = "baidu";
let draggedCard = null;
let didDragCard = false;
let cloudDb = null;
let cloudAuth = null;
let cloudApp = null;
let cloudReady = false;
let saveTimer = null;
let isAdminMode = false;
let contextTarget = null;
let pendingDelete = null;
let pendingRename = null;
let pendingIconEdit = null;
let iconDraft = "";
let pendingBookmarkSite = null;
let activeCategoryIndex = 0;
let categoryIndexTicking = false;
let pageSwitchLocked = false;
let pageSwitchUnlockAt = 0;
let wheelGestureConsumed = false;
let wheelGestureTimer = null;
let touchStartY = null;
let calculatorExpression = "0";
let calculatorJustEvaluated = false;
let memos = [];
let editingMemoId = null;
let editingMemoIsNew = false;
let editingMemoCreatedAt = 0;
let editingMemoUpdatedAt = 0;
let memoSearchTerm = "";
let memoSaveTimer = null;
let memoSavePromise = Promise.resolve(true);
let memoDirty = false;
let memoSearchVersion = 0;
let latestWeatherData = null;
let wallpaperDraft = "";
let resolvedIconCache = loadResolvedIconCache();
const siteIconLoadTimers = new WeakMap();
const calendarHolidayCache = new Map();
const calendarView = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  selectedKey: "",
};
const pageSwitchCooldown = 320;
const wheelGestureResetDelay = 180;
const customIconSize = 128;

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const homeCardRow = document.querySelector("#home-card-row");
const homeSection = document.querySelector("#section-home");
const engineToggle = document.querySelector("#engine-toggle");
const engineIcon = document.querySelector("#engine-icon");
const engineMenu = document.querySelector("#engine-menu");
const clock = document.querySelector("#clock");
const solarDate = document.querySelector("#solar-date");
const weekday = document.querySelector("#weekday");
const lunarDate = document.querySelector("#lunar-date");
const widgetCalendarMonth = document.querySelector("#widget-calendar-month");
const widgetCalendarDay = document.querySelector("#widget-calendar-day");
const widgetCalendarMeta = document.querySelector("#widget-calendar-meta");
const widgetCalendarLunar = document.querySelector("#widget-calendar-lunar");
const calendarToggle = document.querySelector("#calendar-toggle");
const calendarModal = document.querySelector("#calendar-modal");
const calendarClose = document.querySelector("#calendar-close");
const calendarPrev = document.querySelector("#calendar-prev");
const calendarNext = document.querySelector("#calendar-next");
const calendarToday = document.querySelector("#calendar-today");
const calendarTitle = document.querySelector("#calendar-title");
const calendarDays = document.querySelector("#calendar-days");
const calendarDetailDate = document.querySelector("#calendar-detail-date");
const calendarDetailLunar = document.querySelector("#calendar-detail-lunar");
const calendarDetailFestival = document.querySelector("#calendar-detail-festival");
const calendarDetailZodiac = document.querySelector("#calendar-detail-zodiac");
const calendarDetailConstellation = document.querySelector("#calendar-detail-constellation");
const calendarDetailHoliday = document.querySelector("#calendar-detail-holiday");
const calendarDetailYi = document.querySelector("#calendar-detail-yi");
const calendarDetailJi = document.querySelector("#calendar-detail-ji");
const calendarDetailPhase = document.querySelector("#calendar-detail-phase");
const calendarDetailPentad = document.querySelector("#calendar-detail-pentad");
const calendarDetailDirections = document.querySelector("#calendar-detail-directions");
const calculatorToggle = document.querySelector("#calculator-toggle");
const calculatorModal = document.querySelector("#calculator-modal");
const calculatorClose = document.querySelector("#calculator-close");
const calculatorResult = document.querySelector("#calculator-result");
const calculatorPad = document.querySelector(".calculator-pad");
const memoToggle = document.querySelector("#memo-toggle");
const memoModal = document.querySelector("#memo-modal");
const memoClose = document.querySelector("#memo-close");
const memoNew = document.querySelector("#memo-new");
const memoStatus = document.querySelector("#memo-status");
const memoSearch = document.querySelector("#memo-search");
const memoList = document.querySelector("#memo-list");
const memoForm = document.querySelector("#memo-form");
const memoInputTitle = document.querySelector("#memo-input-title");
const memoInputContent = document.querySelector("#memo-input-content");
const memoEditorMeta = document.querySelector("#memo-editor-meta");
const memoSaveStatus = document.querySelector("#memo-save-status");
const memoWidgetTitle = document.querySelector("#memo-widget-title");
const memoWidgetTime = document.querySelector("#memo-widget-time");
const memoWidgetContent = document.querySelector("#memo-widget-content");
const weatherToggle = document.querySelector("#weather-toggle");
const weatherModal = document.querySelector("#weather-modal");
const weatherClose = document.querySelector("#weather-close");
const weatherCity = document.querySelector("#weather-city");
const weatherTemp = document.querySelector("#weather-temp");
const weatherText = document.querySelector("#weather-text");
const weatherCurrentIcon = document.querySelector(".weather-current-icon");
const weatherRange = document.querySelector("#weather-range");
const weatherDays = document.querySelector("#weather-days");
const weatherDetailLocation = document.querySelector("#weather-detail-location");
const weatherDetailText = document.querySelector("#weather-detail-text");
const weatherDetailUpdated = document.querySelector("#weather-detail-updated");
const weatherDetailTemp = document.querySelector("#weather-detail-temp");
const weatherDetailIcon = document.querySelector("#weather-detail-icon");
const weatherDetailAdvice = document.querySelector("#weather-detail-advice");
const weatherDetailFeels = document.querySelector("#weather-detail-feels");
const weatherDetailWind = document.querySelector("#weather-detail-wind");
const weatherDetailHumidity = document.querySelector("#weather-detail-humidity");
const weatherDetailPressure = document.querySelector("#weather-detail-pressure");
const weatherDetailPrecip = document.querySelector("#weather-detail-precip");
const weatherDetailSun = document.querySelector("#weather-detail-sun");
const weatherDetailHourly = document.querySelector("#weather-detail-hourly");
const weatherDetailDaily = document.querySelector("#weather-detail-daily");
const trendList = document.querySelector(".trend-list");
const hotTrendsCard = document.querySelector("#hot-trends-card");
const categorySections = document.querySelector("#category-sections");
const categoryIndex = document.querySelector("#category-index");
const backToTop = document.querySelector("#back-to-top");
const syncStatus = document.querySelector("#sync-status");
const adminToggle = document.querySelector("#admin-toggle");
const adminBadge = document.querySelector("#admin-badge");
const settingsMenu = document.querySelector("#settings-menu");
const openSettings = document.querySelector("#open-settings");
const themeToggle = document.querySelector("#theme-toggle");
const quickAddToggle = document.querySelector("#quick-add-toggle");
const themeChoices = document.querySelectorAll("[data-theme-choice]");
const logoutButton = document.querySelector("#logout-button");
const contextMenu = document.querySelector("#context-menu");
const contextMove = document.querySelector("#context-move");
const contextMoveMenu = document.querySelector("#context-move-menu");
const contextIcon = document.querySelector("#context-icon");
const contextRename = document.querySelector("#context-rename");
const contextDelete = document.querySelector("#context-delete");
const adminModal = document.querySelector("#admin-modal");
const adminForm = document.querySelector("#admin-form");
const adminClose = document.querySelector("#admin-close");
const adminUsername = document.querySelector("#admin-username");
const adminPassword = document.querySelector("#admin-password");
const adminMessage = document.querySelector("#admin-message");
const settingsModal = document.querySelector("#settings-modal");
const settingsClose = document.querySelector("#settings-close");
const settingsTitle = document.querySelector("#settings-title");
const settingsTabs = document.querySelector(".settings-tabs");
const quickAddModal = document.querySelector("#quick-add-modal");
const quickAddClose = document.querySelector("#quick-add-close");
const siteForm = document.querySelector("#site-form");
const categoryForm = document.querySelector("#category-form");
const wallpaperForm = document.querySelector("#wallpaper-form");
const siteNameInput = document.querySelector("#site-name-input");
const siteUrlInput = document.querySelector("#site-url-input");
const siteCategoryInput = document.querySelector("#site-category-input");
const siteDescriptionInput = document.querySelector("#site-description-input");
const quickAddLink = document.querySelector("#quick-add-link");
const quickAddCopy = document.querySelector("#quick-add-copy");
const quickAddMessage = document.querySelector("#quick-add-message");
const categoryNameInput = document.querySelector("#category-name-input");
const wallpaperPreview = document.querySelector("#wallpaper-preview");
const wallpaperUrlInput = document.querySelector("#wallpaper-url-input");
const wallpaperFileInput = document.querySelector("#wallpaper-file-input");
const wallpaperFileName = document.querySelector("#wallpaper-file-name");
const wallpaperReset = document.querySelector("#wallpaper-reset");
const siteMessage = document.querySelector("#site-message");
const categoryMessage = document.querySelector("#category-message");
const wallpaperMessage = document.querySelector("#wallpaper-message");
const deleteModal = document.querySelector("#delete-modal");
const deleteClose = document.querySelector("#delete-close");
const deleteCancel = document.querySelector("#delete-cancel");
const deleteConfirm = document.querySelector("#delete-confirm");
const deleteMessage = document.querySelector("#delete-message");
const renameModal = document.querySelector("#rename-modal");
const renameForm = document.querySelector("#rename-form");
const renameClose = document.querySelector("#rename-close");
const renameCancel = document.querySelector("#rename-cancel");
const renameConfirm = document.querySelector("#rename-confirm");
const renameInput = document.querySelector("#rename-input");
const renameMessage = document.querySelector("#rename-message");
const iconModal = document.querySelector("#icon-modal");
const iconForm = document.querySelector("#icon-form");
const iconClose = document.querySelector("#icon-close");
const iconCancel = document.querySelector("#icon-cancel");
const iconConfirm = document.querySelector("#icon-confirm");
const iconFetch = document.querySelector("#icon-fetch");
const iconFileInput = document.querySelector("#icon-file-input");
const iconPreview = document.querySelector("#icon-preview");
const iconNameInput = document.querySelector("#icon-name-input");
const iconUrlInput = document.querySelector("#icon-url-input");
const iconMessage = document.querySelector("#icon-message");

function openSearch(query) {
  const keyword = query.trim();
  if (!keyword) {
    searchInput.focus();
    return;
  }

  const engine = searchEngines[currentEngine];
  const target = `${engine.action}?${engine.queryKey}=${encodeURIComponent(keyword)}`;
  window.open(target, "_blank", "noopener,noreferrer");
}

function getFavicon(url) {
  return getFaviconCandidates(url)[0] || fallbackIcon;
}

function isFallbackIcon(src) {
  const value = String(src || "").trim();
  if (!value) return false;
  return (
    value === fallbackIcon ||
    value.endsWith(`/${fallbackIcon}`) ||
    value.endsWith(fallbackIcon)
  );
}

function getPersistedSiteIcon(site) {
  const icon = String(site?.icon || "").trim();
  return icon && !isFallbackIcon(icon) ? icon : "";
}

function getFaviconCandidates(url, options = {}) {
  try {
    const { hostname, origin } = new URL(url);
    const compactHostname = hostname.replace(/^www\./, "");
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return [`${origin}/favicon.ico`, fallbackIcon];
    }
    const directCandidates = [
      `${origin}/images/android-chrome-512x512.png`,
      `${origin}/android-chrome-512x512.png`,
      `${origin}/images/android-chrome-192x192.png`,
      `${origin}/android-chrome-192x192.png`,
      `${origin}/apple-touch-icon.png`,
      `${origin}/apple-touch-icon-precomposed.png`,
      `${origin}/favicon.svg`,
      `${origin}/favicon.png`,
      `${origin}/favicon.ico`,
    ];
    const serviceCandidates = [
      `${faviconImBaseUrl}/${hostname}?larger=true`,
      `${faviconImBaseUrl}/${compactHostname}?larger=true`,
      `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(origin)}&sz=${faviconSize}`,
      `https://www.google.com/s2/favicons?domain=${hostname}&sz=${faviconSize}`,
      `https://favicon.yandex.net/favicon/${hostname}`,
    ];
    const fallbackCandidates = options.includeServices === false
      ? directCandidates
      : options.preferServices === false
        ? [...directCandidates, ...serviceCandidates]
        : [...serviceCandidates, ...directCandidates];
    return uniqueIconCandidates([
      iconOverrides[hostname],
      iconOverrides[compactHostname],
      ...fallbackCandidates,
      fallbackIcon,
    ]);
  } catch (_) {
    return [fallbackIcon];
  }
}

function getSiteIcon(site) {
  return getSiteIconCandidates(site)[0] || fallbackIcon;
}

function getSiteIconCandidates(site) {
  const persistedIcon = getPersistedSiteIcon(site);
  const cacheKey = getResolvedIconCacheKey(site?.url || "");
  const cachedIcon = cacheKey ? resolvedIconCache[cacheKey] : null;
  const resolvedIcon = cachedIcon && (!persistedIcon || (cachedIcon.savedIcon ?? cachedIcon.sourceUrl) === persistedIcon)
    ? cachedIcon.dataUrl : "";
  if (persistedIcon) {
    return persistedIcon.startsWith("data:")
      ? uniqueIconCandidates([persistedIcon, fallbackIcon])
      : uniqueIconCandidates([window.siteIconAssets.archived(persistedIcon), resolvedIcon,
        window.siteIconAssets.remote(persistedIcon), persistedIcon, ...getFaviconCandidates(site?.url || "")]);
  }
  return uniqueIconCandidates([
    resolvedIcon,
    ...getFaviconCandidates(site?.url || ""),
  ]);
}

function uniqueIconCandidates(candidates) {
  return candidates.filter((candidate, index, array) => {
    return candidate && array.indexOf(candidate) === index;
  });
}

function loadResolvedIconCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(iconResolverCacheKey) || "{}");
    return cached && typeof cached === "object" ? cached : {};
  } catch (_) {
    return {};
  }
}

function saveResolvedIconCache() {
  const entries = Object.entries(resolvedIconCache)
    .sort(([, first], [, second]) => Number(second?.updatedAt || 0) - Number(first?.updatedAt || 0))
    .slice(0, maximumCachedResolvedIcons);
  resolvedIconCache = Object.fromEntries(entries);
  try {
    localStorage.setItem(iconResolverCacheKey, JSON.stringify(resolvedIconCache));
  } catch (_) {
    const reducedEntries = entries.slice(0, Math.max(4, Math.floor(entries.length / 2)));
    resolvedIconCache = Object.fromEntries(reducedEntries);
    try {
      localStorage.setItem(iconResolverCacheKey, JSON.stringify(resolvedIconCache));
    } catch (_) {
      // The icon still works for this page even when browser storage is full.
    }
  }
}

function getResolvedIconCacheKey(url) {
  try {
    return new URL(url).origin;
  } catch (_) {
    return "";
  }
}

function createMonogramIcon(name, url) {
  const label = String(name || "")
    .trim()
    .replace(/^www\./i, "")
    .charAt(0)
    .toUpperCase() || "?";
  const cacheKey = getResolvedIconCacheKey(url) || label;
  const hue = Array.from(cacheKey).reduce((total, character) => total + character.charCodeAt(0), 0) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="30" fill="hsl(${hue} 62% 48%)"/><text x="64" y="68" fill="white" font-family="Arial,sans-serif" font-size="52" font-weight="600" text-anchor="middle" dominant-baseline="middle">${escapeHtml(label)}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function updateIconBackplate(image) {
  const iconBox = image.closest(".icon-box");
  iconBox?.classList.remove("needs-backplate");
}

function rememberLoadedSiteIcon(image) {
  const src = image.currentSrc || image.src || "";
  window.siteIconAssets.remember(src);
  if (
    !src ||
    src.startsWith("blob:") ||
    isFallbackIcon(src) ||
    image.dataset.preserveIcon === "true" ||
    image.id === "icon-preview"
  ) {
    return;
  }

  const siteUrl = image.dataset.siteUrl || "";
  const cacheKey = getResolvedIconCacheKey(siteUrl);
  if (cacheKey) {
    resolvedIconCache[cacheKey] = {
      dataUrl: src,
      sourceUrl: src,
      savedIcon: getPersistedSiteIcon(sections[Number(image.dataset.sectionIndex)]?.sites[Number(image.dataset.siteIndex)]),
      width: image.naturalWidth || 0,
      height: image.naturalHeight || 0,
      updatedAt: Date.now(),
    };
    saveResolvedIconCache();
  }

  // Loading a favicon only updates this browser cache, not the GitHub repository.
}

async function resolveWebsiteIcon(url, name, options = {}) {
  const cacheKey = getResolvedIconCacheKey(url);
  const cached = cacheKey ? resolvedIconCache[cacheKey] : null;
  if (!options.refresh && cached?.dataUrl) {
    cached.updatedAt = Date.now();
    return cached;
  }
  if (!cloudApp || !cloudReady) {
    throw new Error("云端图标服务尚未连接");
  }

  const response = await cloudApp.callFunction({
    name: iconResolverFunctionName,
    data: { url },
  });
  const result = response?.result || response;
  if (result?.code !== 0 || !result?.data?.dataUrl) {
    throw new Error(result?.message || "未找到高清网站图标");
  }
  const resolved = {
    dataUrl: result.data.dataUrl,
    sourceUrl: result.data.sourceUrl || "",
    width: result.data.width || 0,
    height: result.data.height || 0,
    needsBackplate: result.data.needsBackplate ?? result.data.hasTransparency !== false,
    updatedAt: Date.now(),
  };
  if (cacheKey) {
    resolvedIconCache[cacheKey] = resolved;
    saveResolvedIconCache();
  }
  return resolved;
}

async function resolveSiteIconForImage(image) {
  if (image.dataset.iconResolverAttempted === "true") return;
  image.dataset.iconResolverAttempted = "true";
  const url = image.dataset.siteUrl || "";
  const name = image.dataset.siteName || "";

  try {
    const resolved = await resolveWebsiteIcon(url, name);
    image.dataset.iconResolved = "true";
    image.dataset.iconNeedsResolution = "false";
    image.src = resolved.dataUrl;
    rememberLoadedSiteIcon(image);
  } catch (_) {
    image.dataset.iconNeedsResolution = cloudReady ? "false" : "true";
    image.src = createMonogramIcon(name, url);
  }
}

function upgradePendingSiteIcons() {
  document.querySelectorAll('img[data-icon-needs-resolution="true"]').forEach((image) => {
    image.dataset.iconResolverAttempted = "false";
    resolveSiteIconForImage(image);
  });
}

function validateSiteIcon(image) {
  updateIconBackplate(image);
  clearTimeout(siteIconLoadTimers.get(image));
  siteIconLoadTimers.delete(image);
  if (
    image.dataset.iconResolved === "true" ||
    image.dataset.preserveIcon === "true" ||
    image.src.startsWith("data:") ||
    /\.svg(?:$|[?#])/i.test(image.currentSrc || image.src)
  ) {
    return;
  }
  if (
    Math.min(image.naturalWidth || 0, image.naturalHeight || 0) < minimumRasterIconSize
  ) {
    loadNextIconCandidate(image);
    return;
  }
  rememberLoadedSiteIcon(image);
}

function scheduleSiteIconTimeout(image) {
  clearTimeout(siteIconLoadTimers.get(image));
  if (
    image.dataset.iconResolved === "true" ||
    image.dataset.preserveIcon === "true" ||
    image.src.startsWith("data:")
  ) {
    return;
  }
  const timer = setTimeout(() => {
    if (!image.complete || !image.naturalWidth || !image.naturalHeight) {
      loadNextIconCandidate(image);
    }
  }, 2500);
  siteIconLoadTimers.set(image, timer);
}

function scheduleRenderedSiteIcons() {
  document
    .querySelectorAll(".page-section.is-active .site-card .icon-box img")
    .forEach(scheduleSiteIconTimeout);
}

async function hydrateSiteIcon(image) {
  const iconSrc = image.dataset.iconSrc || "";
  if (!iconSrc || image.getAttribute("src") || image.dataset.hydrating) return;
  image.dataset.hydrating = "true";
  const cached = await window.siteIconAssets.cached(iconSrc);
  if (!image.isConnected) {
    if (cached) URL.revokeObjectURL(cached);
    return;
  }
  image.src = cached || iconSrc;
  if (cached) image.addEventListener("load", () => URL.revokeObjectURL(cached), { once: true });
  scheduleSiteIconTimeout(image);
}

function hydrateVisibleSiteIcons() {
  document
    .querySelectorAll(".page-section.is-active .site-card .icon-box img[data-icon-src]")
    .forEach(hydrateSiteIcon);
}

function loadNextIconCandidate(image) {
  clearTimeout(siteIconLoadTimers.get(image));
  siteIconLoadTimers.delete(image);
  let candidates = [];
  try {
    candidates = JSON.parse(image.dataset.iconCandidates || "[]");
  } catch (_) {
    candidates = [];
  }
  const [nextIcon, ...remainingIcons] = candidates;
  if (!nextIcon || nextIcon === fallbackIcon) {
    image.onerror = null;
    if (image.id === "icon-preview") {
      iconDraft = fallbackIcon;
      image.src = fallbackIcon;
      return;
    }
    if (image.dataset.preserveIcon === "true") {
      image.src = fallbackIcon;
      return;
    }
    resolveSiteIconForImage(image);
    return;
  }
  image.dataset.iconCandidates = JSON.stringify(remainingIcons);
  image.src = nextIcon;
  scheduleSiteIconTimeout(image);
  if (image.id === "icon-preview") {
    iconDraft = nextIcon;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function bindBackdropClose(modal, closeModal) {
  let pointerStartedOnBackdrop = false;

  modal.addEventListener("pointerdown", (event) => {
    pointerStartedOnBackdrop = event.target === modal;
  });

  modal.addEventListener("pointerup", (event) => {
    const shouldClose = pointerStartedOnBackdrop && event.target === modal;
    pointerStartedOnBackdrop = false;
    if (shouldClose) closeModal();
  });

  modal.addEventListener("pointercancel", () => {
    pointerStartedOnBackdrop = false;
  });
}

function ensureHomeSection() {
  if (!Array.isArray(sections)) {
    sections = [];
  }
  const homeIndex = sections.findIndex((section) => section.title === homeSectionTitle);
  if (homeIndex === 0) return false;
  if (homeIndex > 0) {
    const [homeSectionData] = sections.splice(homeIndex, 1);
    sections.unshift(homeSectionData);
    return true;
  }

  const commonSection = sections.find((section) => section.title === "常用");
  const sourceSites = commonSection?.sites || sections[0]?.sites || [];
  sections.unshift({
    title: homeSectionTitle,
    sites: sourceSites.map((site) => ({ ...site })),
  });
  return true;
}

function removeFallbackSiteIcons() {
  let changed = false;
  sections.forEach((section) => {
    (section.sites || []).forEach((site) => {
      if (isFallbackIcon(site?.icon)) {
        delete site.icon;
        changed = true;
      }
    });
  });
  return changed;
}

async function loadSections() {
  const savedSections = loadSavedSections();
  if (savedSections) {
    sections = savedSections;
  } else {
    try {
      const response = await fetch("sites.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      sections = await response.json();
    } catch (error) {
      console.warn("使用备用导航数据：", error);
    }
  }
  const changed = ensureHomeSection();
  const iconsChanged = removeFallbackSiteIcons();
  if (changed || iconsChanged) {
    localStorage.setItem(sectionsStorageKey, JSON.stringify(sections));
    localStorage.setItem(sectionsVersionKey, sectionsDataVersion);
  }
}

async function initializeCloudBase() {
  if (!window.cloudbase) {
    setSyncStatus("CloudBase SDK 未加载，本地模式", "warn");
    return;
  }

  try {
    setSyncStatus("连接云端...", "pending");
    const app = window.cloudbase.init({
      env: cloudConfig.envId,
    });
    cloudApp = app;
    cloudAuth = app.auth({ persistence: "local" });
    const signedIn = await ensureCloudSession(cloudAuth);
    if (!signedIn) {
      cloudReady = false;
      setSyncStatus("请开启 CloudBase 匿名登录", "warn");
      return;
    }
    cloudDb = app.database();
    cloudReady = true;
    upgradePendingSiteIcons();
    await refreshAdminMode();
    setSyncStatus("云端已连接", "ok");
  } catch (error) {
    cloudReady = false;
    console.warn("CloudBase 初始化失败：", error);
    setSyncStatus("云端连接失败，本地模式", "warn");
  }
}

function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function loadCloudBaseSdk() {
  if (window.cloudbase) return true;
  try {
    await loadExternalScript(cloudBaseSdkUrl);
    return Boolean(window.cloudbase);
  } catch (error) {
    console.warn("CloudBase SDK 加载失败：", error);
    setSyncStatus("云端 SDK 加载失败，本地模式", "warn");
    return false;
  }
}

function getHotSearchTitle(item) {
  if (typeof item === "string") return item.trim();
  return String(item?.title || item?.name || item?.keyword || "").trim();
}

function getHotSearchMetric(item) {
  if (!item || typeof item === "string") return "";
  return String(item.hot || item.heat || item.value || item.metric || item.desc || "").trim();
}

function getHotSearchItems(items) {
  return Array.isArray(items)
    ? items
        .map((item) => ({
          title: getHotSearchTitle(item),
          metric: getHotSearchMetric(item),
        }))
        .filter((item) => item.title)
    : [];
}

function applyTrendCardItems(items) {
  if (!trendList) return false;

  const nextItems = getHotSearchItems(items).slice(0, 5);
  if (!nextItems.length) return false;

  trendList.innerHTML = nextItems
    .map(
      (item) =>
        `<li><span>${escapeHtml(item.title)}</span><em>${escapeHtml(item.metric)}</em></li>`
    )
    .join("");
  return true;
}

function applyHotSearchItems(items) {
  if (!getHotSearchItems(items).length) return false;
  applyTrendCardItems(items);
  return true;
}

function getWeatherIconUrl(iconCode) {
  const normalizedCode = String(iconCode || "").trim();
  if (!/^\d{3}$/.test(normalizedCode)) return weatherFallbackIcon;
  const fillCode = qweatherFillIconMap[normalizedCode] || normalizedCode;
  return `${qweatherIconBaseUrl}/${fillCode}-fill.svg`;
}

function applyWeatherIcon(image, iconCode) {
  if (!image) return;
  image.src = getWeatherIconUrl(iconCode);
  image.onerror = () => {
    image.onerror = null;
    image.src = weatherFallbackIcon;
  };
}

function formatWeatherTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatWeatherHour(value, fallback = "") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "numeric",
    hour12: false,
  }).format(date);
}

function getWeatherAdvice(weather) {
  const text = `${weather?.current?.text || ""} ${weather?.forecast?.[0]?.text || ""}`;
  const humidity = Number(weather?.current?.humidity);
  if (/雨|雷|雪|雹/.test(text)) return "外出记得带伞，路面湿滑时尽量放慢通勤节奏。";
  if (/晴|热|晒/.test(text)) return "紫外线可能偏强，出门可以补充防晒和饮水。";
  if (humidity >= 80) return "空气湿度偏高，体感会更闷，室内可以适当除湿通风。";
  if (/阴|云/.test(text)) return "云量较多，适合日常出行，留意午后天气变化。";
  return "天气数据已更新，可以根据实时温度安排今天的出行。";
}

function getWeatherDailyItems(weather) {
  const daily = Array.isArray(weather?.daily) ? weather.daily : [];
  if (daily.length) return daily.slice(0, 7);
  const forecast = Array.isArray(weather?.forecast) ? weather.forecast : [];
  const today = {
    label: "今天",
    date: "",
    text: weather?.current?.text || "",
    icon: weather?.current?.icon || "",
    tempMin: weather?.range?.min || "",
    tempMax: weather?.range?.max || "",
  };
  return [today, ...forecast].slice(0, 7);
}

function renderWeatherDetail(weather) {
  if (!weather || !weatherModal) return;
  const current = weather.current || {};
  const today = getWeatherDailyItems(weather)[0] || {};
  const city = weather.city || "龙华";
  const locationText = weather.locationName || (weather.province ? `${weather.province} · ${city}` : `广东省 · ${city}`);
  const updatedText = formatWeatherTime(current.obsTime || weather.updateTime);
  const windText = [current.windDir, current.windScale ? `${current.windScale}级` : ""]
    .filter(Boolean)
    .join(" ");

  if (weatherDetailLocation) weatherDetailLocation.textContent = locationText;
  if (weatherDetailText) weatherDetailText.textContent = current.text || "--";
  if (weatherDetailUpdated) weatherDetailUpdated.textContent = updatedText ? `发布于 ${updatedText}` : "实时天气";
  if (weatherDetailTemp) weatherDetailTemp.textContent = current.temp ? `${current.temp}°` : "--°";
  if (weatherDetailAdvice) weatherDetailAdvice.textContent = getWeatherAdvice(weather);
  if (weatherDetailFeels) weatherDetailFeels.textContent = current.feelsLike ? `${current.feelsLike}°` : "--";
  if (weatherDetailWind) weatherDetailWind.textContent = windText || "--";
  if (weatherDetailHumidity) weatherDetailHumidity.textContent = current.humidity ? `${current.humidity}%` : "--";
  if (weatherDetailPressure) weatherDetailPressure.textContent = current.pressure ? `${current.pressure}hPa` : "--";
  if (weatherDetailPrecip) weatherDetailPrecip.textContent = current.precip ? `${current.precip}mm` : "--";
  if (weatherDetailSun) {
    const sunrise = today.sunrise || "--";
    const sunset = today.sunset || "--";
    weatherDetailSun.textContent = `${sunrise} / ${sunset}`;
  }
  applyWeatherIcon(weatherDetailIcon, current.icon);

  const hourly = Array.isArray(weather.hourly) ? weather.hourly.slice(0, 24) : [];
  if (weatherDetailHourly) {
    weatherDetailHourly.classList.toggle("is-empty", !hourly.length);
    weatherDetailHourly.innerHTML = hourly.length
      ? hourly
          .map((item) => {
            const iconUrl = escapeHtml(getWeatherIconUrl(item.icon));
            const hour = escapeHtml(formatWeatherHour(item.fxTime, item.label || ""));
            const temp = escapeHtml(item.temp || "--");
            const text = escapeHtml(item.text || "");
            return `<div class="weather-hour-item">
              <time>${hour}</time>
              <img src="${iconUrl}" alt="" onerror="this.onerror=null;this.src='${weatherFallbackIcon}'" />
              <strong>${temp}°</strong>
              <span>${text}</span>
            </div>`;
          })
          .join("")
      : `<p class="weather-detail-empty">暂未获取小时预报。</p>`;
  }

  const daily = getWeatherDailyItems(weather);
  if (weatherDetailDaily) {
    weatherDetailDaily.innerHTML = daily.length
      ? daily
          .map((item, index) => {
            const iconUrl = escapeHtml(getWeatherIconUrl(item.icon || item.iconDay));
            const label = escapeHtml(index === 0 ? "今天" : item.label || "");
            const date = escapeHtml(item.date ? item.date.slice(5) : "");
            const text = escapeHtml(item.text || item.textDay || "");
            const min = escapeHtml(item.tempMin || "");
            const max = escapeHtml(item.tempMax || "");
            return `<div class="weather-day-detail${index === 0 ? " is-today" : ""}">
              <time>${label}${date ? `<span>${date}</span>` : ""}</time>
              <img src="${iconUrl}" alt="" onerror="this.onerror=null;this.src='${weatherFallbackIcon}'" />
              <strong>${min}~${max}°</strong>
              <span>${text}</span>
            </div>`;
          })
          .join("")
      : `<p class="weather-detail-empty">暂无未来天气数据。</p>`;
  }
}

function renderWeatherWidget(weather) {
  if (!weather || !weatherTemp || !weatherText || !weatherRange || !weatherDays) return;
  latestWeatherData = weather;

  if (weatherCity && weather.city) {
    weatherCity.textContent = weather.city;
  }
  if (weather.current?.temp) {
    weatherTemp.textContent = `${weather.current.temp}°`;
  }
  if (weather.current?.text) {
    weatherText.textContent = weather.current.text;
  }
  applyWeatherIcon(weatherCurrentIcon, weather.current?.icon);
  if (weather.range?.min && weather.range?.max) {
    weatherRange.textContent = `最低 ${weather.range.min}° 最高 ${weather.range.max}°`;
  }

  const forecast = Array.isArray(weather.forecast) ? weather.forecast.slice(0, 6) : [];
  renderWeatherDetail(weather);
  if (!forecast.length) return;

  weatherDays.innerHTML = forecast
    .map((day) => {
      const label = escapeHtml(day.label || "");
      const min = escapeHtml(day.tempMin || "");
      const max = escapeHtml(day.tempMax || "");
      const iconUrl = escapeHtml(getWeatherIconUrl(day.icon));
      return `<span>${label}<img class="weather-day-icon" src="${iconUrl}" alt="" onerror="this.onerror=null;this.src='${weatherFallbackIcon}'" /><em>${min}~${max}</em></span>`;
    })
    .join("");
}

async function loadWeatherWidget() {
  await refreshWidgetFeeds();
  return latestWeatherData;
}

async function openWeatherModal() {
  if (!weatherModal || !weatherToggle || !weatherClose) return;
  weatherModal.hidden = false;
  weatherToggle.setAttribute("aria-expanded", "true");
  if (latestWeatherData) renderWeatherDetail(latestWeatherData);
  await loadWeatherWidget();
  weatherClose.focus();
}

function closeWeatherModal(options = {}) {
  if (!weatherModal || !weatherToggle) return;
  weatherModal.hidden = true;
  weatherToggle.setAttribute("aria-expanded", "false");
  if (!options.skipFocus) weatherToggle.focus();
}

async function ensureCloudSession(auth) {
  try {
    if (await hasCloudSession(auth)) return true;
    if (auth.anonymousAuthProvider) {
      await auth.anonymousAuthProvider().signIn();
    } else if (auth.signInAnonymously) {
      await auth.signInAnonymously();
    }
    return hasCloudSession(auth);
  } catch (error) {
    console.warn("CloudBase 匿名登录失败：", error);
  }
  return false;
}

async function hasCloudSession(auth) {
  const session = await getCloudSession(auth);
  return Boolean(session);
}

async function getCloudSession(auth = cloudAuth) {
  if (!auth || !auth.getSession) return null;
  try {
    const result = await auth.getSession();
    return result?.data?.session || null;
  } catch (_) {
    return null;
  }
}

async function refreshAdminMode() {
  const session = await getCloudSession();
  const isSignedUser = Boolean(session && !session.user?.is_anonymous);
  setAdminMode(isSignedUser);
}

async function loadCloudSections() {
  if (!cloudReady || !cloudDb) return false;

  try {
    const response = await cloudDb
      .collection(cloudConfig.collection)
      .doc(cloudConfig.docId)
      .get();
    const data = Array.isArray(response.data) ? response.data[0] : response.data;
    if (data && Array.isArray(data.sections)) {
      sections = data.sections;
      const changed = ensureHomeSection();
      const iconsChanged = removeFallbackSiteIcons();
      applyHotSearchItems(data.hotSearch);
      localStorage.setItem(sectionsStorageKey, JSON.stringify(sections));
      localStorage.setItem(sectionsVersionKey, sectionsDataVersion);
      setSyncStatus("已加载云端数据", "ok");
      if (changed || iconsChanged) {
        scheduleCloudSave();
      }
      return true;
    }
    await createCloudDocument();
    return true;
  } catch (error) {
    const message = String(error?.message || error);
    if (message.includes("does not exist") || message.includes("not exist")) {
      await createCloudDocument();
      return true;
    }
    console.warn("读取 CloudBase 数据失败：", error);
    setSyncStatus("读取云端失败，本地模式", "warn");
    return false;
  }
}

async function createCloudDocument() {
  if (!cloudReady || !cloudDb) return;
  try {
    await cloudDb.collection(cloudConfig.collection).add({
      _id: cloudConfig.docId,
      sections,
      updatedAt: Date.now(),
    });
    setSyncStatus("已初始化云端数据", "ok");
  } catch (error) {
    console.warn("初始化 CloudBase 数据失败：", error);
    setSyncStatus("初始化云端失败", "warn");
  }
}

function loadSavedSections() {
  try {
    if (localStorage.getItem(sectionsVersionKey) !== sectionsDataVersion) {
      localStorage.removeItem(sectionsStorageKey);
      localStorage.setItem(sectionsVersionKey, sectionsDataVersion);
      return null;
    }
    const saved = JSON.parse(localStorage.getItem(sectionsStorageKey));
    if (
      Array.isArray(saved) &&
      saved.every((section) => section.title && Array.isArray(section.sites))
    ) {
      return saved;
    }
  } catch (_) {
    localStorage.removeItem(sectionsStorageKey);
    localStorage.removeItem(sectionsVersionKey);
  }
  return null;
}

function saveSections() {
  localStorage.setItem(sectionsStorageKey, JSON.stringify(sections));
  localStorage.setItem(sectionsVersionKey, sectionsDataVersion);
  scheduleCloudSave();
}

async function saveSectionsImmediately() {
  localStorage.setItem(sectionsStorageKey, JSON.stringify(sections));
  localStorage.setItem(sectionsVersionKey, sectionsDataVersion);
  clearTimeout(saveTimer);
  setSyncStatus("正在保存...", "pending");
  await saveSectionsToCloud(true);
}

function scheduleCloudSave() {
  if (!isAdminMode) {
    setSyncStatus("仅浏览模式", "idle");
    return;
  }
  clearTimeout(saveTimer);
  setSyncStatus("正在保存...", "pending");
  saveTimer = setTimeout(saveSectionsToCloud, 350);
}

async function saveSectionsToCloud(throwOnError = false) {
  saveTimer = null;
  try {
    await window.githubNavigation.save(sections);
    setSyncStatus("GitHub 已同步", "ok");
  } catch (error) {
    console.warn("GitHub 保存失败：", error.message);
    setSyncStatus(`${error.message}；本地副本已保留`, "warn");
    if (throwOnError) {
      throw error;
    }
  }
}

function setSyncStatus(message, state = "idle") {
  if (!syncStatus) return;
  syncStatus.textContent = message;
  syncStatus.dataset.state = state;
}

function syncSiteCardAdminState() {
  document.querySelectorAll(".site-card").forEach((card) => {
    const hasPosition = card.dataset.sectionIndex !== undefined;
    card.draggable = isAdminMode && hasPosition;
    card.setAttribute("draggable", String(isAdminMode && hasPosition));
    if (!hasPosition) return;
    const { sectionIndex, siteIndex } = getCardPosition(card);
    const site = sections[sectionIndex]?.sites[siteIndex];
    card.setAttribute("title", isAdminMode ? "拖拽排序，右键菜单" : site?.name || "");
  });
}

function setAdminMode(enabled) {
  isAdminMode = enabled;
  document.body.classList.toggle("is-admin-mode", enabled);
  adminToggle.classList.toggle("is-admin", enabled);
  adminToggle.setAttribute("aria-label", enabled ? "设置" : "GitHub 编辑配置");
  adminToggle.setAttribute("title", enabled ? "设置" : "GitHub 编辑配置");
  adminBadge.hidden = !enabled;
  if (!enabled) {
    closeSettingsMenu();
  }
  syncSiteCardAdminState();
  localStorage.setItem(adminStorageKey, enabled ? "true" : "false");
}

function toggleSettingsMenu(forceOpen) {
  const isOpen =
    typeof forceOpen === "boolean" ? forceOpen : settingsMenu.hidden;
  settingsMenu.hidden = !isOpen;
}

function closeSettingsMenu() {
  settingsMenu.hidden = true;
}

function getSavedTheme() {
  try {
    const savedTheme = localStorage.getItem(themeStorageKey);
    return savedTheme === "dark" ? "dark" : "light";
  } catch (_) {
    return "light";
  }
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = nextTheme;
  themeChoices.forEach((button) => {
    const isActive = button.dataset.themeChoice === nextTheme;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  if (!themeToggle) return;
  themeToggle.setAttribute("aria-pressed", String(nextTheme === "dark"));
  themeToggle.setAttribute(
    "title",
    "主题切换",
  );
}

function saveTheme(nextTheme) {
  applyTheme(nextTheme);
  try {
    localStorage.setItem(themeStorageKey, nextTheme);
  } catch (_) {
    // Ignore storage failures so the theme switch still works for this page.
  }
}

function toggleTheme() {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  saveTheme(nextTheme);
  closeSettingsMenu();
}

function getSavedWallpaper() {
  try {
    const rawSaved = localStorage.getItem(wallpaperStorageKey);
    if (!rawSaved) return defaultWallpaper;
    const saved = JSON.parse(rawSaved);
    if (typeof saved?.src === "string" && saved.src) return saved.src;
    return typeof saved === "string" && saved ? saved : defaultWallpaper;
  } catch (_) {
    const rawSaved = localStorage.getItem(wallpaperStorageKey);
    return typeof rawSaved === "string" && /^(https?:|data:)/.test(rawSaved)
      ? rawSaved
      : defaultWallpaper;
  }
}

function getCssImageUrl(src) {
  return src ? `url("${src.replace(/"/g, "%22")}")` : "none";
}

function setWallpaperPreview(src) {
  if (!wallpaperPreview) return;
  wallpaperPreview.classList.toggle("has-image", Boolean(src));
  wallpaperPreview.style.setProperty("--wallpaper-preview-image", getCssImageUrl(src));
  const label = wallpaperPreview.querySelector("span");
  if (label) {
    label.textContent = src === defaultWallpaper ? "默认壁纸预览" : "当前壁纸预览";
  }
}

function applyWallpaper(src, options = {}) {
  const wallpaperSrc = typeof src === "string" ? src.trim() : "";
  const isDefaultWallpaper = wallpaperSrc === defaultWallpaper;
  document.body.classList.toggle("has-wallpaper", Boolean(wallpaperSrc));
  document.body.style.setProperty("--wallpaper-image", getCssImageUrl(wallpaperSrc));
  wallpaperDraft = wallpaperSrc;
  if (wallpaperUrlInput && !wallpaperSrc.startsWith("data:") && !isDefaultWallpaper) {
    wallpaperUrlInput.value = wallpaperSrc;
  }
  if (wallpaperUrlInput && (!wallpaperSrc || isDefaultWallpaper)) {
    wallpaperUrlInput.value = "";
  }
  setWallpaperPreview(wallpaperSrc);
  if (options.persist) {
    try {
      if (wallpaperSrc && !isDefaultWallpaper) {
        localStorage.setItem(wallpaperStorageKey, JSON.stringify({ src: wallpaperSrc, updatedAt: Date.now() }));
      } else {
        localStorage.removeItem(wallpaperStorageKey);
      }
    } catch (error) {
      console.warn("保存壁纸失败：", error);
      throw new Error("壁纸图片过大，保存失败");
    }
  }
}

function validateWallpaperImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      resolve();
      return;
    }
    const image = new Image();
    const timer = window.setTimeout(() => {
      image.onload = null;
      image.onerror = null;
      reject(new Error("图片加载超时，请换一个图片直链或上传本地图片"));
    }, 8000);
    image.onload = () => {
      window.clearTimeout(timer);
      resolve();
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("这不是可直接加载的图片链接，请使用图片直链或上传本地图片"));
    };
    image.src = src;
  });
}

async function compressWallpaperFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("请选择图片文件");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("图片不能超过 8MB");
  }
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const maxSide = 1920;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

function openContextMenu(event, target) {
  closeSettingsMenu();
  contextTarget = target;
  contextMove.hidden = target.type !== "site";
  contextIcon.hidden = target.type !== "site";
  contextRename.hidden = target.type !== "section";
  closeMoveMenu();
  contextMenu.hidden = false;
  const menuRect = contextMenu.getBoundingClientRect();
  const left = Math.min(event.clientX, window.innerWidth - menuRect.width - 8);
  const top = Math.min(event.clientY, window.innerHeight - menuRect.height - 8);
  contextMenu.style.left = `${Math.max(8, left)}px`;
  contextMenu.style.top = `${Math.max(8, top)}px`;
}

function closeContextMenu() {
  contextMenu.hidden = true;
  closeMoveMenu();
  contextTarget = null;
}

function closeMoveMenu() {
  contextMoveMenu.hidden = true;
  contextMoveMenu.innerHTML = "";
  contextMove.classList.remove("is-active");
  contextMove.setAttribute("aria-expanded", "false");
}

function openMoveMenu() {
  if (!contextTarget || contextTarget.type !== "site") return;
  const sourceIndex = contextTarget.sectionIndex;
  const targetSections = sections
    .map((section, index) => ({ section, index }))
    .filter(({ index }) => index !== sourceIndex);
  contextMoveMenu.innerHTML = targetSections.length
    ? targetSections
        .map(
          ({ section, index }) => `
            <button
              class="context-submenu-item"
              type="button"
              data-target-section-index="${index}"
              title="${escapeHtml(section.title)}"
            >${escapeHtml(section.title)}</button>
          `,
        )
        .join("")
    : `<button class="context-submenu-item" type="button" disabled>无可移动分类</button>`;
  contextMoveMenu.hidden = false;
  contextMove.classList.add("is-active");
  contextMove.setAttribute("aria-expanded", "true");

  const menuRect = contextMenu.getBoundingClientRect();
  const moveRect = contextMove.getBoundingClientRect();
  const submenuRect = contextMoveMenu.getBoundingClientRect();
  const canOpenRight = menuRect.right + 6 + submenuRect.width <= window.innerWidth - 8;
  const left = canOpenRight
    ? menuRect.right + 6
    : Math.max(8, menuRect.left - submenuRect.width - 6);
  const top = Math.min(
    moveRect.top,
    window.innerHeight - submenuRect.height - 8,
  );
  contextMoveMenu.style.left = `${Math.max(8, left)}px`;
  contextMoveMenu.style.top = `${Math.max(8, top)}px`;
}

function openSettingsModal(tab = "site") {
  closeSettingsMenu();
  closeContextMenu();
  clearSettingsMessages();
  renderCategoryOptions();
  applyWallpaper(wallpaperDraft);
  setSettingsTab(tab);
  settingsModal.hidden = false;
  const firstInput =
    tab === "site" ? siteNameInput : tab === "category" ? categoryNameInput : wallpaperUrlInput;
  firstInput?.focus();
}

function closeSettingsModal() {
  settingsModal.hidden = true;
  applyWallpaper(getSavedWallpaper());
}

function openQuickAddModal() {
  closeSettingsMenu();
  closeContextMenu();
  clearSettingsMessages();
  updateQuickAddLink();
  quickAddModal.hidden = false;
}

function closeQuickAddModal() {
  quickAddModal.hidden = true;
}

function getDeleteTargetLabel(target) {
  if (!target) return "";
  if (target.type === "site") {
    return sections[target.sectionIndex]?.sites[target.siteIndex]?.name || "";
  }
  if (target.type === "section") {
    return sections[target.sectionIndex]?.title || "";
  }
  return "";
}

function openDeleteModal(target) {
  const label = getDeleteTargetLabel(target);
  if (!label) return;
  pendingDelete = target;
  closeContextMenu();
  if (target.type === "section") {
    const count = sections[target.sectionIndex]?.sites.length || 0;
    deleteMessage.textContent = `确定删除分类「${label}」？该分类下的 ${count} 个网站也会一起删除。`;
  } else {
    deleteMessage.textContent = `确定删除网站「${label}」？`;
  }
  deleteConfirm.disabled = false;
  deleteConfirm.textContent = "确认删除";
  deleteModal.hidden = false;
  deleteCancel.focus();
}

function closeDeleteModal() {
  deleteModal.hidden = true;
  pendingDelete = null;
  deleteConfirm.disabled = false;
  deleteConfirm.textContent = "确认删除";
}

function openRenameModal(target) {
  if (!target || target.type !== "section") return;
  const title = sections[target.sectionIndex]?.title;
  if (!title) return;
  pendingRename = target;
  closeContextMenu();
  renameInput.value = title;
  renameMessage.textContent = "";
  renameConfirm.disabled = false;
  renameConfirm.textContent = "保存";
  renameModal.hidden = false;
  renameInput.focus();
  renameInput.select();
}

function closeRenameModal() {
  renameModal.hidden = true;
  pendingRename = null;
  renameMessage.textContent = "";
  renameConfirm.disabled = false;
  renameConfirm.textContent = "保存";
}

function getSiteByTarget(target) {
  if (!target || target.type !== "site") return null;
  return sections[target.sectionIndex]?.sites[target.siteIndex] || null;
}

function setIconDraft(src) {
  iconDraft = src;
  iconPreview.src = src || fallbackIcon;
  iconPreview.dataset.iconCandidates = "[]";
}

function setIconDraftCandidates(candidates, options = {}) {
  const minimumSize = options.minimumSize ?? 1;
  const pendingCandidates = uniqueIconCandidates(candidates).filter(
    (candidate) => candidate && candidate !== fallbackIcon,
  );
  iconDraft = fallbackIcon;
  iconPreview.src = fallbackIcon;
  iconPreview.dataset.iconCandidates = "[]";

  return new Promise((resolve) => {
    const tryNextCandidate = () => {
      const candidate = pendingCandidates.shift();
      if (!candidate) {
        resolve("");
        return;
      }
      const probe = new Image();
      const timer = setTimeout(() => {
        probe.onload = null;
        probe.onerror = null;
        tryNextCandidate();
      }, 3000);
      probe.onload = () => {
        clearTimeout(timer);
        const isSvg = /\.svg(?:$|[?#])/i.test(candidate);
        if (
          !isSvg &&
          Math.min(probe.naturalWidth || 0, probe.naturalHeight || 0) < minimumSize
        ) {
          tryNextCandidate();
          return;
        }
        setIconDraft(candidate);
        resolve({
          src: candidate,
          width: probe.naturalWidth || 0,
          height: probe.naturalHeight || 0,
        });
      };
      probe.onerror = () => {
        clearTimeout(timer);
        tryNextCandidate();
      };
      probe.src = candidate;
    };
    tryNextCandidate();
  });
}

function openIconModal(target) {
  const site = getSiteByTarget(target);
  if (!site) return;
  pendingIconEdit = { ...target };
  closeContextMenu();
  iconNameInput.value = site.name || "";
  iconUrlInput.value = site.url || "";
  iconMessage.textContent = "";
  iconConfirm.disabled = false;
  iconConfirm.textContent = "保存";
  setIconDraft(getSiteIcon(site));
  iconModal.hidden = false;
  iconNameInput.focus();
  iconNameInput.select();
}

function closeIconModal() {
  iconModal.hidden = true;
  pendingIconEdit = null;
  iconDraft = "";
  iconFileInput.value = "";
  iconMessage.textContent = "";
  iconConfirm.disabled = false;
  iconConfirm.textContent = "保存";
}

async function useWebsiteIcon() {
  const parsedUrl = getValidatedSiteUrl(iconUrlInput.value);
  if (!iconUrlInput.value.trim()) {
    iconMessage.textContent = "请先填写网站网址";
    return;
  }
  if (!parsedUrl) {
    iconMessage.textContent = "网站网址格式不正确";
    return;
  }
  iconFetch.disabled = true;
  iconMessage.textContent = "正在检查官网高清图标...";
  try {
    const browserIcon = await setIconDraftCandidates(
      getFaviconCandidates(parsedUrl.href, { includeServices: false }),
      { minimumSize: minimumRasterIconSize },
    );
    if (browserIcon) {
      const sourceSize =
        browserIcon.width && browserIcon.height
          ? `（源图 ${browserIcon.width}×${browserIcon.height}）`
          : "";
      iconMessage.textContent = `已加载官网高清图标${sourceSize}，保存后生效`;
      return;
    }

    iconMessage.textContent = "正在通过云端解析官网图标...";
    const resolved = await Promise.race([
      resolveWebsiteIcon(parsedUrl.href, iconNameInput.value, { refresh: true }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("云端图标解析超时")), 6000);
      }),
    ]);
    setIconDraft(resolved.dataUrl);
    const sourceSize =
      resolved.width && resolved.height ? `（源图 ${resolved.width}×${resolved.height}）` : "";
    iconMessage.textContent = `已获取并优化高清图标${sourceSize}，保存后生效`;
  } catch (error) {
    iconMessage.textContent = `${error.message}，正在尝试浏览器候选图标...`;
    const fallbackCandidate = await setIconDraftCandidates(
      getFaviconCandidates(parsedUrl.href),
    );
    iconMessage.textContent = fallbackCandidate
      ? "已加载浏览器候选图标，保存后生效"
      : `${error.message}，未找到可用图标`;
  } finally {
    iconFetch.disabled = false;
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("读取文件失败")));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("图片无法读取")));
    image.src = src;
  });
}

async function resizeIconFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("请选择图片文件");
  }
  if (file.size > 4 * 1024 * 1024) {
    throw new Error("图片不能超过 4MB");
  }
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = customIconSize;
  canvas.height = customIconSize;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, customIconSize, customIconSize);
  const scale = Math.min(
    customIconSize / image.naturalWidth,
    customIconSize / image.naturalHeight,
  );
  const targetWidth = image.naturalWidth * scale;
  const targetHeight = image.naturalHeight * scale;
  const targetX = (customIconSize - targetWidth) / 2;
  const targetY = (customIconSize - targetHeight) / 2;
  context.drawImage(
    image,
    targetX,
    targetY,
    targetWidth,
    targetHeight,
  );
  const webpDataUrl = canvas.toDataURL("image/webp", 0.9);
  return webpDataUrl.startsWith("data:image/webp")
    ? webpDataUrl
    : canvas.toDataURL("image/png");
}

async function confirmIconEdit() {
  if (!pendingIconEdit || !isAdminMode) return;
  const site = getSiteByTarget(pendingIconEdit);
  if (!site) {
    closeIconModal();
    return;
  }
  const name = iconNameInput.value.trim();
  const parsedUrl = getValidatedSiteUrl(iconUrlInput.value);
  if (!name || !iconUrlInput.value.trim()) {
    iconMessage.textContent = "请填写网站名称和网址";
    return;
  }
  if (!parsedUrl) {
    iconMessage.textContent = "网站网址格式不正确";
    return;
  }
  const previousSections = JSON.stringify(sections);
  const previousDescription = site.description || "";
  const previousHostname = (() => {
    try {
      return new URL(site.url).hostname;
    } catch (_) {
      return "";
    }
  })();
  iconConfirm.disabled = true;
  iconConfirm.textContent = "保存中...";
  site.name = name;
  site.url = parsedUrl.href;
  if (!previousDescription || previousDescription === previousHostname) {
    site.description = parsedUrl.hostname;
  }
  site.icon = getPersistedSiteIcon({ icon: iconDraft }) || getFavicon(parsedUrl.href);
  try {
    saveSections();
    renderSections();
    closeIconModal();
  } catch (error) {
    sections = JSON.parse(previousSections);
    localStorage.setItem(sectionsStorageKey, previousSections);
    localStorage.setItem(sectionsVersionKey, sectionsDataVersion);
    console.warn("保存图标失败：", error);
    iconMessage.textContent = "保存失败，请重试";
    iconConfirm.disabled = false;
    iconConfirm.textContent = "保存";
    renderSections();
  }
}

function clearSettingsMessages() {
  siteMessage.textContent = "";
  siteMessage.dataset.state = "";
  quickAddMessage.textContent = "";
  quickAddMessage.dataset.state = "";
  categoryMessage.textContent = "";
  categoryMessage.dataset.state = "";
  wallpaperMessage.textContent = "";
  wallpaperMessage.dataset.state = "";
}

function setSettingsTab(tab) {
  const isThemePanel = tab === "theme";
  if (settingsTitle) {
    settingsTitle.textContent = isThemePanel ? "主题切换" : "添加网站/分类";
  }
  if (settingsTabs) {
    settingsTabs.hidden = isThemePanel;
  }
  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    const isActive = button.dataset.settingsTab === tab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  document.querySelectorAll("[data-settings-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.settingsPanel !== tab;
  });
  clearSettingsMessages();
}

function renderCategoryOptions() {
  siteCategoryInput.innerHTML = sections
    .map(
      (section, index) =>
        `<option value="${index}">${escapeHtml(section.title)}</option>`,
    )
    .join("");
}

function setActiveCategoryIndex(index) {
  if (!categoryIndex) return;
  const pageCount = sections.length;
  activeCategoryIndex = Math.max(0, Math.min(index, pageCount - 1));
  getPageElements().forEach((page, pageIndex) => {
    const isActive = pageIndex === activeCategoryIndex;
    page.classList.toggle("is-active", isActive);
    page.setAttribute("aria-hidden", String(!isActive));
  });
  categoryIndex.querySelectorAll(".category-index-link").forEach((link) => {
    const isActive = Number(link.dataset.pageIndex) === activeCategoryIndex;
    link.classList.toggle("is-active", isActive);
    link.setAttribute("aria-current", isActive ? "true" : "false");
  });
  hydrateVisibleSiteIcons();
  scheduleRenderedSiteIcons();
  updateBackToTopVisibility();
}

function renderCategoryIndex() {
  if (!categoryIndex) return;
  const pageCount = sections.length;
  activeCategoryIndex = Math.min(activeCategoryIndex, pageCount - 1);
  categoryIndex.hidden = false;
  categoryIndex.innerHTML = sections
    .map((section, index) => {
      const href = index === 0 ? "#section-home" : `#section-${index}`;
      return `
        <a
          class="category-index-link${index === activeCategoryIndex ? " is-active" : ""}"
          href="${href}"
          data-page-index="${index}"
          aria-current="${index === activeCategoryIndex ? "true" : "false"}"
          title="${escapeHtml(section.title)}"
        >${escapeHtml(section.title)}</a>
      `;
    })
    .join("");
}

function updateActiveCategoryFromScroll() {
  setActiveCategoryIndex(activeCategoryIndex);
}

function updateBackToTopVisibility() {
  if (!backToTop) return;
  const activePage = getActivePageElement();
  const isVisible = activeCategoryIndex > 0 || (activePage?.scrollTop || 0) > window.innerHeight;
  backToTop.classList.toggle("is-visible", isVisible);
  backToTop.setAttribute("aria-hidden", String(!isVisible));
  backToTop.tabIndex = isVisible ? 0 : -1;
}

function scrollBackToTop() {
  goToPage(0);
}

function getPageElements() {
  return [homeSection, ...document.querySelectorAll(".category-section")].filter(Boolean);
}

function getActivePageElement() {
  return getPageElements()[activeCategoryIndex] || null;
}

function goToPage(index) {
  const pageCount = sections.length;
  const nextIndex = Math.max(0, Math.min(index, pageCount - 1));
  if (nextIndex === activeCategoryIndex) return;
  document.body.dataset.pageDirection = nextIndex > activeCategoryIndex ? "down" : "up";
  setActiveCategoryIndex(nextIndex);
  const activePage = getActivePageElement();
  if (activePage) {
    activePage.scrollTop = 0;
  }
}

function lockPageSwitch() {
  pageSwitchLocked = true;
  pageSwitchUnlockAt = Date.now() + pageSwitchCooldown;
  window.setTimeout(() => {
    if (Date.now() >= pageSwitchUnlockAt) {
      pageSwitchLocked = false;
    }
  }, pageSwitchCooldown);
}

function isPageSwitchLocked() {
  if (!pageSwitchLocked) return false;
  if (Date.now() < pageSwitchUnlockAt) return true;
  pageSwitchLocked = false;
  return false;
}

function keepWheelGestureActive() {
  window.clearTimeout(wheelGestureTimer);
  wheelGestureTimer = window.setTimeout(() => {
    wheelGestureConsumed = false;
  }, wheelGestureResetDelay);
}

function shouldIgnorePageWheel(event) {
  return Boolean(
    event.target.closest(
      ".modal-backdrop, .settings-menu, .context-menu, .context-submenu, .engine-menu",
    ),
  );
}

function handlePageWheel(event) {
  if (shouldIgnorePageWheel(event)) return;
  const delta = event.deltaY;
  if (Math.abs(delta) < 8) return;
  const activePage = getActivePageElement();
  if (!activePage) return;
  const canScroll = activePage.scrollHeight > activePage.clientHeight + 1;
  const atTop = activePage.scrollTop <= 1;
  const atBottom =
    activePage.scrollTop + activePage.clientHeight >= activePage.scrollHeight - 1;
  const direction = delta > 0 ? 1 : -1;

  if (canScroll && ((direction > 0 && !atBottom) || (direction < 0 && !atTop))) {
    if (!activePage.contains(event.target)) {
      event.preventDefault();
      activePage.scrollTop += delta;
    }
    window.requestAnimationFrame(updateBackToTopVisibility);
    return;
  }
  if (isPageSwitchLocked() || wheelGestureConsumed) {
    event.preventDefault();
    keepWheelGestureActive();
    return;
  }
  const nextIndex = activeCategoryIndex + direction;
  if (nextIndex < 0 || nextIndex >= sections.length) return;
  event.preventDefault();
  goToPage(nextIndex);
  wheelGestureConsumed = true;
  keepWheelGestureActive();
  lockPageSwitch();
}

function handlePageTouchStart(event) {
  if (shouldIgnorePageWheel(event)) return;
  touchStartY = event.touches[0]?.clientY ?? null;
}

function handlePageTouchEnd(event) {
  if (touchStartY === null || shouldIgnorePageWheel(event)) return;
  const touchEndY = event.changedTouches[0]?.clientY ?? touchStartY;
  const delta = touchStartY - touchEndY;
  touchStartY = null;
  if (Math.abs(delta) < 48 || isPageSwitchLocked()) return;

  const activePage = getActivePageElement();
  if (!activePage) return;
  const direction = delta > 0 ? 1 : -1;
  const canScroll = activePage.scrollHeight > activePage.clientHeight + 1;
  const atTop = activePage.scrollTop <= 1;
  const atBottom =
    activePage.scrollTop + activePage.clientHeight >= activePage.scrollHeight - 1;
  if (canScroll && ((direction > 0 && !atBottom) || (direction < 0 && !atTop))) {
    return;
  }
  const nextIndex = activeCategoryIndex + direction;
  if (nextIndex < 0 || nextIndex >= sections.length) return;
  goToPage(nextIndex);
  lockPageSwitch();
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function getValidatedSiteUrl(value) {
  const trimmed = value.trim();
  const hasUnsupportedScheme =
    /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) && !/^https?:\/\//i.test(trimmed);
  if (!trimmed || hasUnsupportedScheme) {
    return null;
  }
  try {
    const url = new URL(normalizeUrl(trimmed));
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) return null;
    return url;
  } catch (_) {
    return null;
  }
}

function getNavigationBaseUrl() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  return url.href;
}

function getQuickAddBookmarklet() {
  const target = getNavigationBaseUrl().replace(/'/g, "%27");
  return `javascript:(()=>{const d='${target}';window.open(d+'?add='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title),'_blank','noopener,noreferrer')})()`;
}

function updateQuickAddLink() {
  const bookmarklet = getQuickAddBookmarklet();
  quickAddLink.href = bookmarklet;
  quickAddLink.setAttribute("title", bookmarklet);
}

async function copyQuickAddLink() {
  const bookmarklet = getQuickAddBookmarklet();
  try {
    await navigator.clipboard.writeText(bookmarklet);
    quickAddMessage.textContent = "已复制";
    quickAddMessage.dataset.state = "ok";
  } catch (_) {
    quickAddMessage.textContent = "复制失败，可直接拖动左侧链接";
    quickAddMessage.dataset.state = "warn";
  }
}

function getBookmarkSiteFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const rawUrl = params.get("add");
  if (!rawUrl) return null;

  try {
    const url = new URL(normalizeUrl(rawUrl));
    if (!["http:", "https:"].includes(url.protocol)) return null;
    const title = (params.get("title") || "").trim();
    const fallbackName = url.hostname.replace(/^www\./, "");
    return {
      name: title || fallbackName,
      url: url.href,
      description: url.hostname,
    };
  } catch (_) {
    return null;
  }
}

function clearBookmarkParams() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("add") && !url.searchParams.has("title")) return;
  url.searchParams.delete("add");
  url.searchParams.delete("title");
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}

function prefillBookmarkSite(site) {
  openSettingsModal("site");
  siteNameInput.value = site.name;
  siteUrlInput.value = site.url;
  siteDescriptionInput.value = site.description;
  siteMessage.textContent = "已带入当前网页，选择分类后确认添加";
  siteMessage.dataset.state = "ok";
  siteCategoryInput.focus();
}

function handlePendingBookmarkSite() {
  if (!pendingBookmarkSite) return;
  if (!isAdminMode) {
    openAdminModal();
    adminMessage.textContent = "请先配置本机编辑 Token 后添加网站";
    return;
  }
  prefillBookmarkSite(pendingBookmarkSite);
  pendingBookmarkSite = null;
}

function openAdminModal() {
  adminMessage.textContent = "";
  adminPassword.value = "";
  adminModal.hidden = false;
  adminUsername.focus();
}

function closeAdminModal() {
  adminModal.hidden = true;
}

async function loginAdmin(username, password) {
  await window.githubNavigation.connect(password);
  setAdminMode(true);
  adminPassword.value = "";
  setSyncStatus("本机编辑已启用", "ok");
  renderSections();
  return true;
}

async function logoutAdmin() {
  if (saveTimer || window.githubNavigation.dirty) {
    try { await saveSectionsImmediately(); }
    catch (error) { window.alert(`${error.message}。请先导出本地导航备份，尚未断开编辑。`); return; }
  }
  window.githubNavigation.disconnect();
  adminPassword.value = "";
  closeSettingsMenu();
  setAdminMode(false);
  renderSections();
  setSyncStatus("已断开编辑并清除本机 Token", "ok");
}

function renderEngineMenu() {
  engineMenu.innerHTML = Object.entries(searchEngines)
    .map(
      ([key, engine]) => `
        <button
          class="engine-option${key === currentEngine ? " is-active" : ""}"
          type="button"
          role="option"
          aria-selected="${key === currentEngine}"
          data-engine="${key}"
        >
          <img src="${engine.icon}" alt="" />
          ${engine.name}
        </button>
      `,
    )
    .join("");
}

function setEngine(engineKey) {
  currentEngine = engineKey;
  engineIcon.src = searchEngines[engineKey].icon;
  engineIcon.alt = searchEngines[engineKey].name;
  engineToggle.setAttribute("title", `${searchEngines[engineKey].name}搜索`);
  renderEngineMenu();
}

function toggleEngineMenu(forceOpen) {
  const isOpen =
    typeof forceOpen === "boolean"
      ? forceOpen
      : !engineMenu.classList.contains("is-open");
  engineMenu.classList.toggle("is-open", isOpen);
  engineToggle.setAttribute("aria-expanded", String(isOpen));
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date - start) / 86400000) + 1;
}

function getWeekOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const offset = start.getDay() || 7;
  return Math.ceil((getDayOfYear(date) + offset - 1) / 7);
}

function getDateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function formatAlmanacList(items, limit = 6) {
  if (!Array.isArray(items) || !items.length) return "暂无";
  return items.filter(Boolean).slice(0, limit).join("、") || "暂无";
}

function getAlmanacFallback() {
  return {
    chineseYear: "",
    zodiac: "暂无",
    constellation: "暂无",
    yi: "暂无",
    ji: "暂无",
    phase: "暂无",
    pentad: "暂无",
    directions: "暂无方位信息",
  };
}

function getLunarInfo(date) {
  if (!window.Solar) {
    return { label: "农历", fullLabel: "农历信息加载中", festivals: [], ...getAlmanacFallback() };
  }
  const solar = window.Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const lunar = solar.getLunar();
  const dayLabel = lunar.getDayInChinese();
  const label = dayLabel === "初一" ? `${lunar.getMonthInChinese()}月` : dayLabel;
  const festivals = [
    ...lunar.getFestivals(),
    ...lunar.getOtherFestivals(),
    lunar.getJieQi(),
  ].filter(Boolean);
  const positions = [
    ["喜神", lunar.getPositionXi?.()],
    ["阳贵神", lunar.getPositionYangGui?.()],
    ["阴贵神", lunar.getPositionYinGui?.()],
    ["福神", lunar.getPositionFu?.()],
    ["财神", lunar.getPositionCai?.()],
  ].filter(([, value]) => value);
  return {
    label,
    fullLabel: `${lunar.getMonthInChinese()}月${dayLabel}`,
    festivals: [...new Set(festivals)],
    chineseYear: `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${dayLabel}`,
    zodiac: lunar.getYearShengXiao?.() || "暂无",
    constellation: `${solar.getXingZuo?.() || "暂无"}座`,
    yi: formatAlmanacList(lunar.getDayYi?.(1)),
    ji: formatAlmanacList(lunar.getDayJi?.(1)),
    phase: lunar.getYueXiang?.() || "暂无",
    pentad: lunar.getHou?.() || lunar.getWuHou?.() || "暂无",
    directions: positions.map(([labelText, value]) => `${labelText}方位：${value}`).join(" · ") || "暂无方位信息",
  };
}

async function loadCalendarHolidays(year) {
  if (calendarHolidayCache.has(year) || !cloudReady || !cloudDb) {
    return calendarHolidayCache.get(year) || {};
  }
  try {
    const response = await cloudDb.collection(calendarHolidayCollection).doc(String(year)).get();
    const data = Array.isArray(response.data) ? response.data[0] : response.data;
    const days = data && typeof data.days === "object" ? data.days : {};
    calendarHolidayCache.set(year, days);
    return days;
  } catch (error) {
    console.warn(`日历节假日数据加载失败（${year}）：`, error);
    calendarHolidayCache.set(year, {});
    return {};
  }
}

function getCalendarDayData(date) {
  const dateKey = getDateKey(date);
  const holidayData = calendarHolidayCache.get(date.getFullYear()) || {};
  const schedule = holidayData[dateKey] || null;
  const lunar = getLunarInfo(date);
  const festivals = [...new Set([schedule?.name, ...lunar.festivals].filter(Boolean))];
  return { dateKey, schedule, lunar, festivals };
}

function renderCalendarDetail(date) {
  const { schedule, lunar, festivals } = getCalendarDayData(date);
  calendarDetailDate.textContent = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
  calendarDetailLunar.textContent = `农历${lunar.fullLabel}`;
  calendarDetailFestival.textContent = festivals.join(" · ");
  calendarDetailZodiac.textContent = lunar.zodiac;
  calendarDetailConstellation.textContent = lunar.constellation;
  calendarDetailHoliday.textContent = festivals.join(" · ") || "暂无节日";
  calendarDetailYi.textContent = lunar.yi;
  calendarDetailJi.textContent = lunar.ji;
  calendarDetailPhase.textContent = lunar.phase;
  calendarDetailPentad.textContent = lunar.pentad;
  calendarDetailDirections.textContent = lunar.directions;
}

function renderCalendar() {
  if (!calendarDays) return;
  const firstDate = new Date(calendarView.year, calendarView.month, 1);
  const gridStart = new Date(calendarView.year, calendarView.month, 1 - ((firstDate.getDay() + 6) % 7));
  const todayKey = getDateKey(new Date());
  if (!calendarView.selectedKey) calendarView.selectedKey = todayKey;
  calendarTitle.textContent = `${calendarView.year}年${calendarView.month + 1}月`;
  calendarDays.innerHTML = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
    const { dateKey, schedule, lunar, festivals } = getCalendarDayData(date);
    const isCurrentMonth = date.getMonth() === calendarView.month;
    const dayOfWeek = date.getDay();
    const classes = [
      "calendar-day",
      !isCurrentMonth && "is-outside",
      (dayOfWeek === 0 || dayOfWeek === 6) && "is-weekend",
      dateKey === todayKey && "is-today",
      dateKey === calendarView.selectedKey && "is-selected",
      schedule?.type === "holiday" && "is-holiday",
      schedule?.type === "workday" && "is-workday",
    ].filter(Boolean).join(" ");
    const marker = schedule?.type === "holiday" ? "休" : schedule?.type === "workday" ? "班" : "";
    const markerClass = schedule?.type === "workday" ? " is-workday" : "";
    const description = [
      new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric" }).format(date),
      `农历${lunar.fullLabel}`,
      ...festivals,
      schedule?.type === "workday" ? "调休上班" : "",
    ].filter(Boolean).join("，");
    return `<button class="${classes}" type="button" role="gridcell" data-calendar-date="${dateKey}" aria-label="${escapeHtml(description)}" aria-selected="${dateKey === calendarView.selectedKey}">
      <span class="calendar-day-number">${date.getDate()}</span>
      <span class="calendar-day-lunar">${escapeHtml(festivals[0] || lunar.label)}</span>
      ${marker ? `<i class="calendar-day-mark${markerClass}">${marker}</i>` : ""}
    </button>`;
  }).join("");
  const [selectedYear, selectedMonth, selectedDay] = calendarView.selectedKey.split("-").map(Number);
  renderCalendarDetail(new Date(selectedYear, selectedMonth - 1, selectedDay));
}

async function openCalendarModal() {
  const now = new Date();
  calendarView.year = now.getFullYear();
  calendarView.month = now.getMonth();
  calendarView.selectedKey = getDateKey(now);
  calendarModal.hidden = false;
  calendarToggle.setAttribute("aria-expanded", "true");
  await loadCalendarHolidays(calendarView.year);
  renderCalendar();
  calendarClose.focus();
}

function closeCalendarModal() {
  calendarModal.hidden = true;
  calendarToggle.setAttribute("aria-expanded", "false");
  calendarToggle.focus();
}

function renderCalculator() {
  calculatorResult.textContent = calculatorExpression
    .replaceAll("*", "×")
    .replaceAll("/", "÷");
}

function evaluateCalculatorExpression(expression) {
  const tokens = expression.match(/\d+(?:\.\d+)?|[+\-*/]/g);
  if (!tokens || tokens.join("") !== expression || tokens.length % 2 === 0) return null;
  let current = Number(tokens[0]);
  const values = [];
  const operators = [];
  for (let index = 1; index < tokens.length; index += 2) {
    const operator = tokens[index];
    const next = Number(tokens[index + 1]);
    if (operator === "*") current *= next;
    else if (operator === "/") current /= next;
    else {
      values.push(current);
      operators.push(operator);
      current = next;
    }
  }
  values.push(current);
  const result = values.slice(1).reduce(
    (total, value, index) => operators[index] === "+" ? total + value : total - value,
    values[0],
  );
  if (!Number.isFinite(result)) return null;
  return String(Number(result.toPrecision(12)));
}

function appendCalculatorValue(value) {
  if (/\d/.test(value)) {
    if (calculatorExpression === "错误" || calculatorJustEvaluated) calculatorExpression = "0";
    if (calculatorExpression === "0") calculatorExpression = value;
    else calculatorExpression += value;
    calculatorJustEvaluated = false;
  } else if (value === ".") {
    if (calculatorExpression === "错误" || calculatorJustEvaluated) calculatorExpression = "0";
    const currentNumber = calculatorExpression.split(/[+\-*/]/).pop();
    if (!currentNumber) calculatorExpression += "0.";
    else if (!currentNumber.includes(".")) calculatorExpression += ".";
    calculatorJustEvaluated = false;
  } else {
    if (calculatorExpression === "错误") calculatorExpression = "0";
    if (/[+\-*/]$/.test(calculatorExpression)) {
      calculatorExpression = `${calculatorExpression.slice(0, -1)}${value}`;
    } else {
      calculatorExpression += value;
    }
    calculatorJustEvaluated = false;
  }
  renderCalculator();
}

function runCalculatorAction(action) {
  if (action === "clear") {
    calculatorExpression = "0";
    calculatorJustEvaluated = false;
  } else if (action === "backspace") {
    calculatorExpression = calculatorJustEvaluated
      ? "0"
      : calculatorExpression.slice(0, -1) || "0";
    calculatorJustEvaluated = false;
  } else if (action === "percent") {
    const currentNumber = calculatorExpression.match(/\d+(?:\.\d+)?$/);
    if (currentNumber) {
      const percent = Number(currentNumber[0]) / 100;
      calculatorExpression = `${calculatorExpression.slice(0, -currentNumber[0].length)}${Number(percent.toPrecision(12))}`;
      calculatorJustEvaluated = false;
    }
  } else if (action === "equals") {
    const result = evaluateCalculatorExpression(calculatorExpression);
    calculatorExpression = result ?? "错误";
    calculatorJustEvaluated = true;
  }
  renderCalculator();
}

function openCalculatorModal() {
  calculatorModal.hidden = false;
  calculatorToggle.setAttribute("aria-expanded", "true");
  renderCalculator();
  calculatorClose.focus();
}

function closeCalculatorModal() {
  calculatorModal.hidden = true;
  calculatorToggle.setAttribute("aria-expanded", "false");
  calculatorToggle.focus();
}

function formatMemoTime(timestamp) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

function createMemoId() {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `memo_${Date.now().toString(36)}_${randomPart}`;
}

function getMemoDraft() {
  return {
    title: memoInputTitle.value.trim(),
    content: memoInputContent.value.trim(),
  };
}

function hasMemoContent(memo) {
  return Boolean(memo.title || memo.content);
}

function getMemoListItems() {
  if (!editingMemoIsNew || !editingMemoId) return memos;
  const draft = getMemoDraft();
  return [
    {
      _id: editingMemoId,
      title: draft.title || "无标题",
      content: draft.content,
      createdAt: editingMemoCreatedAt,
      updatedAt: editingMemoUpdatedAt,
      isDraft: true,
    },
    ...memos,
  ];
}

function getVisibleMemos() {
  return getMemoListItems().filter((memo) => {
    const source = `${memo.title || ""} ${memo.content || ""}`.toLocaleLowerCase("zh-CN");
    return source.includes(memoSearchTerm);
  });
}

function renderMemoWidget() {
  const latest = memos[0];
  if (!latest) {
    memoWidgetTitle.textContent = "备忘录";
    memoWidgetTime.textContent = "点击新建";
    memoWidgetTime.dateTime = "";
    memoWidgetContent.innerHTML = "<span>还没有备忘录</span><span>点击这里开始记录</span>";
    return;
  }
  memoWidgetTitle.textContent = latest.title;
  memoWidgetTime.textContent = formatMemoTime(latest.updatedAt);
  memoWidgetTime.dateTime = new Date(latest.updatedAt).toISOString();
  memoWidgetContent.innerHTML = "";
  const lines = (latest.content || "").split(/\n+/).filter(Boolean).slice(0, 2);
  (lines.length ? lines : ["暂无内容"]).forEach((line) => {
    const span = document.createElement("span");
    span.textContent = line;
    memoWidgetContent.append(span);
  });
}

function renderMemoList() {
  memoList.replaceChildren();
  memoNew.disabled = !isAdminMode;
  memoStatus.textContent = isAdminMode ? "" : "登录管理模式后可新建、编辑和删除备忘录";
  const visibleMemos = getVisibleMemos();
  if (!visibleMemos.length) {
    const empty = document.createElement("p");
    empty.className = "memo-empty";
    empty.textContent = getMemoListItems().length ? "没有匹配的内容" : "还没有内容";
    memoList.append(empty);
    return;
  }
  visibleMemos.forEach((memo) => {
    const item = document.createElement("article");
    item.className = `memo-item${memo._id === editingMemoId ? " is-selected" : ""}`;
    item.dataset.memoId = memo._id;
    item.tabIndex = 0;
    const head = document.createElement("div");
    head.className = "memo-item-head";
    const title = document.createElement("strong");
    title.textContent = memo.title;
    const time = document.createElement("time");
    time.dateTime = new Date(memo.updatedAt).toISOString();
    time.textContent = formatMemoTime(memo.updatedAt);
    head.append(title, time);
    const content = document.createElement("p");
    content.textContent = memo.content || "暂无内容";
    item.append(head, content);
    if (isAdminMode && !memo.isDraft) {
      const remove = document.createElement("button");
      remove.className = "memo-item-actions";
      remove.type = "button";
      remove.dataset.memoDelete = memo._id;
      remove.setAttribute("aria-label", `删除备忘录：${memo.title}`);
      remove.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>';
      item.append(remove);
    }
    memoList.append(item);
  });
}

async function loadMemos() {
  if (!cloudReady || !cloudDb) return;
  try {
    const response = await cloudDb.collection(memoCollection).orderBy("updatedAt", "desc").limit(50).get();
    memos = Array.isArray(response.data) ? response.data : [];
    renderMemoWidget();
    if (!memoModal.hidden) renderMemoList();
  } catch (error) {
    console.warn("读取备忘录失败：", error);
    if (!memoModal.hidden) memoStatus.textContent = "读取备忘录失败，请重试";
  }
}

function setMemoEditorEnabled(enabled) {
  memoInputTitle.disabled = !enabled;
  memoInputContent.disabled = !enabled;
}

function renderMemoEditorMeta(memo = null) {
  if (!memo) {
    memoEditorMeta.textContent = "";
    return;
  }
  memoEditorMeta.textContent = `最后编辑：${formatMemoTime(memo.updatedAt)} · 创建：${formatMemoTime(memo.createdAt || memo.updatedAt)}`;
}

function setMemoSaveStatus(message = "", state = "") {
  memoSaveStatus.textContent = message;
  if (state) memoSaveStatus.dataset.state = state;
  else delete memoSaveStatus.dataset.state;
}

function openMemoEditor(memo = null, create = false) {
  if (!memo && !create) {
    editingMemoId = null;
    editingMemoIsNew = false;
    editingMemoCreatedAt = 0;
    editingMemoUpdatedAt = 0;
    memoDirty = false;
    memoForm.reset();
    memoForm.hidden = true;
    renderMemoEditorMeta();
    setMemoSaveStatus();
    renderMemoList();
    return;
  }
  memoForm.hidden = false;
  const now = Date.now();
  editingMemoId = create ? createMemoId() : memo?._id || null;
  editingMemoIsNew = create;
  editingMemoCreatedAt = create ? now : memo?.createdAt || memo?.updatedAt || now;
  editingMemoUpdatedAt = create ? now : memo?.updatedAt || now;
  memoDirty = false;
  memoInputTitle.value = create ? "" : memo?.title || "";
  memoInputContent.value = create ? "" : memo?.content || "";
  setMemoSaveStatus();
  if (!isAdminMode) {
    setMemoEditorEnabled(false);
    renderMemoEditorMeta(memo);
    renderMemoList();
    return;
  }
  setMemoEditorEnabled(true);
  renderMemoEditorMeta(memo);
  renderMemoList();
  memoInputTitle.focus();
}

function openMemoModal() {
  memoModal.hidden = false;
  memoToggle.setAttribute("aria-expanded", "true");
  openMemoEditor(memos[0] || null);
  memoClose.focus();
}

async function closeMemoModal() {
  const saved = await flushMemoSave();
  if (!saved) return;
  memoModal.hidden = true;
  memoToggle.setAttribute("aria-expanded", "false");
  editingMemoId = null;
  editingMemoIsNew = false;
  memoDirty = false;
  memoForm.reset();
  memoToggle.focus();
}

function captureMemoSnapshot() {
  const draft = getMemoDraft();
  return {
    id: editingMemoId,
    isNew: editingMemoIsNew,
    title: draft.title || "无标题",
    content: draft.content,
    hasContent: hasMemoContent(draft),
    createdAt: editingMemoCreatedAt || Date.now(),
  };
}

function applySavedMemo(snapshot, updatedAt) {
  const previous = memos.find((memo) => memo._id === snapshot.id);
  const savedMemo = {
    ...previous,
    _id: snapshot.id,
    title: snapshot.title,
    content: snapshot.content,
    createdAt: previous?.createdAt || snapshot.createdAt,
    updatedAt,
  };
  memos = [savedMemo, ...memos.filter((memo) => memo._id !== snapshot.id)].sort(
    (first, second) => second.updatedAt - first.updatedAt,
  );
  if (editingMemoId === snapshot.id) {
    editingMemoIsNew = false;
    editingMemoCreatedAt = savedMemo.createdAt;
    editingMemoUpdatedAt = savedMemo.updatedAt;
    renderMemoEditorMeta(savedMemo);
  }
  renderMemoWidget();
  renderMemoList();
}

async function persistMemoSnapshot(snapshot) {
  if (!isAdminMode || !cloudReady || !cloudDb || !snapshot.id) return false;
  if (snapshot.isNew && !snapshot.hasContent) return true;
  const now = Date.now();
  setMemoSaveStatus("正在保存...");
  try {
    const exists = memos.some((memo) => memo._id === snapshot.id);
    if (exists) {
      const result = await cloudDb.collection(memoCollection).doc(snapshot.id).update({
        title: snapshot.title,
        content: snapshot.content,
        updatedAt: now,
      });
      if (result.code || result.message || result.updated === 0) throw new Error(result.message || "更新失败");
    } else {
      const result = await cloudDb.collection(memoCollection).add({
        _id: snapshot.id,
        title: snapshot.title,
        content: snapshot.content,
        createdAt: snapshot.createdAt,
        updatedAt: now,
      });
      if (result.code || result.message) throw new Error(result.message || "新建失败");
    }
    applySavedMemo(snapshot, now);
    setMemoSaveStatus("已自动保存");
    return true;
  } catch (error) {
    console.warn("保存备忘录失败：", error);
    if (editingMemoId === snapshot.id) memoDirty = true;
    setMemoSaveStatus("保存失败，请重试", "error");
    return false;
  }
}

function queueMemoSave() {
  const snapshot = captureMemoSnapshot();
  memoDirty = false;
  memoSavePromise = memoSavePromise.then(
    () => persistMemoSnapshot(snapshot),
    () => persistMemoSnapshot(snapshot),
  );
  return memoSavePromise;
}

function scheduleMemoSave() {
  if (!isAdminMode || !editingMemoId) return;
  memoDirty = true;
  editingMemoUpdatedAt = Date.now();
  renderMemoList();
  setMemoSaveStatus("正在输入...");
  clearTimeout(memoSaveTimer);
  memoSaveTimer = setTimeout(() => {
    memoSaveTimer = null;
    queueMemoSave();
  }, 600);
}

async function flushMemoSave() {
  clearTimeout(memoSaveTimer);
  memoSaveTimer = null;
  if (memoDirty && editingMemoId) {
    return queueMemoSave();
  }
  return memoSavePromise;
}

async function selectMemo(memo = null, create = false) {
  const saved = await flushMemoSave();
  if (!saved) return;
  openMemoEditor(memo, create);
}

async function startNewMemo() {
  const saved = await flushMemoSave();
  if (!saved) return;
  memoSearch.value = "";
  memoSearchTerm = "";
  memoSearchVersion += 1;
  openMemoEditor(null, true);
}

async function deleteMemo(id) {
  if (!isAdminMode || !cloudReady || !cloudDb || !window.confirm("确定删除这条备忘录吗？")) return;
  if (editingMemoId === id) {
    clearTimeout(memoSaveTimer);
    memoSaveTimer = null;
    memoDirty = false;
    await memoSavePromise;
  } else if (!(await flushMemoSave())) {
    return;
  }
  const deletedIndex = memos.findIndex((memo) => memo._id === id);
  try {
    const result = await cloudDb.collection(memoCollection).doc(id).remove();
    if (result.code || result.message || result.deleted === 0) throw new Error(result.message || "删除失败");
    const remainingMemos = memos.filter((memo) => memo._id !== id);
    const nextMemo = remainingMemos[deletedIndex] || remainingMemos[deletedIndex - 1] || null;
    memos = remainingMemos;
    renderMemoWidget();
    if (editingMemoId === id) openMemoEditor(nextMemo);
    else renderMemoList();
  } catch (error) {
    console.warn("删除备忘录失败：", error);
    memoStatus.textContent = "删除失败，请重试";
  }
}

async function changeCalendarMonth(offset) {
  const next = new Date(calendarView.year, calendarView.month + offset, 1);
  calendarView.year = next.getFullYear();
  calendarView.month = next.getMonth();
  await loadCalendarHolidays(calendarView.year);
  renderCalendar();
}

function updateDateTime() {
  const now = new Date();
  clock.textContent = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  solarDate.textContent = new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
  }).format(now);
  weekday.textContent = new Intl.DateTimeFormat("zh-CN", {
    weekday: "long",
  }).format(now);
  lunarDate.textContent = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
    month: "long",
    day: "numeric",
  }).format(now);
  if (widgetCalendarMonth && widgetCalendarDay && widgetCalendarMeta && widgetCalendarLunar) {
    const lunar = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      month: "long",
      day: "numeric",
    }).format(now);
    const weekName = new Intl.DateTimeFormat("zh-CN", {
      weekday: "short",
    }).format(now);
    widgetCalendarMonth.textContent = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
    }).format(now);
    widgetCalendarDay.textContent = String(now.getDate());
    widgetCalendarMeta.textContent = `第${getDayOfYear(now)}天 第${getWeekOfYear(now)}周`;
    widgetCalendarLunar.textContent = `${lunar} ${weekName}`;
  }
}

function getHomeSites() {
  return sections[0]?.sites || [];
}

function renderSiteCard(site, sectionIndex = -1, siteIndex = -1, options = {}) {
  const isStatic = options.static === true;
  const enterDelay = Math.min(Math.max(siteIndex, 0) * 16, 240);
  const iconCandidates = getSiteIconCandidates(site);
  const [iconSrc, ...iconFallbacks] = iconCandidates;
  const preserveCurrentIcon = getPersistedSiteIcon(site).startsWith("data:");
  return `
    <a
      class="site-card"
      href="${escapeHtml(site.url)}"
      target="_blank"
      rel="noopener noreferrer"
      draggable="${isStatic ? "false" : isAdminMode}"
      style="--site-enter-delay: ${enterDelay}ms"
      ${isStatic ? "" : `data-section-index="${sectionIndex}" data-site-index="${siteIndex}"`}
      title="${isStatic ? escapeHtml(site.name) : isAdminMode ? "拖拽排序，右键菜单" : escapeHtml(site.name)}"
    >
      <span class="icon-box">
        <img alt="" loading="eager" decoding="async" fetchpriority="auto" referrerpolicy="no-referrer" data-icon-src="${escapeHtml(iconSrc || fallbackIcon)}" data-site-url="${escapeHtml(site.url || "")}" data-site-name="${escapeHtml(site.name || "")}" data-section-index="${sectionIndex}" data-site-index="${siteIndex}" data-preserve-icon="${preserveCurrentIcon}" data-icon-candidates="${escapeHtml(JSON.stringify(iconFallbacks))}" onload="validateSiteIcon(this)" onerror="loadNextIconCandidate(this)" />
      </span>
      <span class="site-copy">
        <span class="site-name">${escapeHtml(site.name)}</span>
      </span>
    </a>
  `;
}

function renderHomeSites() {
  if (!homeCardRow) return;
  homeCardRow.innerHTML = getHomeSites()
    .map((site, siteIndex) => renderSiteCard(site, 0, siteIndex))
    .join("");
}

function renderSections() {
  categorySections.innerHTML = sections
    .slice(1)
    .map(
      (section, sectionIndex) => `
        <section
          class="category-section page-section"
          aria-labelledby="section-${sectionIndex + 1}"
          data-page-index="${sectionIndex + 1}"
        >
          <h2
            class="section-title"
            id="section-${sectionIndex + 1}"
            data-section-index="${sectionIndex + 1}"
            title="${isAdminMode ? "右键删除分类" : escapeHtml(section.title)}"
          >${escapeHtml(section.title)}</h2>
          <div class="card-row">
            ${section.sites
              .map(
                (site, siteIndex) => renderSiteCard(site, sectionIndex + 1, siteIndex),
              )
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");
  renderHomeSites();
  renderCategoryOptions();
  renderCategoryIndex();
  setActiveCategoryIndex(activeCategoryIndex);
}

function getCardPosition(card) {
  return {
    sectionIndex: Number(card.dataset.sectionIndex),
    siteIndex: Number(card.dataset.siteIndex),
  };
}

function clearDragState() {
  document
    .querySelectorAll(".site-card.is-dragging, .site-card.is-drop-target")
    .forEach((card) => {
      card.classList.remove("is-dragging", "is-drop-target");
    });
}

function moveSiteInSection(fromIndex, toIndex, sectionIndex) {
  if (fromIndex === toIndex) return;
  const section = sections[sectionIndex];
  const [site] = section.sites.splice(fromIndex, 1);
  section.sites.splice(toIndex, 0, site);
  saveSections();
  renderSections();
}

async function moveSiteToSection(targetSectionIndex) {
  if (!contextTarget || contextTarget.type !== "site" || !isAdminMode) return;
  const { sectionIndex, siteIndex } = contextTarget;
  if (sectionIndex === targetSectionIndex) {
    closeContextMenu();
    return;
  }
  const sourceSection = sections[sectionIndex];
  const targetSection = sections[targetSectionIndex];
  const site = sourceSection?.sites[siteIndex];
  if (!sourceSection || !targetSection || !site) {
    closeContextMenu();
    return;
  }

  const previousSections = JSON.stringify(sections);
  sourceSection.sites.splice(siteIndex, 1);
  targetSection.sites.push(site);
  renderSections();
  try {
    await saveSectionsImmediately();
    closeContextMenu();
  } catch (error) {
    sections = JSON.parse(previousSections);
    localStorage.setItem(sectionsStorageKey, previousSections);
    localStorage.setItem(sectionsVersionKey, sectionsDataVersion);
    console.warn("移动网站失败：", error);
    setSyncStatus("移动失败，请重试", "warn");
    closeContextMenu();
    renderSections();
  }
}

async function confirmPendingDelete() {
  if (!pendingDelete || !isAdminMode) return;
  const target = { ...pendingDelete };
  const previousSections = JSON.stringify(sections);
  deleteConfirm.disabled = true;
  deleteConfirm.textContent = "删除中...";
  if (target.type === "site") {
    if (!sections[target.sectionIndex]?.sites[target.siteIndex]) {
      closeDeleteModal();
      return;
    }
    sections[target.sectionIndex].sites.splice(target.siteIndex, 1);
  } else if (target.type === "section") {
    if (!sections[target.sectionIndex]) {
      closeDeleteModal();
      return;
    }
    sections.splice(target.sectionIndex, 1);
  }
  try {
    await saveSectionsImmediately();
    closeDeleteModal();
    renderSections();
  } catch (error) {
    sections = JSON.parse(previousSections);
    localStorage.setItem(sectionsStorageKey, previousSections);
    localStorage.setItem(sectionsVersionKey, sectionsDataVersion);
    console.warn("删除失败：", error);
    deleteMessage.textContent = "删除失败，请重试。";
    deleteConfirm.disabled = false;
    deleteConfirm.textContent = "确认删除";
    renderSections();
  }
}

async function confirmPendingRename() {
  if (!pendingRename || !isAdminMode) return;
  const target = { ...pendingRename };
  const section = sections[target.sectionIndex];
  if (!section) {
    closeRenameModal();
    return;
  }
  const nextTitle = renameInput.value.trim();
  if (!nextTitle) {
    renameMessage.textContent = "请输入分类名称";
    return;
  }
  const hasDuplicate = sections.some(
    (item, index) => index !== target.sectionIndex && item.title === nextTitle,
  );
  if (hasDuplicate) {
    renameMessage.textContent = "分类已存在";
    return;
  }
  if (section.title === nextTitle) {
    closeRenameModal();
    return;
  }

  const previousTitle = section.title;
  renameConfirm.disabled = true;
  renameConfirm.textContent = "保存中...";
  section.title = nextTitle;
  try {
    await saveSectionsImmediately();
    closeRenameModal();
    renderSections();
  } catch (error) {
    section.title = previousTitle;
    localStorage.setItem(sectionsStorageKey, JSON.stringify(sections));
    localStorage.setItem(sectionsVersionKey, sectionsDataVersion);
    console.warn("重命名分类失败：", error);
    renameMessage.textContent = "保存失败，请重试";
    renameConfirm.disabled = false;
    renameConfirm.textContent = "保存";
    renderSections();
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  openSearch(searchInput.value);
});

hotTrendsCard.addEventListener("click", () => {
  window.open(hotSearchTargetUrl, "_blank", "noopener,noreferrer");
});

weatherToggle.addEventListener("click", openWeatherModal);
weatherClose.addEventListener("click", () => closeWeatherModal());
bindBackdropClose(weatherModal, closeWeatherModal);
document.querySelectorAll(".weather-hourly, .weather-daily").forEach((scroller) => {
  scroller.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (scroller.scrollWidth <= scroller.clientWidth) return;
      event.preventDefault();
      scroller.scrollLeft += event.deltaY;
    },
    { passive: false },
  );
});

backToTop.addEventListener("click", () => {
  scrollBackToTop();
});

engineToggle.addEventListener("click", () => {
  toggleEngineMenu();
});

engineMenu.addEventListener("click", (event) => {
  const button = event.target.closest(".engine-option");
  if (!button) return;
  setEngine(button.dataset.engine);
  toggleEngineMenu(false);
  searchInput.focus();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".engine-picker")) {
    toggleEngineMenu(false);
  }
  if (
    !event.target.closest(".settings-button") &&
    !event.target.closest(".settings-menu")
  ) {
    closeSettingsMenu();
  }
  if (
    !event.target.closest(".context-menu") &&
    !event.target.closest(".context-submenu")
  ) {
    closeContextMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeContextMenu();
    if (!deleteModal.hidden) {
      closeDeleteModal();
    }
    if (!renameModal.hidden) {
      closeRenameModal();
    }
    if (!iconModal.hidden) {
      closeIconModal();
    }
    if (!calendarModal.hidden) {
      closeCalendarModal();
    }
    if (!weatherModal.hidden) {
      closeWeatherModal();
    }
    if (!calculatorModal.hidden) {
      closeCalculatorModal();
    }
    if (!memoModal.hidden) {
      closeMemoModal();
    }
    return;
  }
  if (calculatorModal.hidden || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.key >= "0" && event.key <= "9") {
    event.preventDefault();
    appendCalculatorValue(event.key);
  } else if (event.key === ".") {
    event.preventDefault();
    appendCalculatorValue(".");
  } else if (["+", "-", "*", "/"].includes(event.key)) {
    event.preventDefault();
    appendCalculatorValue(event.key);
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    runCalculatorAction("equals");
  } else if (event.key === "Backspace") {
    event.preventDefault();
    runCalculatorAction("backspace");
  }
});

calendarToggle.addEventListener("click", openCalendarModal);
calendarClose.addEventListener("click", closeCalendarModal);
calendarPrev.addEventListener("click", () => changeCalendarMonth(-1));
calendarNext.addEventListener("click", () => changeCalendarMonth(1));
calendarToday.addEventListener("click", () => openCalendarModal());
bindBackdropClose(calendarModal, closeCalendarModal);
calendarDays.addEventListener("click", (event) => {
  const day = event.target.closest("[data-calendar-date]");
  if (!day) return;
  calendarView.selectedKey = day.dataset.calendarDate;
  renderCalendar();
});

calculatorToggle.addEventListener("click", openCalculatorModal);
calculatorClose.addEventListener("click", closeCalculatorModal);
bindBackdropClose(calculatorModal, closeCalculatorModal);
calculatorPad.addEventListener("click", (event) => {
  const key = event.target.closest("[data-calculator-value], [data-calculator-action]");
  if (!key) return;
  if (key.dataset.calculatorValue) appendCalculatorValue(key.dataset.calculatorValue);
  else runCalculatorAction(key.dataset.calculatorAction);
});

memoToggle.addEventListener("click", openMemoModal);
memoClose.addEventListener("click", () => closeMemoModal());
memoNew.addEventListener("click", startNewMemo);
memoSearch.addEventListener("input", async () => {
  const searchVersion = ++memoSearchVersion;
  memoSearchTerm = memoSearch.value.trim().toLocaleLowerCase("zh-CN");
  renderMemoList();
  if (!editingMemoId) {
    openMemoEditor(getVisibleMemos()[0] || null);
    return;
  }
  if (getVisibleMemos().some((memo) => memo._id === editingMemoId)) return;
  const saved = await flushMemoSave();
  if (!saved || searchVersion !== memoSearchVersion) return;
  openMemoEditor(getVisibleMemos()[0] || null);
});
memoInputTitle.addEventListener("input", scheduleMemoSave);
memoInputContent.addEventListener("input", scheduleMemoSave);
memoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await flushMemoSave();
});
bindBackdropClose(memoModal, closeMemoModal);
async function openMemoFromListItem(item) {
  if (!item) return;
  if (item.dataset.memoId === editingMemoId) {
    memoInputTitle.focus();
    return;
  }
  const memo = getMemoListItems().find((entry) => entry._id === item.dataset.memoId);
  if (!memo || memo.isDraft) return;
  await selectMemo(memo);
}

memoList.addEventListener("click", async (event) => {
  const remove = event.target.closest("[data-memo-delete]");
  if (remove) {
    await deleteMemo(remove.dataset.memoDelete);
    return;
  }
  const item = event.target.closest("[data-memo-id]");
  await openMemoFromListItem(item);
});
memoList.addEventListener("keydown", async (event) => {
  if (!['Enter', ' '].includes(event.key) || event.target.closest("button")) return;
  const item = event.target.closest("[data-memo-id]");
  if (!item) return;
  event.preventDefault();
  await openMemoFromListItem(item);
});

adminToggle.addEventListener("click", () => {
  if (isAdminMode) {
    toggleSettingsMenu();
    return;
  }
  openAdminModal();
});

logoutButton.addEventListener("click", () => {
  logoutAdmin();
});

openSettings.addEventListener("click", () => {
  openSettingsModal("site");
});

themeToggle.addEventListener("click", () => {
  openSettingsModal("theme");
});

quickAddToggle.addEventListener("click", () => {
  openQuickAddModal();
});

adminClose.addEventListener("click", () => {
  closeAdminModal();
});

bindBackdropClose(adminModal, closeAdminModal);

settingsClose.addEventListener("click", () => {
  closeSettingsModal();
});

bindBackdropClose(settingsModal, closeSettingsModal);

quickAddClose.addEventListener("click", () => {
  closeQuickAddModal();
});

bindBackdropClose(quickAddModal, closeQuickAddModal);

deleteClose.addEventListener("click", () => {
  closeDeleteModal();
});

deleteCancel.addEventListener("click", () => {
  closeDeleteModal();
});

bindBackdropClose(deleteModal, closeDeleteModal);

deleteConfirm.addEventListener("click", async () => {
  await confirmPendingDelete();
});

contextRename.addEventListener("click", () => {
  openRenameModal(contextTarget);
});

contextIcon.addEventListener("click", () => {
  openIconModal(contextTarget);
});

contextMove.addEventListener("click", () => {
  if (contextMoveMenu.hidden) {
    openMoveMenu();
    return;
  }
  closeMoveMenu();
});

contextMoveMenu.addEventListener("click", async (event) => {
  const button = event.target.closest(".context-submenu-item");
  if (!button || button.disabled) return;
  await moveSiteToSection(Number(button.dataset.targetSectionIndex));
});

contextDelete.addEventListener("click", () => {
  openDeleteModal(contextTarget);
});

iconClose.addEventListener("click", () => {
  closeIconModal();
});

iconCancel.addEventListener("click", () => {
  closeIconModal();
});

bindBackdropClose(iconModal, closeIconModal);

iconFetch.addEventListener("click", () => {
  useWebsiteIcon();
});

iconFileInput.addEventListener("change", async () => {
  const [file] = iconFileInput.files;
  if (!file) return;
  iconMessage.textContent = "正在处理图标...";
  try {
    const dataUrl = await resizeIconFile(file);
    setIconDraft(dataUrl);
    iconMessage.textContent = "已上传图标，保存后生效";
  } catch (error) {
    iconMessage.textContent = error.message || "图标处理失败";
  }
});

iconForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await confirmIconEdit();
});

renameClose.addEventListener("click", () => {
  closeRenameModal();
});

renameCancel.addEventListener("click", () => {
  closeRenameModal();
});

bindBackdropClose(renameModal, closeRenameModal);

renameForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await confirmPendingRename();
});

document.querySelectorAll("[data-settings-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    setSettingsTab(button.dataset.settingsTab);
  });
});

document.querySelectorAll("[data-settings-cancel]").forEach((button) => {
  button.addEventListener("click", () => {
    closeSettingsModal();
  });
});

quickAddCopy.addEventListener("click", copyQuickAddLink);

themeChoices.forEach((button) => {
  button.addEventListener("click", () => {
    saveTheme(button.dataset.themeChoice);
  });
});

wallpaperFileInput.addEventListener("change", async () => {
  const file = wallpaperFileInput.files?.[0];
  if (!file) return;
  if (wallpaperFileName) {
    wallpaperFileName.textContent = file.name;
  }
  wallpaperMessage.textContent = "正在处理图片...";
  wallpaperMessage.dataset.state = "";
  try {
    const dataUrl = await compressWallpaperFile(file);
    wallpaperDraft = dataUrl;
    wallpaperUrlInput.value = "";
    setWallpaperPreview(dataUrl);
    document.body.classList.add("has-wallpaper");
    document.body.style.setProperty("--wallpaper-image", getCssImageUrl(dataUrl));
    wallpaperMessage.textContent = "图片已载入，点击“应用壁纸”保存";
    wallpaperMessage.dataset.state = "ok";
  } catch (error) {
    console.warn("壁纸图片处理失败：", error);
    wallpaperMessage.textContent = error.message || "图片处理失败";
    wallpaperMessage.dataset.state = "";
    wallpaperFileInput.value = "";
    if (wallpaperFileName) {
      wallpaperFileName.textContent = "未选择图片";
    }
  }
});

wallpaperReset.addEventListener("click", () => {
  wallpaperDraft = defaultWallpaper;
  wallpaperUrlInput.value = "";
  wallpaperFileInput.value = "";
  if (wallpaperFileName) {
    wallpaperFileName.textContent = "未选择图片";
  }
  applyWallpaper(defaultWallpaper, { persist: true });
  wallpaperMessage.textContent = "已恢复默认背景";
  wallpaperMessage.dataset.state = "ok";
});

wallpaperForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const inputUrl = wallpaperUrlInput.value.trim();
  if (inputUrl) {
    try {
      const parsedUrl = new URL(inputUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("请输入 http 或 https 图片链接");
      }
      wallpaperDraft = parsedUrl.href;
    } catch (error) {
      wallpaperMessage.textContent = error.message || "图片链接格式不正确";
      wallpaperMessage.dataset.state = "";
      return;
    }
  }
  try {
    wallpaperMessage.textContent = wallpaperDraft ? "正在验证图片..." : "";
    wallpaperMessage.dataset.state = "";
    await validateWallpaperImage(wallpaperDraft);
    applyWallpaper(wallpaperDraft, { persist: true });
    wallpaperMessage.textContent = wallpaperDraft ? "壁纸已应用" : "已恢复默认背景";
    wallpaperMessage.dataset.state = "ok";
    wallpaperFileInput.value = "";
    if (wallpaperFileName) {
      wallpaperFileName.textContent = "未选择图片";
    }
  } catch (error) {
    wallpaperMessage.textContent = error.message || "壁纸保存失败";
    wallpaperMessage.dataset.state = "";
  }
});

adminForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = adminUsername.value.trim();
  const password = adminPassword.value;
  if (!username || !password) {
    adminMessage.textContent = "请输入 GitHub Token";
    return;
  }
  adminMessage.textContent = "正在验证仓库访问...";
  try {
    await loginAdmin(username, password);
    closeAdminModal();
    handlePendingBookmarkSite();
  } catch (error) {
    adminMessage.textContent = error.message || "配置失败，请检查 Token 权限";
  }
});

siteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!isAdminMode) return;
  const name = siteNameInput.value.trim();
  const url = getValidatedSiteUrl(siteUrlInput.value)?.href;
  const sectionIndex = Number(siteCategoryInput.value);
  if (!name || !url || !sections[sectionIndex]) {
    siteMessage.textContent = "请填写网站名称、链接和分类";
    siteMessage.dataset.state = "warn";
    return;
  }
  siteMessage.textContent = "添加中...";
  siteMessage.dataset.state = "";
  sections[sectionIndex].sites.push({
    name,
    url,
    description: siteDescriptionInput.value.trim(),
    icon: getFavicon(url),
  });
  try {
    await saveSectionsImmediately();
    renderSections();
    siteForm.reset();
    siteMessage.textContent = "已添加";
    siteMessage.dataset.state = "ok";
  } catch (error) {
    sections[sectionIndex].sites.pop();
    console.warn("添加网站失败：", error);
    localStorage.setItem(sectionsStorageKey, JSON.stringify(sections));
    siteMessage.textContent = error.message || "添加失败，请重试";
    siteMessage.dataset.state = "warn";
  }
});

categoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!isAdminMode) return;
  const title = categoryNameInput.value.trim();
  if (!title) {
    categoryMessage.textContent = "请输入分类名称";
    categoryMessage.dataset.state = "warn";
    return;
  }
  if (sections.some((section) => section.title === title)) {
    categoryMessage.textContent = "分类已存在";
    categoryMessage.dataset.state = "warn";
    return;
  }
  categoryMessage.textContent = "添加中...";
  categoryMessage.dataset.state = "";
  sections.push({ title, sites: [] });
  try {
    await saveSectionsImmediately();
    renderSections();
    categoryForm.reset();
    categoryMessage.textContent = "已添加";
    categoryMessage.dataset.state = "ok";
  } catch (error) {
    sections.pop();
    console.warn("添加分类失败：", error);
    localStorage.setItem(sectionsStorageKey, JSON.stringify(sections));
    categoryMessage.textContent = error.message || "添加失败，请重试";
    categoryMessage.dataset.state = "warn";
  }
});

document.addEventListener("dragstart", (event) => {
  const card = event.target.closest(".site-card");
  if (!card || !card.closest(".page-section")) return;
  if (!isAdminMode) {
    event.preventDefault();
    return;
  }
  draggedCard = getCardPosition(card);
  didDragCard = false;
  card.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", "");
});

document.addEventListener("dragover", (event) => {
  const card = event.target.closest(".site-card");
  if (!card || !card.closest(".page-section")) return;
  if (!isAdminMode) return;
  if (!card || !draggedCard) return;
  const targetCard = getCardPosition(card);
  if (targetCard.sectionIndex !== draggedCard.sectionIndex) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  document
    .querySelectorAll(".site-card.is-drop-target")
    .forEach((dropTarget) => dropTarget.classList.remove("is-drop-target"));
  card.classList.add("is-drop-target");
});

document.addEventListener("drop", (event) => {
  const card = event.target.closest(".site-card");
  if (!card || !card.closest(".page-section")) return;
  if (!isAdminMode) return;
  if (!card || !draggedCard) return;
  const targetCard = getCardPosition(card);
  if (targetCard.sectionIndex !== draggedCard.sectionIndex) return;
  event.preventDefault();
  didDragCard = true;
  moveSiteInSection(
    draggedCard.siteIndex,
    targetCard.siteIndex,
    draggedCard.sectionIndex,
  );
  draggedCard = null;
  clearDragState();
});

document.addEventListener("dragend", () => {
  draggedCard = null;
  clearDragState();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".page-section")) return;
  if (!didDragCard) return;
  event.preventDefault();
  didDragCard = false;
});

categoryIndex.addEventListener("click", (event) => {
  const link = event.target.closest(".category-index-link");
  if (!link) return;
  event.preventDefault();
  goToPage(Number(link.dataset.pageIndex));
});

document.addEventListener("contextmenu", (event) => {
  if (!event.target.closest(".page-section")) return;
  const card = event.target.closest(".site-card");
  if (!isAdminMode) return;
  const title = event.target.closest(".section-title");
  if (!card && !title) return;
  event.preventDefault();
  if (card) {
    const { sectionIndex, siteIndex } = getCardPosition(card);
    openContextMenu(event, { type: "site", sectionIndex, siteIndex });
    return;
  }
  if (!title.dataset.sectionIndex) return;
  openContextMenu(event, {
    type: "section",
    sectionIndex: Number(title.dataset.sectionIndex),
  });
});

window.addEventListener("wheel", handlePageWheel, { passive: false });
window.addEventListener("touchstart", handlePageTouchStart, { passive: true });
window.addEventListener("touchend", handlePageTouchEnd, { passive: true });
window.addEventListener("pageshow", () => {
  applyTheme(getSavedTheme());
  applyWallpaper(getSavedWallpaper());
});
window.addEventListener("storage", (event) => {
  if (event.key === themeStorageKey) {
    applyTheme(getSavedTheme());
  }
  if (event.key === wallpaperStorageKey) {
    applyWallpaper(getSavedWallpaper());
  }
});
categorySections.addEventListener(
  "scroll",
  () => {
    if (categoryIndexTicking) return;
    categoryIndexTicking = true;
    window.requestAnimationFrame(() => {
      updateBackToTopVisibility();
      categoryIndexTicking = false;
    });
  },
  true,
);

applyTheme(getSavedTheme());
applyWallpaper(getSavedWallpaper());
setEngine(currentEngine);
updateQuickAddLink();
setAdminMode(false);
setActiveCategoryIndex(0);
updateDateTime();
setInterval(updateDateTime, 30 * 1000);
bootstrap();

async function bootstrap() {
  const iconAssetsReady = window.siteIconAssets.load();
  pendingBookmarkSite = getBookmarkSiteFromUrl();
  if (pendingBookmarkSite) {
    clearBookmarkParams();
  }
  await loadSections();
  refreshWidgetFeeds();
  await iconAssetsReady;
  const displayedSections = JSON.stringify(sections);
  renderSections();
  try {
    sections = await window.githubNavigation.load();
    ensureHomeSection();
    removeFallbackSiteIcons();
    localStorage.setItem(sectionsStorageKey, JSON.stringify(sections));
    localStorage.setItem(sectionsVersionKey, sectionsDataVersion);
    setAdminMode(Boolean(window.githubNavigation.token));
    setSyncStatus(isAdminMode ? "GitHub 已连接 · 本机可编辑" : "公开浏览 · GitHub 已连接", "ok");
  } catch (error) {
    setSyncStatus(`${error.message}；显示本地缓存`, "warn");
  }
  // This distribution intentionally makes no CloudBase requests.
  document.querySelector("#memo-toggle").disabled = true;
  document.querySelector("#memo-widget-title").textContent = "备忘录未迁移";
  document.querySelector("#memo-widget-time").textContent = "保护隐私，不公开同步";
  document.querySelector("#memo-widget-content").textContent = "原有内容仍保留在旧版站点";
  document.querySelector("#logout-button").textContent = "断开本机编辑";
  if (JSON.stringify(sections) !== displayedSections) renderSections();
  handlePendingBookmarkSite();
}

document.querySelector("#export-navigation").addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(sections, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "banana-nav-backup.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
window.addEventListener("beforeunload", (event) => {
  if (window.githubNavigation.dirty) {
    event.preventDefault();
    event.returnValue = "";
  }
});
