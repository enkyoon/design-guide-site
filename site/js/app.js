// 목록(검색·필터·정렬·카드), 화면 전환(주소), 불러오기 상태를 맡는다.
// 라벨·업종 그룹·SITE_INFO는 js/schema.js, 데이터는 js/brand-service.js, 상세 화면은 js/detail.js.

// ---------- 필터 정의 ----------
// key = 상태 이름, param = URL 쿼리 이름, more = "상세 필터" 안에 접어 둘 그룹
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
  { key: "colorTone", label: "컬러톤", param: "tone", more: true, options: toOptions(COLOR_TONE_LABEL), valuesOf: (site) => [site.colorTone] },
  { key: "font", label: "폰트", param: "font", more: true, options: toOptions(FONT_CATEGORY_LABEL), valuesOf: (site) => [site.font.category] }
];

// ---------- 정렬 정의 (새 정렬은 여기에 한 줄 추가) ----------
// 조회수·등록일 정렬은 데이터가 생기면 추가한다 (예: recent: { label: "최근 추가순", compare: (a, b) => ... }).
const nameCollator = new Intl.Collator(["en", "ko"], { sensitivity: "base" });
const SORT_OPTIONS = {
  // 분석이 많이 채워진 브랜드를 먼저, 같으면 이름순 (데이터는 이름순으로 받음)
  recommended: { label: "추천순", compare: (a, b) => b._depth - a._depth || a._order - b._order },
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
let loadState = "loading"; // loading | ready | error | empty

const PAGE_SIZE = 12;
let visibleCount = PAGE_SIZE;

const $ = (id) => document.getElementById(id);
const listViewEl = $("list-view");
const filterPanelEl = $("filter-panel");
const filterGroupsEl = $("filter-groups");
const filterMoreGroupsEl = $("filter-more-groups");
const filterBackdropEl = $("filter-backdrop");
const filterOpenEl = $("filter-open");
const filterOpenCountEl = $("filter-open-count");
const filterApplyEl = $("filter-apply");
const activeFiltersEl = $("active-filters");
const cardGridEl = $("card-grid");
const resultCountEl = $("result-count");
const searchInputEl = $("search-input");
const searchClearEl = $("search-clear");
const sortSelectEl = $("sort-select");
const emptyStateEl = $("empty-state");
const favoritesToggleEl = $("favorites-toggle");
const favoritesCountEl = $("favorites-count");
const loadMoreWrapEl = $("load-more-wrap");
const loadStateEl = $("load-state");
const dataModeEl = $("data-mode");
const detailViewEl = $("detail-view");
const detailContentEl = $("detail-content");
const detailBreadcrumbEl = $("detail-breadcrumb");
const backToTopEl = $("back-to-top");

// ---------- 검색·필터용 색인 (불러올 때 한 번만 계산) ----------

function buildSearchText(site) {
  const group = INDUSTRY_GROUPS[industryGroupOf(site)];
  const { layout, ui } = site;
  return [
    site.name,
    site.slug,
    site.industry,
    group && group.label,
    ...(group ? group.aliases : []),
    ...site.moods,
    ...site.keywords,
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
  // _depth: 상세 분석이 얼마나 채워졌는지 (추천순에 사용)
  const depth = [site.analysis, site.characteristics.length, site.typography.sample, (site.layout.blocks || []).length, site.ui.components && site.ui.components.buttons, (site.visual.notes || []).length, site.bestFor.length].filter(Boolean).length;
  return { ...site, _order: i, _depth: depth, _facets: facets, _search: buildSearchText(site) };
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
  if (state.favoritesOnly && !isFavorite(site.slug)) return false;
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
  filterPanelEl.classList.remove("is-loading");
  filterGroupsEl.innerHTML = "";
  filterMoreGroupsEl.innerHTML = "";

  FILTER_GROUPS.forEach((group) => {
    // 데이터에 한 번도 나오지 않는 값(예: 교육 업종)은 보여 주지 않는다
    const used = new Set(allSites.flatMap((s) => s._facets[group.key]));
    const options = group.options.filter((o) => used.has(o.value));
    if (!options.length) return;

    const groupEl = document.createElement("fieldset");
    groupEl.className = "filter-group";
    const legend = document.createElement("legend");
    legend.className = "filter-group__title";
    legend.textContent = group.label;
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
      chipRefs[group.key][opt.value] = { chip, count, label: opt.label };
    });
    groupEl.append(legend, chipsEl);
    (group.more ? filterMoreGroupsEl : filterGroupsEl).appendChild(groupEl);
  });
}

// 불러오는 동안 필터 자리를 비슷한 높이의 회색 칩으로 채워 화면이 밀리지 않게 한다
function renderFilterSkeleton() {
  filterPanelEl.classList.add("is-loading");
  filterGroupsEl.innerHTML = "";
  filterMoreGroupsEl.innerHTML = "";
  [5, 6, 2, 4].forEach((n) => {
    const g = document.createElement("div");
    g.className = "filter-group";
    g.setAttribute("aria-hidden", "true");
    g.innerHTML = '<span class="sk sk--title" style="width:48px;height:12px"></span><div>' + '<span class="sk sk--chip"></span>'.repeat(n) + "</div>";
    filterGroupsEl.appendChild(g);
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
    Object.entries(refs).forEach(([value, { chip, count, label }]) => {
      const active = state.filters[group.key].has(value);
      const n = counts[value] || 0;
      chip.classList.toggle("chip--active", active);
      chip.classList.toggle("chip--empty", !active && n === 0);
      chip.setAttribute("aria-pressed", String(active));
      chip.setAttribute("aria-label", `${group.label} ${label}, ${n}개`);
      count.textContent = n;
    });
  });

  const n = activeFilterCount();
  filterOpenCountEl.hidden = n === 0;
  filterOpenCountEl.textContent = n;
  filterOpenEl.setAttribute("aria-label", n ? `필터 열기, ${n}개 선택됨` : "필터 열기");
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

function setQuery(q) {
  state.query = q.trim().toLowerCase();
  if (searchInputEl.value.trim().toLowerCase() !== state.query) searchInputEl.value = q;
  searchClearEl.hidden = !searchInputEl.value;
  update();
}

function syncFavoritesButton() {
  favoritesToggleEl.setAttribute("aria-pressed", String(state.favoritesOnly));
  favoritesCountEl.textContent = favoriteCount();
  favoritesToggleEl.setAttribute(
    "aria-label",
    `즐겨찾기 ${favoriteCount()}개${state.favoritesOnly ? ", 즐겨찾기만 보는 중" : " 보기"}`
  );
}

function setFavoritesOnly(on) {
  state.favoritesOnly = on;
  syncFavoritesButton();
  update();
}

function clearAll() {
  FILTER_GROUPS.forEach((g) => state.filters[g.key].clear());
  state.query = "";
  searchInputEl.value = "";
  searchClearEl.hidden = true;
  state.favoritesOnly = false;
  syncFavoritesButton();
  update();
}

// 카드의 업종·스타일을 눌렀을 때: 그 조건을 필터에 더하고 목록 위로
function quickFilter(key, value) {
  state.filters[key].add(value);
  update();
  $("toolbar").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- URL 쿼리와 상태 동기화 (?industry=finance&style=minimal,editorial&q=...) ----------

function readUrl() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || "";
  state.query = q.trim().toLowerCase();
  searchInputEl.value = q;
  searchClearEl.hidden = !q;
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
    history.replaceState(history.state, "", url);
  } catch (e) {
    /* 일부 환경(file:// 등)에서 막히면 URL 저장만 건너뜀 */
  }
}

// ---------- 카드 ----------

const brandHref = (site) => `#/brand/${encodeURIComponent(site.slug)}`;

function createSwatch(hex) {
  const dot = document.createElement("span");
  dot.className = "swatch";
  dot.style.background = hex;
  dot.title = hex;
  return dot;
}

// 카드 전체가 눌리는 링크(제목 링크를 카드 위로 펼침). 즐겨찾기·업종·스타일 버튼은 그 위에서 따로 동작한다.
// eager: 첫 화면에 보이는 카드는 이미지를 바로 불러온다 (나머지는 스크롤할 때)
function createCard(site, eager) {
  const card = document.createElement("article");
  card.className = "card";

  const thumb = document.createElement("div");
  thumb.className = "card__thumb";
  thumb.style.background = `linear-gradient(135deg, ${site.mainColors.join(", ")})`;
  const thumbLabel = document.createElement("span");
  thumbLabel.className = "card__thumb-label";
  thumbLabel.setAttribute("aria-hidden", "true");
  thumbLabel.textContent = site.name.slice(0, 2).toUpperCase();
  const themeBadge = document.createElement("span");
  themeBadge.className = `badge badge--${site.theme}`;
  themeBadge.textContent = THEME_LABEL[site.theme] || site.theme;
  thumb.append(thumbLabel, themeBadge);
  // 첫 화면 캡처가 있으면 그라데이션 위에 덮는다 (불러오기 실패 시 그라데이션과 이니셜이 그대로 보임)
  if (site.previewImage) {
    const img = document.createElement("img");
    img.className = "card__shot";
    img.src = site.previewImage;
    img.alt = "";
    img.loading = eager ? "eager" : "lazy";
    img.decoding = "async";
    img.width = 480;
    img.height = 300;
    img.addEventListener("error", () => img.remove());
    thumb.insertBefore(img, themeBadge);
  }
  const favBtn = document.createElement("button");
  favBtn.type = "button";
  favBtn.className = "fav-btn";
  const star = document.createElement("span");
  star.setAttribute("aria-hidden", "true");
  favBtn.appendChild(star);
  const syncFav = () => {
    const on = isFavorite(site.slug);
    favBtn.classList.toggle("fav-btn--active", on);
    favBtn.setAttribute("aria-pressed", String(on));
    favBtn.setAttribute("aria-label", `${site.name} 즐겨찾기${on ? " 해제" : "에 추가"}`);
    star.textContent = on ? "★" : "☆";
  };
  syncFav();
  favBtn.addEventListener("click", () => {
    toggleFavorite(site.slug);
    syncFav();
  });
  thumb.appendChild(favBtn);
  card.appendChild(thumb);

  const body = document.createElement("div");
  body.className = "card__body";

  // 카드 = 요약 정보만: 브랜드명 · 지역/업종 · 대표 색 · 핵심 키워드 · 짧은 설명
  const title = document.createElement("h3");
  title.className = "card__title";
  const link = document.createElement("a");
  link.className = "card__link";
  link.href = brandHref(site);
  link.textContent = site.name;
  title.appendChild(link);

  const meta = document.createElement("p");
  meta.className = "card__meta";
  const region = document.createElement("span");
  region.textContent = REGION_LABEL[site.region] || site.region;
  const groupKey = industryGroupOf(site);
  const industry = document.createElement("button");
  industry.type = "button";
  industry.className = "card__industry";
  industry.textContent = site.industry;
  industry.setAttribute("aria-label", `${INDUSTRY_GROUPS[groupKey].label} 업종으로 거르기`);
  industry.addEventListener("click", () => quickFilter("industry", groupKey));
  meta.append(region, " · ", industry);

  const swatches = document.createElement("div");
  swatches.className = "card__swatches";
  swatches.setAttribute("aria-label", `대표 색 ${site.palette.slice(0, 5).map((c) => c.hex).join(", ")}`);
  swatches.setAttribute("role", "img");
  site.palette.slice(0, 5).forEach((c) => swatches.appendChild(createSwatch(c.hex)));

  // 핵심 키워드 2~4개: 스타일(누르면 스타일 필터), 스타일이 없으면 태그(누르면 검색)
  const tags = document.createElement("div");
  tags.className = "card__tags";
  const keywordItems = site.moods.length
    ? site.moods.slice(0, 4).map((m) => ({ label: MOOD_LABEL[m] || m, hint: "스타일로 거르기", onClick: () => quickFilter("style", m) }))
    : site.tags.slice(0, 3).map((t) => ({ label: t, hint: "검색하기", onClick: () => setQuery(t) }));
  keywordItems.forEach(({ label, hint, onClick }) => {
    const tag = document.createElement("button");
    tag.type = "button";
    tag.className = "tag";
    tag.textContent = label;
    tag.setAttribute("aria-label", `${label} ${hint}`);
    tag.addEventListener("click", onClick);
    tags.appendChild(tag);
  });

  const desc = document.createElement("p");
  desc.className = "card__desc";
  desc.textContent = site.description;
  desc.title = site.description;

  body.append(title, meta, swatches, tags, desc);
  card.appendChild(body);
  return card;
}

// ---------- 결과 그리기 ----------

// 결과가 없을 때 상황에 맞는 안내 (즐겨찾기 없음 / 검색 결과 없음 / 필터 결과 없음)
function renderEmptyState() {
  const titleEl = $("empty-title");
  const textEl = $("empty-text");
  const btn = $("empty-clear");
  if (state.favoritesOnly && favoriteCount() === 0) {
    titleEl.textContent = "아직 즐겨찾기한 레퍼런스가 없습니다.";
    textEl.textContent = "카드의 ☆를 눌러 다시 보고 싶은 브랜드를 저장해 두세요. 저장한 목록은 이 브라우저에 남습니다.";
    btn.textContent = "전체 레퍼런스 보기";
  } else if (state.query && activeFilterCount() === 0 && !state.favoritesOnly) {
    titleEl.textContent = `'${searchInputEl.value.trim()}'에 맞는 레퍼런스가 없습니다.`;
    textEl.textContent = "철자를 확인하거나 브랜드 이름, 업종(금융·패션), 스타일(minimal·bold) 같은 더 넓은 키워드로 검색해 보세요.";
    btn.textContent = "검색어 지우기";
  } else {
    titleEl.textContent = "조건에 맞는 레퍼런스가 없습니다.";
    textEl.textContent = "필터를 몇 개 해제하거나 더 넓은 키워드로 검색해 보세요.";
    btn.textContent = "모두 지우기";
  }
}

function renderCards() {
  if (loadState !== "ready") return;
  const filtered = allSites.filter((s) => matches(s)).sort(SORT_OPTIONS[state.sort].compare);
  const pageItems = filtered.slice(0, visibleCount);

  const frag = document.createDocumentFragment();
  pageItems.forEach((site, i) => {
    const card = createCard(site, i < 4);
    card.style.animationDelay = `${Math.min(i, 12) * 20}ms`;
    frag.appendChild(card);
  });
  cardGridEl.replaceChildren(frag);

  resultCountEl.textContent = hasAnyCondition()
    ? `레퍼런스 ${filtered.length}개 (전체 ${allSites.length}개 중)`
    : `레퍼런스 ${allSites.length}개`;
  filterApplyEl.textContent = `결과 ${filtered.length}개 보기`;
  emptyStateEl.hidden = filtered.length !== 0;
  if (!filtered.length) renderEmptyState();
  loadMoreWrapEl.hidden = filtered.length <= visibleCount;

  updateFilterPanel();
  renderActiveFilters();
}

// ---------- 이벤트 ----------

searchInputEl.addEventListener("input", (e) => {
  state.query = e.target.value.trim().toLowerCase();
  searchClearEl.hidden = !e.target.value;
  update();
});

searchClearEl.addEventListener("click", () => {
  setQuery("");
  searchInputEl.focus();
});

Object.entries(SORT_OPTIONS).forEach(([value, { label }]) => sortSelectEl.appendChild(new Option(label, value)));
sortSelectEl.addEventListener("change", (e) => {
  state.sort = e.target.value;
  update();
});

$("load-more-btn").addEventListener("click", () => {
  const firstNew = visibleCount;
  visibleCount += PAGE_SIZE;
  renderCards();
  // 키보드 사용자는 새로 나온 첫 카드로 이어서 이동
  const next = cardGridEl.children[firstNew];
  if (next) next.querySelector(".card__link").focus({ preventScroll: true });
});

$("empty-clear").addEventListener("click", () => {
  if (state.favoritesOnly && favoriteCount() === 0) setFavoritesOnly(false);
  else if (state.query && activeFilterCount() === 0 && !state.favoritesOnly) setQuery("");
  else clearAll();
});
$("filter-reset").addEventListener("click", clearAll);

// 헤더 즐겨찾기: 목록에서는 "즐겨찾기만 보기"를 켜고 끄고, 상세 화면에서는 목록으로 가서 켠다
favoritesToggleEl.addEventListener("click", () => {
  if (!detailViewEl.hidden) {
    state.favoritesOnly = true;
    syncFavoritesButton();
    navigateToList();
    return;
  }
  setFavoritesOnly(!state.favoritesOnly);
});

// 카드·상세 어디서 바꾸든 헤더 숫자와 "즐겨찾기만" 목록을 맞춘다
document.addEventListener("favorites-change", () => {
  syncFavoritesButton();
  if (state.favoritesOnly && !listViewEl.hidden) renderCards();
});

// 본문으로 건너뛰기: 주소(#)를 바꾸지 않고 본문으로 포커스만 이동
$("skip-link").addEventListener("click", (e) => {
  e.preventDefault();
  $("main").focus();
});

// ---------- 모바일 필터 시트 ----------

const mobileQuery = window.matchMedia("(max-width: 860px)");

function openFilterDrawer() {
  filterPanelEl.classList.add("is-open");
  filterBackdropEl.hidden = false;
  filterOpenEl.setAttribute("aria-expanded", "true");
  document.body.classList.add("no-scroll");
  $("filter-close").focus();
}

function closeFilterDrawer(returnFocus) {
  if (!filterPanelEl.classList.contains("is-open")) return;
  filterPanelEl.classList.remove("is-open");
  filterBackdropEl.hidden = true;
  filterOpenEl.setAttribute("aria-expanded", "false");
  document.body.classList.remove("no-scroll");
  if (returnFocus) filterOpenEl.focus();
}

filterOpenEl.addEventListener("click", openFilterDrawer);
$("filter-close").addEventListener("click", () => closeFilterDrawer(true));
filterApplyEl.addEventListener("click", () => closeFilterDrawer(true));
filterBackdropEl.addEventListener("click", () => closeFilterDrawer(true));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeFilterDrawer(true);
});
mobileQuery.addEventListener("change", (e) => {
  if (!e.matches) closeFilterDrawer(false);
});

// 좁은 화면에서는 검색창 안내 문구를 짧게 (잘려 보이지 않도록)
const narrowQuery = window.matchMedia("(max-width: 560px)");
function syncSearchPlaceholder() {
  searchInputEl.placeholder = narrowQuery.matches ? "브랜드·업종·스타일 검색" : "브랜드, 업종, 스타일로 검색 (예: minimal, 금융, dark)";
}
narrowQuery.addEventListener("change", syncSearchPlaceholder);
syncSearchPlaceholder();

// ---------- 맨 위로 이동 ----------

window.addEventListener(
  "scroll",
  () => {
    backToTopEl.hidden = window.scrollY < 600;
  },
  { passive: true }
);

backToTopEl.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  $("main").focus({ preventScroll: true });
});

// ---------- 주소(해시) 라우팅 ----------
//   #/ 또는 빈 주소  → 목록
//   #/brand/slug     → 상세 (예전 주소 #/site/slug도 받아 줌)
//   그 밖의 #/...     → 페이지를 찾을 수 없음

function parseRoute() {
  const hash = window.location.hash;
  if (!hash || hash === "#" || hash === "#/") return { view: "list" };
  const m = hash.match(/^#\/(?:brand|site)\/([^/?#]+)\/?$/);
  if (m) return { view: "detail", slug: decodeURIComponent(m[1]) };
  if (hash.startsWith("#/")) return { view: "notfound" };
  return { view: "list" }; // #main 같은 문서 안 이동
}

// 검색엔진·공유 미리보기용 제목과 설명
function setMeta(title, description) {
  document.title = title;
  const desc = description || SITE_INFO.description;
  document.querySelector('meta[name="description"]').setAttribute("content", desc);
  document.querySelector('meta[property="og:title"]').setAttribute("content", title);
  document.querySelector('meta[property="og:description"]').setAttribute("content", desc);
}

// 목록에서 상세로 왔다면 브라우저 뒤로가기와 같게(검색 조건·스크롤 유지), 아니면 목록 주소로 이동
let previousView = null;
let cameFromList = false; // 지금 상세 화면이 목록에서 넘어온 것인지
let listScrollY = 0;

function navigateToList() {
  if (cameFromList && window.history.length > 1) window.history.back();
  else window.location.hash = "/";
}

function breadcrumbSep() {
  const sep = document.createElement("span");
  sep.className = "breadcrumb__sep";
  sep.setAttribute("aria-hidden", "true");
  sep.textContent = "›";
  return sep;
}

// 상세·찾을 수 없음 화면 위의 "← 레퍼런스 목록" + 경로
function renderBreadcrumb(site) {
  detailBreadcrumbEl.innerHTML = "";
  const back = document.createElement("a");
  back.className = "breadcrumb__back";
  back.href = "#/";
  back.textContent = "← 레퍼런스 목록";
  back.addEventListener("click", (e) => {
    e.preventDefault();
    navigateToList();
  });
  detailBreadcrumbEl.appendChild(back);
  if (!site) return;
  const industry = document.createElement("span");
  industry.textContent = site.industry;
  const current = document.createElement("span");
  current.className = "breadcrumb__current";
  current.setAttribute("aria-current", "page");
  current.textContent = site.name;
  detailBreadcrumbEl.append(industry, breadcrumbSep(), current);
}

function showListView() {
  const fromOther = !detailViewEl.hidden;
  setMeta(`${SITE_INFO.name} | ${SITE_INFO.headline}`);
  listViewEl.hidden = false;
  detailViewEl.hidden = true;
  syncFavoritesButton();
  renderCards();
  if (fromOther) window.scrollTo({ top: listScrollY });
  previousView = "list";
}

function showDetailView(site, slug) {
  cameFromList = previousView === "list";
  if (!listViewEl.hidden) listScrollY = window.scrollY;
  closeFilterDrawer(false);
  listViewEl.hidden = true;
  detailViewEl.hidden = false;
  renderBreadcrumb(site);
  if (site) {
    setMeta(`${site.name} 디자인 분석 | ${SITE_INFO.name}`, `${site.name} 웹사이트의 컬러, 타이포그래피, 레이아웃, UI 특징. ${site.description}`);
    renderDetailPage(detailContentEl, site);
  } else {
    setMeta(`브랜드를 찾을 수 없음 | ${SITE_INFO.name}`);
    renderNotFound(detailContentEl, "brand", slug);
  }
  window.scrollTo({ top: 0 });
  $("main").focus({ preventScroll: true });
  previousView = "detail";
}

function showNotFoundView() {
  cameFromList = previousView === "list";
  if (!listViewEl.hidden) listScrollY = window.scrollY;
  listViewEl.hidden = true;
  detailViewEl.hidden = false;
  renderBreadcrumb(null);
  setMeta(`페이지를 찾을 수 없음 | ${SITE_INFO.name}`);
  renderNotFound(detailContentEl, "page");
  window.scrollTo({ top: 0 });
  previousView = "notfound";
}

async function route() {
  if (loadState !== "ready") return; // 불러온 뒤 다시 호출됨
  if (/^#\/site\//.test(window.location.hash)) {
    history.replaceState(null, "", window.location.pathname + window.location.search + window.location.hash.replace("#/site/", "#/brand/"));
  }
  const r = parseRoute();
  if (r.view === "list") return showListView();
  if (r.view === "notfound") return showNotFoundView();
  showDetailView(await getBrandBySlug(r.slug), r.slug);
}

// 상세 섹션 메뉴가 헤더 바로 아래에 붙도록 헤더 높이를 CSS 변수로 알려 준다
function syncHeaderHeight() {
  document.documentElement.style.setProperty("--header-h", `${$("site-header").offsetHeight}px`);
}
window.addEventListener("resize", syncHeaderHeight);
window.addEventListener("hashchange", route);

// ---------- 데이터 불러오기 상태 (불러오는 중 / 실패 / DB가 비어 있음 / 준비 완료) ----------

function renderSkeleton() {
  cardGridEl.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const card = document.createElement("div");
    card.className = "card card--skeleton";
    card.setAttribute("aria-hidden", "true");
    card.innerHTML =
      '<div class="card__thumb"></div><div class="card__body"><span class="sk sk--title"></span><span class="sk" style="width:40%"></span><span class="sk"></span><span class="sk sk--short"></span></div>';
    cardGridEl.appendChild(card);
  }
}

function renderLoadMessage(title, text, withRetry) {
  loadStateEl.innerHTML = "";
  const t = document.createElement("p");
  t.className = "empty-state__title";
  t.textContent = title;
  const p = document.createElement("p");
  p.className = "empty-state__text";
  p.textContent = text;
  loadStateEl.append(t, p);
  if (withRetry) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn--outline";
    btn.textContent = "다시 시도";
    btn.addEventListener("click", loadData);
    loadStateEl.appendChild(btn);
  }
}

function setLoadState(next) {
  loadState = next;
  const ready = next === "ready";
  filterPanelEl.hidden = !(ready || next === "loading");
  filterOpenEl.hidden = !ready;
  emptyStateEl.hidden = true;
  loadMoreWrapEl.hidden = true;
  loadStateEl.hidden = ready || next === "loading";
  if (!ready) {
    activeFiltersEl.innerHTML = "";
    cardGridEl.innerHTML = "";
    resultCountEl.textContent = "";
    dataModeEl.hidden = true;
  }
  if (next === "loading") {
    resultCountEl.textContent = "레퍼런스를 불러오는 중…";
    renderSkeleton();
    renderFilterSkeleton();
  } else if (next === "error") {
    // 내부 오류 내용은 콘솔에만 남기고(brand-service.js), 화면에는 안내만 보여 준다
    renderLoadMessage("레퍼런스를 불러오지 못했습니다.", "잠시 후 다시 시도해 주세요. 문제가 계속되면 네트워크 연결을 확인해 주세요.", true);
  } else if (next === "empty") {
    renderLoadMessage("아직 등록된 레퍼런스가 없습니다.", "브랜드 데이터가 추가되면 이곳에 표시됩니다.", false);
  }
}

// 상세 주소로 바로 들어왔을 때, 불러오는 동안 상세 자리에 안내를 보여 준다
function showDetailLoading() {
  listViewEl.hidden = true;
  detailViewEl.hidden = false;
  detailBreadcrumbEl.innerHTML = "";
  detailContentEl.innerHTML = '<p class="dp-loading" role="status">브랜드 정보를 불러오는 중…</p>';
}

async function loadData() {
  setLoadState("loading");
  if (parseRoute().view === "detail") showDetailLoading();
  let brands;
  try {
    brands = await getBrands();
  } catch (e) {
    setLoadState("error");
    listViewEl.hidden = false;
    detailViewEl.hidden = true;
    return;
  }
  allSites = brands.map(indexSite);
  if (!allSites.length) {
    setLoadState("empty");
    listViewEl.hidden = false;
    detailViewEl.hidden = true;
    return;
  }
  setLoadState("ready");
  dataModeEl.hidden = DATA_MODE !== "sample";
  renderFilterPanel();
  route();
}

(function init() {
  $("site-name").textContent = SITE_INFO.name;
  $("footer-name").textContent = SITE_INFO.name;
  $("hero-title").textContent = SITE_INFO.headline;
  $("site-tagline").textContent = SITE_INFO.tagline;
  syncHeaderHeight();
  syncFavoritesButton();
  readUrl();
  loadData();
})();
