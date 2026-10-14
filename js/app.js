// 필터 옵션 정의 (label = 화면 표시용, value = 데이터 매칭용)
const FILTER_GROUPS = [
  {
    key: "theme",
    label: "테마",
    options: [
      { value: "light", label: "라이트" },
      { value: "dark", label: "다크" }
    ]
  },
  {
    key: "region",
    label: "지역",
    options: [
      { value: "kr", label: "한국" },
      { value: "asia", label: "아시아" },
      { value: "europe", label: "유럽" },
      { value: "us", label: "미국" }
    ]
  },
  {
    key: "colorTone",
    label: "컬러톤",
    options: [
      { value: "warm", label: "웜톤" },
      { value: "cool", label: "쿨톤" },
      { value: "grayish", label: "그레이시" },
      { value: "multi", label: "멀티" }
    ]
  },
  {
    key: "font",
    label: "폰트",
    options: [
      { value: "serif", label: "세리프" },
      { value: "sans", label: "산세리프" },
      { value: "display", label: "디스플레이" },
      { value: "custom", label: "커스텀" }
    ]
  }
];

const FONT_CATEGORY_LABEL = { serif: "세리프", sans: "산세리프", display: "디스플레이", custom: "커스텀" };
const THEME_LABEL = { light: "라이트", dark: "다크" };
const REGION_LABEL = { kr: "한국", asia: "아시아", europe: "유럽", us: "미국" };
const COLOR_TONE_LABEL = { warm: "웜톤", cool: "쿨톤", grayish: "그레이시", multi: "멀티" };

// key -> Set(선택된 값들). 그룹 내에서는 OR, 그룹 간에는 AND.
const activeFilters = {};
FILTER_GROUPS.forEach((g) => (activeFilters[g.key] = new Set()));
let searchTerm = "";
let favoritesOnly = false;
let sortBy = "default";
let allSites = [];

const PAGE_SIZE = 12;
let visibleCount = PAGE_SIZE;

const filterBarEl = document.getElementById("filter-bar");
const filterBackdropEl = document.getElementById("filter-backdrop");
const menuToggleEl = document.getElementById("menu-toggle");
const toolbarEl = document.getElementById("toolbar");
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

function fieldValue(site, key) {
  if (key === "font") return site.font.category;
  return site[key];
}

function renderFilterBar() {
  filterBarEl.innerHTML = "";

  const groups = [
    ...FILTER_GROUPS,
    {
      key: "industry",
      label: "분야",
      options: Array.from(new Set(allSites.map((s) => s.industry))).map((v) => ({ value: v, label: v }))
    }
  ];
  if (!activeFilters.industry) activeFilters.industry = new Set();

  groups.forEach((group) => {
    const groupEl = document.createElement("div");
    groupEl.className = "filter-group";

    const titleEl = document.createElement("span");
    titleEl.className = "filter-group__title";
    titleEl.textContent = group.label;
    groupEl.appendChild(titleEl);

    const chipsEl = document.createElement("div");
    chipsEl.className = "filter-group__chips";

    group.options.forEach((opt) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip" + (activeFilters[group.key].has(opt.value) ? " chip--active" : "");
      chip.textContent = opt.label;
      chip.dataset.group = group.key;
      chip.dataset.value = opt.value;
      chip.addEventListener("click", () => toggleFilter(group.key, opt.value, chip));
      chipsEl.appendChild(chip);
    });

    groupEl.appendChild(chipsEl);
    filterBarEl.appendChild(groupEl);
  });
}

function toggleFilter(groupKey, value, chipEl) {
  const set = activeFilters[groupKey];
  if (set.has(value)) {
    set.delete(value);
    chipEl.classList.remove("chip--active");
  } else {
    set.add(value);
    chipEl.classList.add("chip--active");
  }
  visibleCount = PAGE_SIZE;
  renderCards();
}

// 카드에서 industry 태그를 클릭했을 때: 해당 필터 그룹에 값을 추가하고 목록 맨 위로 스크롤
function quickFilterByIndustry(value) {
  if (!activeFilters.industry) activeFilters.industry = new Set();
  activeFilters.industry.add(value);
  visibleCount = PAGE_SIZE;
  renderFilterBar();
  renderCards();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 카드에서 자유 태그를 클릭했을 때: 검색어로 반영 (전용 필터 그룹이 없는 태그이므로 검색으로 대체)
function quickFilterByTag(tag) {
  searchInputEl.value = tag;
  searchTerm = tag.toLowerCase();
  visibleCount = PAGE_SIZE;
  renderCards();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function matchesFilters(site) {
  for (const key of Object.keys(activeFilters)) {
    const selected = activeFilters[key];
    if (selected.size === 0) continue;
    if (!selected.has(fieldValue(site, key))) return false;
  }
  if (favoritesOnly && !isFavorite(site.id)) return false;
  if (searchTerm) {
    const haystack = (site.name + " " + site.tags.join(" ") + " " + site.industry).toLowerCase();
    if (!haystack.includes(searchTerm)) return false;
  }
  return true;
}

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
    if (favoritesOnly) renderCards();
  });
  thumb.appendChild(favBtn);

  card.appendChild(thumb);

  const body = document.createElement("div");
  body.className = "card__body";

  const titleRow = document.createElement("div");
  titleRow.className = "card__title-row";
  const title = document.createElement("h3");
  title.className = "card__title";
  title.textContent = site.name;
  const region = document.createElement("span");
  region.className = "card__region";
  region.textContent = REGION_LABEL[site.region];
  titleRow.appendChild(title);
  titleRow.appendChild(region);
  body.appendChild(titleRow);

  const swatches = document.createElement("div");
  swatches.className = "card__swatches";
  site.mainColors.forEach((hex) => swatches.appendChild(createSwatch(hex)));
  body.appendChild(swatches);

  const fontLine = document.createElement("p");
  fontLine.className = "card__font";
  fontLine.textContent = `${site.font.name} · ${FONT_CATEGORY_LABEL[site.font.category]}`;
  body.appendChild(fontLine);

  const desc = document.createElement("p");
  desc.className = "card__desc";
  desc.textContent = site.description;
  body.appendChild(desc);

  const tags = document.createElement("div");
  tags.className = "card__tags";
  const industryTag = document.createElement("button");
  industryTag.type = "button";
  industryTag.className = "tag";
  industryTag.textContent = `#${site.industry}`;
  industryTag.addEventListener("click", (e) => {
    e.stopPropagation();
    quickFilterByIndustry(site.industry);
  });
  tags.appendChild(industryTag);
  site.tags.forEach((t) => {
    const tag = document.createElement("button");
    tag.type = "button";
    tag.className = "tag";
    tag.textContent = `#${t}`;
    tag.addEventListener("click", (e) => {
      e.stopPropagation();
      quickFilterByTag(t);
    });
    tags.appendChild(tag);
  });
  body.appendChild(tags);

  card.appendChild(body);

  card.addEventListener("click", () => {
    window.location.hash = `/site/${encodeURIComponent(site.id)}`;
  });

  return card;
}

function sortSites(list) {
  const arr = [...list];
  if (sortBy === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "region") arr.sort((a, b) => (a.region || "").localeCompare(b.region || ""));
  return arr;
}

function renderCards() {
  const filtered = sortSites(allSites.filter(matchesFilters));
  const pageItems = filtered.slice(0, visibleCount);

  cardGridEl.innerHTML = "";
  pageItems.forEach((site, i) => {
    const card = createCard(site);
    card.style.animationDelay = `${Math.min(i, 12) * 25}ms`;
    cardGridEl.appendChild(card);
  });

  resultCountEl.textContent = `${filtered.length}개의 사이트`;
  emptyStateEl.hidden = filtered.length !== 0;
  loadMoreWrapEl.hidden = filtered.length <= visibleCount;
}

searchInputEl.addEventListener("input", (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  visibleCount = PAGE_SIZE;
  renderCards();
});

sortSelectEl.addEventListener("change", (e) => {
  sortBy = e.target.value;
  renderCards();
});

loadMoreBtnEl.addEventListener("click", () => {
  visibleCount += PAGE_SIZE;
  renderCards();
});

favoritesToggleEl.addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  favoritesToggleEl.classList.toggle("chip--active", favoritesOnly);
  visibleCount = PAGE_SIZE;
  renderCards();
});

// ---------- 모바일 필터 드로어 ----------

function openFilterDrawer() {
  filterBarEl.hidden = false;
  filterBackdropEl.hidden = false;
  menuToggleEl.setAttribute("aria-expanded", "true");
}

function closeFilterDrawer() {
  filterBarEl.hidden = true;
  filterBackdropEl.hidden = true;
  menuToggleEl.setAttribute("aria-expanded", "false");
}

menuToggleEl.addEventListener("click", () => {
  if (filterBarEl.hidden) openFilterDrawer();
  else closeFilterDrawer();
});

filterBackdropEl.addEventListener("click", closeFilterDrawer);

// ---------- 맨 위로 이동 ----------

window.addEventListener("scroll", () => {
  backToTopEl.hidden = window.scrollY < 400;
});

backToTopEl.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ---------- 상세 보기 (해시 라우팅: 상단 헤더/필터 구조는 그대로 두고 내용만 전환) ----------

function getRouteSiteId() {
  const match = window.location.hash.match(/^#\/site\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function renderMetaChip(label) {
  const chip = document.createElement("span");
  chip.className = "chip chip--static";
  chip.textContent = label;
  return chip;
}

function renderDetailContent(site) {
  detailContentEl.innerHTML = "";

  const hero = document.createElement("div");
  hero.className = "detail-hero";
  hero.style.background = `linear-gradient(135deg, ${site.mainColors.join(", ")})`;
  const heroLabel = document.createElement("span");
  heroLabel.className = "detail-hero__label";
  heroLabel.textContent = site.name.slice(0, 2).toUpperCase();
  hero.appendChild(heroLabel);

  const titleRow = document.createElement("div");
  titleRow.className = "detail-title-row";
  const title = document.createElement("h1");
  title.className = "detail-title";
  title.textContent = site.name;
  titleRow.appendChild(title);
  const themeDisplay = document.createElement("div");
  themeDisplay.className = "detail-theme-display";
  themeDisplay.innerHTML = `
    <span class="theme-pill ${site.theme === "light" ? "theme-pill--active" : ""}">라이트</span>
    <span class="theme-pill ${site.theme === "dark" ? "theme-pill--active" : ""}">다크</span>
  `;
  titleRow.appendChild(themeDisplay);

  const desc = document.createElement("p");
  desc.className = "detail-desc";
  desc.textContent = site.description;

  const chipRow = document.createElement("div");
  chipRow.className = "detail-chip-row";
  [
    REGION_LABEL[site.region],
    COLOR_TONE_LABEL[site.colorTone],
    FONT_CATEGORY_LABEL[site.font.category],
    site.industry,
    ...site.tags
  ].forEach((label) => chipRow.appendChild(renderMetaChip(label)));

  const actionRow = document.createElement("div");
  actionRow.className = "detail-action-row";

  const favBtn = document.createElement("button");
  favBtn.type = "button";
  favBtn.className = "btn btn--outline";
  const setFavLabel = () => {
    favBtn.textContent = isFavorite(site.id) ? "★ 즐겨찾기 해제" : "☆ 즐겨찾기";
  };
  setFavLabel();
  favBtn.addEventListener("click", () => {
    toggleFavorite(site.id);
    setFavLabel();
  });
  actionRow.appendChild(favBtn);

  const downloadBtn = document.createElement("button");
  downloadBtn.type = "button";
  downloadBtn.className = "btn btn--outline";
  downloadBtn.textContent = "⬇ 스타일가이드 다운로드";
  downloadBtn.disabled = true;
  downloadBtn.title = "준비 중입니다";
  actionRow.appendChild(downloadBtn);

  const visitLink = document.createElement("a");
  visitLink.className = "btn btn--primary";
  visitLink.href = site.url;
  visitLink.target = "_blank";
  visitLink.rel = "noopener";
  visitLink.textContent = "사이트 바로가기 ↗";
  actionRow.appendChild(visitLink);

  const paletteSection = document.createElement("section");
  paletteSection.className = "detail-section";
  paletteSection.innerHTML = `<h2 class="detail-section__title">메인 컬러</h2>`;
  const paletteRow = document.createElement("div");
  paletteRow.className = "detail-palette-row";
  site.mainColors.forEach((hex) => {
    const item = document.createElement("div");
    item.className = "palette-item";
    item.innerHTML = `<span class="palette-item__swatch" style="background:${hex}"></span><span class="palette-item__hex">${hex}</span>`;
    paletteRow.appendChild(item);
  });
  paletteSection.appendChild(paletteRow);

  const fontSection = document.createElement("section");
  fontSection.className = "detail-section";
  fontSection.innerHTML = `
    <h2 class="detail-section__title">폰트</h2>
    <p class="detail-section__body">${site.font.name} · ${FONT_CATEGORY_LABEL[site.font.category]}</p>
  `;

  const card = document.createElement("div");
  card.className = "detail-card";
  card.appendChild(hero);
  card.appendChild(titleRow);
  card.appendChild(desc);
  card.appendChild(chipRow);
  card.appendChild(actionRow);
  card.appendChild(paletteSection);
  card.appendChild(fontSection);

  detailContentEl.appendChild(card);
}

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

  const industry = document.createElement("span");
  industry.className = "breadcrumb__mid";
  industry.textContent = site.industry;

  const current = document.createElement("span");
  current.className = "breadcrumb__current";
  current.textContent = site.name;

  detailBreadcrumbEl.append(homeLink, makeSep(), industry, makeSep(), current);
}

function showListView() {
  document.title = "국내/외 유명 사이트 디자인 가이드";
  filterBarEl.hidden = window.innerWidth <= 860;
  filterBackdropEl.hidden = true;
  toolbarEl.hidden = false;
  detailViewEl.hidden = true;
  cardGridEl.hidden = false;
  renderCards();
}

function showDetailView(site) {
  closeFilterDrawer();
  filterBarEl.hidden = true;
  toolbarEl.hidden = true;
  cardGridEl.hidden = true;
  emptyStateEl.hidden = true;
  loadMoreWrapEl.hidden = true;
  detailViewEl.hidden = false;
  document.title = `${site.name} · 국내/외 유명 사이트 디자인 가이드`;
  renderBreadcrumb(site);
  renderDetailContent(site);
  window.scrollTo({ top: 0 });
}

function route() {
  const id = getRouteSiteId();
  const site = id ? allSites.find((s) => s.id === id) : null;
  if (site) showDetailView(site);
  else showListView();
}

window.addEventListener("hashchange", route);

(async function init() {
  allSites = await loadSites();
  renderFilterBar();
  route();
})();
