// 라벨 사전(REGION_LABEL 등), 업종 그룹, SITE_INFO는 js/schema.js에 있다.

// ---------- 필터 정의 ----------
// key = URL·상태에 쓰는 이름, param = URL 쿼리 이름, more = "상세 필터" 안에 접어 둘 그룹
// 그룹 안에서는 OR(하나라도 해당), 그룹끼리는 AND(모두 해당)
const toOptions = (labels) => Object.entries(labels).map(([value, label]) => ({ value, label }));

const FILTER_GROUPS = [
  {
    key: "industry",
    label: "업종",
    param: "industry",
    options: Object.entries(INDUSTRY_GROUPS).map(([value, g]) => ({ value, label: g.label })),
    valuesOf: (site) => [industryGroupOf(site)]
  },
  { key: "style", label: "스타일", param: "style", options: toOptions(MOOD_LABEL), valuesOf: (site) => site.moods },
  { key: "theme", label: "테마", param: "theme", options: toOptions(THEME_LABEL), valuesOf: (site) => [site.theme] },
  { key: "region", label: "지역", param: "region", options: toOptions(REGION_LABEL), valuesOf: (site) => [site.region] },
  {
    key: "colorTone",
    label: "컬러톤",
    param: "tone",
    more: true,
    options: toOptions(COLOR_TONE_LABEL),
    valuesOf: (site) => [site.colorTone]
  },
  {
    key: "font",
    label: "폰트",
    param: "font",
    more: true,
    options: toOptions(FONT_CATEGORY_LABEL),
    valuesOf: (site) => [site.font.category]
  }
];
const GROUP_BY_KEY = Object.fromEntries(FILTER_GROUPS.map((g) => [g.key, g]));

// ---------- 정렬 정의 (새 정렬은 여기에 한 줄 추가) ----------
// 조회수·등록일 정렬은 데이터가 생기면 추가한다 (예: recent: { label: "최근 추가순", compare: (a, b) => ... }).
const nameCollator = new Intl.Collator(["en", "ko"], { sensitivity: "base" });
const SORT_OPTIONS = {
  recommended: {
    label: "추천순",
    // 상세 정보가 정리된 브랜드를 먼저, 그 안에서는 등록 순서
    compare: (a, b) => b._isDetailed - a._isDetailed || a._order - b._order
  },
  "name-asc": { label: "이름순 (A→Z)", compare: (a, b) => nameCollator.compare(a.name, b.name) },
  "name-desc": { label: "이름순 (Z→A)", compare: (a, b) => nameCollator.compare(b.name, a.name) },
  region: { label: "지역순", compare: (a, b) => a.region.localeCompare(b.region) || a._order - b._order }
};
const DEFAULT_SORT = "recommended";

// ---------- 상태 ----------
const state = {
  query: "",
  filters: Object.fromEntries(FILTER_GROUPS.map((g) => [g.key, new Set()])),
  favoritesOnly: false,
  sort: DEFAULT_SORT
};
let allSites = [];

const PAGE_SIZE = 12;
let visibleCount = PAGE_SIZE;

const listViewEl = document.getElementById("list-view");
const filterPanelEl = document.getElementById("filter-panel");
const filterGroupsEl = document.getElementById("filter-groups");
const filterMoreGroupsEl = document.getElementById("filter-more-groups");
const filterBackdropEl = document.getElementById("filter-backdrop");
const filterOpenEl = document.getElementById("filter-open");
const filterOpenCountEl = document.getElementById("filter-open-count");
const filterApplyEl = document.getElementById("filter-apply");
const activeFiltersEl = document.getElementById("active-filters");
const cardGridEl = document.getElementById("card-grid");
const resultCountEl = document.getElementById("result-count");
const searchInputEl = document.getElementById("search-input");
const sortSelectEl = document.getElementById("sort-select");
const emptyStateEl = document.getElementById("empty-state");
const favoritesToggleEl = document.getElementById("favorites-toggle");
const loadMoreWrapEl = document.getElementById("load-more-wrap");
const loadMoreBtnEl = document.getElementById("load-more-btn");
const detailViewEl = document.getElementById("detail-view");
const detailContentEl = document.getElementById("detail-content");
const detailBreadcrumbEl = document.getElementById("detail-breadcrumb");
const backToTopEl = document.getElementById("back-to-top");

// ---------- 검색·필터용 색인 (불러올 때 한 번만 계산) ----------

function buildSearchText(site) {
  const group = INDUSTRY_GROUPS[industryGroupOf(site)];
  const { layout, ui } = site;
  return [
    site.name,
    site.id,
    site.industry,
    group && group.label,
    ...(group ? group.aliases : []),
    ...site.moods,
    ...site.keywords,
    ...site.tags,
    site.description,
    site.theme,
    THEME_LABEL[site.theme],
    ...(THEME_ALIASES[site.theme] || []),
    REGION_LABEL[site.region],
    ...(REGION_ALIASES[site.region] || []),
    layout.type,
    LAYOUT_TYPE_LABEL[layout.type],
    layout.density,
    WHITESPACE_LABEL[layout.whitespace],
    ...(ui.imageStyle || []).map((s) => IMAGE_STYLE_LABEL[s])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function indexSite(site, i) {
  const facets = {};
  FILTER_GROUPS.forEach((g) => (facets[g.key] = g.valuesOf(site)));
  return {
    ...site,
    _order: i,
    _isDetailed: site.characteristics.length > 0 ? 1 : 0,
    _facets: facets,
    _search: buildSearchText(site)
  };
}

// ---------- 걸러내기 ----------

// skipKey: 해당 그룹은 빼고 검사 (필터 옵션 옆 개수를 셀 때 사용)
function matches(site, skipKey) {
  for (const g of FILTER_GROUPS) {
    if (g.key === skipKey) continue;
    const selected = state.filters[g.key];
    if (selected.size === 0) continue;
    if (!site._facets[g.key].some((v) => selected.has(v))) return false;
  }
  if (state.favoritesOnly && !isFavorite(site.id)) return false;
  if (state.query) {
    // 여러 단어는 모두 포함해야 함 (예: "minimal 금융")
    const words = state.query.split(/\s+/);
    if (!words.every((w) => site._search.includes(w))) return false;
  }
  return true;
}

function activeFilterCount() {
  return FILTER_GROUPS.reduce((n, g) => n + state.filters[g.key].size, 0);
}

function hasAnyCondition() {
  return activeFilterCount() > 0 || state.query !== "" || state.favoritesOnly;
}

// ---------- 필터 패널 ----------

// [그룹 key][값] → 칩 버튼. 다시 그리지 않고 상태만 바꿔서 포커스가 유지되게 한다.
const chipRefs = {};

function renderFilterPanel() {
  filterGroupsEl.innerHTML = "";
  filterMoreGroupsEl.innerHTML = "";

  FILTER_GROUPS.forEach((group) => {
    // 데이터에 한 번도 나오지 않는 값(예: 교육 업종)은 보여 주지 않는다
    const used = new Set(allSites.flatMap((s) => s._facets[group.key]));
    const options = group.options.filter((o) => used.has(o.value));
    if (!options.length) return;

    const groupEl = document.createElement("div");
    groupEl.className = "filter-group";
    const titleEl = document.createElement("span");
    titleEl.className = "filter-group__title";
    titleEl.textContent = group.label;
    groupEl.appendChild(titleEl);

    const chipsEl = document.createElement("div");
    chipsEl.className = "filter-group__chips";
    chipRefs[group.key] = {};
    options.forEach((opt) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.setAttribute("aria-pressed", "false");
      const label = document.createElement("span");
      label.textContent = opt.label;
      const count = document.createElement("span");
      count.className = "chip__count";
      chip.append(label, count);
      chip.addEventListener("click", () => toggleFilter(group.key, opt.value));
      chipsEl.appendChild(chip);
      chipRefs[group.key][opt.value] = { chip, count };
    });
    groupEl.appendChild(chipsEl);
    (group.more ? filterMoreGroupsEl : filterGroupsEl).appendChild(groupEl);
  });
}

// 각 옵션 옆 숫자 = 지금 조건에서 그 옵션을 고르면 나올 브랜드 수 (같은 그룹 조건은 빼고 계산)
function updateFilterPanel() {
  FILTER_GROUPS.forEach((group) => {
    const refs = chipRefs[group.key];
    if (!refs) return;
    const counts = {};
    allSites.forEach((site) => {
      if (!matches(site, group.key)) return;
      site._facets[group.key].forEach((v) => (counts[v] = (counts[v] || 0) + 1));
    });
    Object.entries(refs).forEach(([value, { chip, count }]) => {
      const active = state.filters[group.key].has(value);
      const n = counts[value] || 0;
      chip.classList.toggle("chip--active", active);
      chip.classList.toggle("chip--empty", !active && n === 0);
      chip.setAttribute("aria-pressed", String(active));
      count.textContent = n;
    });
  });

  const n = activeFilterCount();
  filterOpenCountEl.hidden = n === 0;
  filterOpenCountEl.textContent = n;
}

// 현재 조건을 지울 수 있는 칩으로 보여 준다 (예: 업종: 금융 ✕)
function renderActiveFilters() {
  activeFiltersEl.innerHTML = "";
  const items = [];
  if (state.query) items.push({ label: `검색: ${state.query}`, remove: () => setQuery("") });
  FILTER_GROUPS.forEach((group) => {
    state.filters[group.key].forEach((value) => {
      const opt = group.options.find((o) => o.value === value);
      items.push({ label: `${group.label}: ${opt ? opt.label : value}`, remove: () => toggleFilter(group.key, value) });
    });
  });
  if (state.favoritesOnly) items.push({ label: "즐겨찾기만", remove: () => setFavoritesOnly(false) });

  items.forEach(({ label, remove }) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "active-chip";
    chip.setAttribute("aria-label", `${label} 조건 지우기`);
    chip.innerHTML = `<span></span><span class="active-chip__x" aria-hidden="true">✕</span>`;
    chip.firstChild.textContent = label;
    chip.addEventListener("click", remove);
    activeFiltersEl.appendChild(chip);
  });

  if (items.length > 1) {
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "clear-all-btn";
    clear.textContent = "모두 지우기";
    clear.addEventListener("click", clearAll);
    activeFiltersEl.appendChild(clear);
  }
}

// ---------- 상태 바꾸기 (모두 update()로 화면과 URL을 함께 갱신) ----------

function update() {
  visibleCount = PAGE_SIZE;
  renderCards();
  writeUrl();
}

function toggleFilter(key, value) {
  const set = state.filters[key];
  if (set.has(value)) set.delete(value);
  else set.add(value);
  update();
}

function addFilter(key, value) {
  state.filters[key].add(value);
  update();
}

function setQuery(q) {
  state.query = q.trim().toLowerCase();
  if (searchInputEl.value.trim().toLowerCase() !== state.query) searchInputEl.value = q;
  update();
}

function setFavoritesOnly(on) {
  state.favoritesOnly = on;
  favoritesToggleEl.classList.toggle("chip--active", on);
  favoritesToggleEl.setAttribute("aria-pressed", String(on));
  update();
}

function clearAll() {
  FILTER_GROUPS.forEach((g) => state.filters[g.key].clear());
  state.query = "";
  searchInputEl.value = "";
  state.favoritesOnly = false;
  favoritesToggleEl.classList.remove("chip--active");
  favoritesToggleEl.setAttribute("aria-pressed", "false");
  update();
}

// 카드의 업종·스타일을 눌렀을 때: 그 조건을 필터에 더하고 목록 위로
function quickFilter(key, value) {
  addFilter(key, value);
  listViewEl.scrollIntoView({ behavior: "smooth" });
}

// ---------- URL 쿼리와 상태 동기화 (?industry=finance&style=minimal,editorial&q=...) ----------

function readUrl() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || "";
  state.query = q.trim().toLowerCase();
  searchInputEl.value = q;
  FILTER_GROUPS.forEach((g) => {
    const valid = new Set(g.options.map((o) => o.value));
    const raw = params.get(g.param);
    state.filters[g.key] = new Set(raw ? raw.split(",").filter((v) => valid.has(v)) : []);
  });
  const sort = params.get("sort");
  state.sort = SORT_OPTIONS[sort] ? sort : DEFAULT_SORT;
  sortSelectEl.value = state.sort;
}

function writeUrl() {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  FILTER_GROUPS.forEach((g) => {
    const set = state.filters[g.key];
    if (set.size) params.set(g.param, Array.from(set).join(","));
  });
  if (state.sort !== DEFAULT_SORT) params.set("sort", state.sort);
  const search = params.toString();
  const url = window.location.pathname + (search ? `?${search.replace(/%2C/g, ",")}` : "") + window.location.hash;
  try {
    history.replaceState(null, "", url);
  } catch (e) {
    /* 일부 환경(file:// 등)에서 막히면 URL 저장만 건너뜀 */
  }
}

// ---------- 카드 ----------

function createSwatch(hex) {
  const dot = document.createElement("span");
  dot.className = "swatch";
  dot.style.background = hex;
  dot.title = hex;
  return dot;
}

function createCard(site) {
  const card = document.createElement("article");
  card.className = "card";

  const thumb = document.createElement("div");
  thumb.className = "card__thumb";
  thumb.style.background = `linear-gradient(135deg, ${site.mainColors.join(", ")})`;

  const thumbLabel = document.createElement("span");
  thumbLabel.className = "card__thumb-label";
  thumbLabel.textContent = site.name.slice(0, 2).toUpperCase();
  thumb.appendChild(thumbLabel);

  const themeBadge = document.createElement("span");
  themeBadge.className = `badge badge--${site.theme}`;
  themeBadge.textContent = THEME_LABEL[site.theme];
  thumb.appendChild(themeBadge);

  const favBtn = document.createElement("button");
  favBtn.type = "button";
  favBtn.className = "fav-btn" + (isFavorite(site.id) ? " fav-btn--active" : "");
  favBtn.textContent = isFavorite(site.id) ? "★" : "☆";
  favBtn.setAttribute("aria-label", "즐겨찾기");
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const active = toggleFavorite(site.id);
    favBtn.classList.toggle("fav-btn--active", active);
    favBtn.textContent = active ? "★" : "☆";
    if (state.favoritesOnly) renderCards();
  });
  thumb.appendChild(favBtn);

  card.appendChild(thumb);

  const body = document.createElement("div");
  body.className = "card__body";

  // 카드 = 요약 정보만: 브랜드명 · 지역/업종 · 대표 색 · 핵심 키워드 · 짧은 설명
  const title = document.createElement("h3");
  title.className = "card__title";
  title.textContent = site.name;
  body.appendChild(title);

  const meta = document.createElement("p");
  meta.className = "card__meta";
  const region = document.createElement("span");
  region.textContent = REGION_LABEL[site.region] || site.region;
  const industry = document.createElement("button");
  industry.type = "button";
  industry.className = "card__industry";
  industry.textContent = site.industry;
  const groupKey = industryGroupOf(site);
  industry.title = `${INDUSTRY_GROUPS[groupKey].label} 업종만 보기`;
  industry.addEventListener("click", (e) => {
    e.stopPropagation();
    quickFilter("industry", groupKey);
  });
  meta.append(region, " · ", industry);
  body.appendChild(meta);

  const swatches = document.createElement("div");
  swatches.className = "card__swatches";
  site.palette.slice(0, 5).forEach((c) => swatches.appendChild(createSwatch(c.hex)));
  body.appendChild(swatches);

  // 핵심 키워드 2~4개: 무드(누르면 스타일 필터), 무드가 없으면 태그(누르면 검색)
  const tags = document.createElement("div");
  tags.className = "card__tags";
  const keywordItems = site.moods.length
    ? site.moods.slice(0, 4).map((m) => ({ label: MOOD_LABEL[m] || m, onClick: () => quickFilter("style", m) }))
    : site.tags.slice(0, 3).map((t) => ({ label: t, onClick: () => setQuery(t) }));
  keywordItems.forEach(({ label, onClick }) => {
    const tag = document.createElement("button");
    tag.type = "button";
    tag.className = "tag";
    tag.textContent = label;
    tag.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick();
    });
    tags.appendChild(tag);
  });
  body.appendChild(tags);

  const desc = document.createElement("p");
  desc.className = "card__desc";
  desc.textContent = site.description;
  body.appendChild(desc);

  card.appendChild(body);

  card.addEventListener("click", () => {
    window.location.hash = `/site/${encodeURIComponent(site.id)}`;
  });

  return card;
}

// ---------- 결과 그리기 ----------

function renderCards() {
  const filtered = allSites.filter((s) => matches(s)).sort(SORT_OPTIONS[state.sort].compare);
  const pageItems = filtered.slice(0, visibleCount);

  cardGridEl.innerHTML = "";
  pageItems.forEach((site, i) => {
    const card = createCard(site);
    card.style.animationDelay = `${Math.min(i, 12) * 25}ms`;
    cardGridEl.appendChild(card);
  });

  resultCountEl.textContent = hasAnyCondition()
    ? `레퍼런스 ${filtered.length}개 (전체 ${allSites.length}개 중)`
    : `레퍼런스 ${allSites.length}개`;
  filterApplyEl.textContent = `결과 ${filtered.length}개 보기`;
  emptyStateEl.hidden = filtered.length !== 0;
  loadMoreWrapEl.hidden = filtered.length <= visibleCount;

  updateFilterPanel();
  renderActiveFilters();
}

// ---------- 이벤트 ----------

searchInputEl.addEventListener("input", (e) => {
  state.query = e.target.value.trim().toLowerCase();
  update();
});

Object.entries(SORT_OPTIONS).forEach(([value, { label }]) => {
  sortSelectEl.appendChild(new Option(label, value));
});
sortSelectEl.addEventListener("change", (e) => {
  state.sort = e.target.value;
  update();
});

loadMoreBtnEl.addEventListener("click", () => {
  visibleCount += PAGE_SIZE;
  renderCards();
});

favoritesToggleEl.setAttribute("aria-pressed", "false");
favoritesToggleEl.addEventListener("click", () => setFavoritesOnly(!state.favoritesOnly));

document.getElementById("empty-clear").addEventListener("click", clearAll);
document.getElementById("filter-reset").addEventListener("click", clearAll);

// ---------- 모바일 필터 시트 ----------

const mobileQuery = window.matchMedia("(max-width: 860px)");

function openFilterDrawer() {
  filterPanelEl.classList.add("is-open");
  filterBackdropEl.hidden = false;
  filterOpenEl.setAttribute("aria-expanded", "true");
  document.body.classList.add("no-scroll");
}

function closeFilterDrawer() {
  filterPanelEl.classList.remove("is-open");
  filterBackdropEl.hidden = true;
  filterOpenEl.setAttribute("aria-expanded", "false");
  document.body.classList.remove("no-scroll");
}

filterOpenEl.addEventListener("click", openFilterDrawer);
document.getElementById("filter-close").addEventListener("click", closeFilterDrawer);
filterApplyEl.addEventListener("click", closeFilterDrawer);
filterBackdropEl.addEventListener("click", closeFilterDrawer);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && filterPanelEl.classList.contains("is-open")) closeFilterDrawer();
});
mobileQuery.addEventListener("change", (e) => {
  if (!e.matches) closeFilterDrawer();
});

// ---------- 맨 위로 이동 ----------

window.addEventListener("scroll", () => {
  backToTopEl.hidden = window.scrollY < 400;
});

backToTopEl.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ---------- 상세 보기 (해시 라우팅 #/site/id: 헤더는 그대로 두고 목록 대신 상세 내용을 보여 줌) ----------

function getRouteSiteId() {
  const match = window.location.hash.match(/^#\/site\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

// 상세 화면 내용은 js/detail.js (renderDetailPage, renderDetailNotFound)

// site가 없으면(잘못된 주소) 마지막 칸에 "찾을 수 없음"을 표시
function renderBreadcrumb(site) {
  detailBreadcrumbEl.innerHTML = "";

  const homeLink = document.createElement("a");
  homeLink.href = "#";
  homeLink.textContent = "목록";
  homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.hash = "";
  });

  const makeSep = () => {
    const sep = document.createElement("span");
    sep.className = "breadcrumb__sep";
    sep.textContent = "›";
    return sep;
  };

  const current = document.createElement("span");
  current.className = "breadcrumb__current";
  current.textContent = site ? site.name : "찾을 수 없음";

  if (!site) {
    detailBreadcrumbEl.append(homeLink, makeSep(), current);
    return;
  }
  const industry = document.createElement("span");
  industry.className = "breadcrumb__mid";
  industry.textContent = site.industry;
  detailBreadcrumbEl.append(homeLink, makeSep(), industry, makeSep(), current);
}

// 목록 ↔ 상세 전환. 목록의 검색·필터 상태와 스크롤 위치는 그대로 기억한다.
let listScrollY = 0;

function showListView() {
  const wasDetail = !detailViewEl.hidden;
  document.title = SITE_INFO.name;
  listViewEl.hidden = false;
  detailViewEl.hidden = true;
  renderCards();
  if (wasDetail) window.scrollTo({ top: listScrollY });
}

function showDetailView(site, id) {
  if (!listViewEl.hidden) listScrollY = window.scrollY;
  closeFilterDrawer();
  listViewEl.hidden = true;
  detailViewEl.hidden = false;
  renderBreadcrumb(site);
  if (site) {
    document.title = `${site.name} · ${SITE_INFO.name}`;
    renderDetailPage(detailContentEl, site);
  } else {
    document.title = `찾을 수 없음 · ${SITE_INFO.name}`;
    renderDetailNotFound(detailContentEl, id);
  }
  window.scrollTo({ top: 0 });
}

function route() {
  const id = getRouteSiteId();
  if (!id) return showListView();
  showDetailView(allSites.find((s) => s.id === id) || null, id);
}

// 상세 섹션 메뉴가 헤더 바로 아래에 붙도록 헤더 높이를 CSS 변수로 알려 준다
function syncHeaderHeight() {
  document.documentElement.style.setProperty("--header-h", `${document.getElementById("site-header").offsetHeight}px`);
}
window.addEventListener("resize", syncHeaderHeight);

window.addEventListener("hashchange", route);

(async function init() {
  document.getElementById("site-title").textContent = SITE_INFO.name;
  document.getElementById("site-tagline").textContent = SITE_INFO.tagline;
  syncHeaderHeight();
  allSites = (await loadSites()).map(indexSite);
  readUrl();
  renderFilterPanel();
  route();
})();
