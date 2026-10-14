// 브랜드 상세 분석 화면
// 모든 브랜드가 이 템플릿 하나를 쓴다. 데이터에 있는 항목만 그리고,
// 내용이 없는 섹션은 숨긴 뒤 맨 아래 "아직 분석되지 않은 항목"으로 알려 준다.

// ---------- 작은 도우미 ----------

function h(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

// 값이 있는 노드만 붙인다. 붙일 게 하나도 없으면 null.
function group(className, ...children) {
  const nodes = children.flat().filter(Boolean);
  if (!nodes.length) return null;
  const wrap = h("div", className);
  wrap.append(...nodes);
  return wrap;
}

function chipList(labels, variant) {
  const items = labels.filter(Boolean);
  if (!items.length) return null;
  const row = h("div", "dp-chips" + (variant ? ` dp-chips--${variant}` : ""));
  items.forEach((l) => row.appendChild(h("span", "dp-chip", l)));
  return row;
}

function bulletList(items, className = "dp-list") {
  if (!items || !items.length) return null;
  const ul = h("ul", className);
  items.forEach((t) => ul.appendChild(h("li", null, t)));
  return ul;
}

function paragraph(text, className = "dp-text") {
  return text ? h("p", className, text) : null;
}

// [이름, 값] 목록 → 이름/값 표. 값이 비어 있으면 그 줄은 건너뛴다.
function propertyTable(rows) {
  const filled = rows.filter(([, v]) => v);
  if (!filled.length) return null;
  const dl = h("dl", "dp-props");
  filled.forEach(([k, v]) => dl.append(h("dt", null, k), h("dd", null, v)));
  return dl;
}

function labelOf(dict, key) {
  return key ? dict[key] || key : "";
}

function externalLink(url, label, className) {
  const a = h("a", className, label);
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.appendChild(h("span", "dp-ext", " ↗"));
  a.setAttribute("aria-label", `${label} (새 창에서 열림)`);
  return a;
}

// 배경색에 맞춰 읽기 좋은 글자색(검정/흰색)을 고른다
function readableTextOn(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return "#111";
  const n = parseInt(m[1], 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? "#111" : "#fff";
}

function primaryColor(site) {
  const p = site.palette.find((c) => c.group === "primary") || site.palette[0];
  return p ? p.hex : "#333";
}

// ---------- 섹션별 내용 (값이 없으면 null을 돌려줘 섹션째 숨김) ----------

// Design DNA: 스타일·키워드·느낌 + 성향 카드
function dnaContent(site) {
  const { layout, ui } = site;
  const tiles = [
    { label: "테마", value: THEME_LABEL[site.theme], visual: "theme", key: site.theme },
    { label: "콘텐츠 밀도", value: labelOf(DENSITY_LABEL, layout.density), visual: "density", key: layout.density },
    { label: "여백", value: labelOf(WHITESPACE_LABEL, layout.whitespace) },
    { label: "모서리", value: labelOf(RADIUS_LABEL, ui.radius), visual: "radius", key: ui.radius },
    { label: "그림자", value: labelOf(SHADOW_LABEL, ui.shadow), visual: "shadow", key: ui.shadow },
    { label: "깊이감", value: labelOf(DEPTH_LABEL, ui.depth) },
    { label: "이미지 스타일", value: (ui.imageStyle || []).map((s) => labelOf(IMAGE_STYLE_LABEL, s)).join(" · ") }
  ].filter((t) => t.value);

  const grid = h("div", "dp-tiles");
  tiles.forEach((t) => {
    const tile = h("div", "dp-tile");
    if (t.visual) tile.appendChild(h("span", `dp-mini dp-mini--${t.visual} is-${t.key}`));
    tile.append(h("span", "dp-tile__label", t.label), h("span", "dp-tile__value", t.value));
    grid.appendChild(tile);
  });

  const rows = [
    ["스타일", chipList(site.moods.map((m) => labelOf(MOOD_LABEL, m)), "strong")],
    ["디자인 키워드", chipList(site.keywords.length ? site.keywords : site.tags)],
    ["느낌", chipList(site.feel)]
  ]
    .filter(([, node]) => node)
    .map(([label, node]) => group("dp-row", h("span", "dp-row__label", label), node));

  return group("dp-stack", rows, tiles.length ? grid : null);
}

// 핵심 특징: 01, 02 … 번호 카드
function characteristicsContent(site) {
  if (!site.characteristics.length) return null;
  const grid = h("ol", "dp-points");
  site.characteristics.forEach(({ title, text }, i) => {
    const li = h("li", "dp-point");
    li.append(h("span", "dp-point__num", String(i + 1).padStart(2, "0")), h("strong", "dp-point__title", title));
    if (text) li.appendChild(h("p", "dp-point__text", text));
    grid.appendChild(li);
  });
  return grid;
}

// 컬러 칩 하나: 미리보기 + HEX(누르면 복사) + 역할
function colorTile({ hex, role }) {
  const btn = h("button", "dp-color");
  btn.type = "button";
  btn.title = "눌러서 HEX 코드 복사";
  btn.setAttribute("aria-label", `${hex}${role ? ` (${role})` : ""} 복사`);
  const swatch = h("span", "dp-color__swatch");
  swatch.style.background = hex;
  const hexEl = h("span", "dp-color__hex", hex.toUpperCase());
  btn.append(swatch, hexEl);
  if (role) btn.appendChild(h("span", "dp-color__role", role));
  btn.addEventListener("click", () => {
    copyText(hex.toUpperCase()).then((ok) => {
      hexEl.textContent = ok ? "복사됨 ✓" : "복사 실패";
      setTimeout(() => (hexEl.textContent = hex.toUpperCase()), 1200);
    });
  });
  return btn;
}

// 클립보드 API를 먼저 쓰고, 거절되거나 1초 안에 응답이 없으면 대체 방법으로 복사
function copyText(text) {
  if (!navigator.clipboard || !window.isSecureContext) return Promise.resolve(copyTextFallback(text));
  const timeout = new Promise((resolve) => setTimeout(() => resolve(false), 1000));
  return Promise.race([navigator.clipboard.writeText(text).then(() => true, () => false), timeout]).then(
    (ok) => ok || copyTextFallback(text)
  );
}

function copyTextFallback(text) {
  const ta = h("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (e) {
    ok = false;
  }
  ta.remove();
  return ok;
}

function colorsContent(site) {
  if (!site.palette.length) return null;
  const grouped = site.palette.some((c) => c.group);
  const blocks = [];
  if (grouped) {
    ["primary", "secondary", "neutral", ""].forEach((key) => {
      const items = site.palette.filter((c) => (c.group || "") === key);
      if (!items.length) return;
      const wrap = h("div", "dp-color-group");
      wrap.appendChild(h("h3", "dp-subhead", key ? PALETTE_GROUP_LABEL[key] || key : "기타"));
      const row = h("div", "dp-colors");
      items.forEach((c) => row.appendChild(colorTile(c)));
      wrap.appendChild(row);
      blocks.push(wrap);
    });
  } else {
    const row = h("div", "dp-colors");
    site.palette.forEach((c) => row.appendChild(colorTile(c)));
    blocks.push(row);
  }
  return group(
    "dp-stack",
    blocks,
    paragraph(site.colorNote),
    propertyTable([
      ["화면 톤", THEME_LABEL[site.theme]],
      ["컬러 성향", labelOf(COLOR_TONE_LABEL, site.colorTone)]
    ]),
    h("p", "dp-caption", "색상을 누르면 HEX 코드가 복사됩니다.")
  );
}

// 타이포 미리보기: 브랜드 전용 서체 대신 분류에 맞는 시스템 서체로 성향만 보여 준다
const PREVIEW_FONT_STACK = {
  serif: 'Georgia, "Times New Roman", "Nanum Myeongjo", serif',
  sans: 'system-ui, -apple-system, "Segoe UI", "Pretendard", "Apple SD Gothic Neo", sans-serif',
  display: 'system-ui, -apple-system, "Segoe UI", "Pretendard", sans-serif',
  custom: 'system-ui, -apple-system, "Segoe UI", "Pretendard", "Apple SD Gothic Neo", sans-serif'
};

function typePreview(site) {
  const sample = site.typography.sample;
  if (!sample) return null;
  const box = h("div", "dp-type-preview");
  box.style.fontFamily = PREVIEW_FONT_STACK[site.font.category] || PREVIEW_FONT_STACK.sans;

  const aa = h("span", "dp-type-preview__aa", "Aa");
  const head = h("p", "dp-type-preview__heading", sample.heading);
  head.style.fontWeight = sample.weight || 700;
  if (sample.tracking) head.style.letterSpacing = sample.tracking;
  if (sample.upper) head.style.textTransform = "uppercase";
  if (sample.condensed) {
    head.style.fontStretch = "condensed";
    head.style.fontFamily = '"Arial Narrow", "Roboto Condensed", ' + box.style.fontFamily;
    head.style.lineHeight = "0.95";
  }
  aa.style.fontWeight = head.style.fontWeight;
  const body = h("p", "dp-type-preview__body", sample.body);

  const text = group("dp-type-preview__text", head, body);
  box.append(aa, text);
  return group(
    "dp-stack dp-stack--tight",
    box,
    h("p", "dp-caption", "브랜드 전용 서체가 아닌 시스템 대체 서체로 굵기·자간 성향만 표현한 예시입니다.")
  );
}

function typographyContent(site) {
  const t = site.typography;
  return group(
    "dp-stack",
    typePreview(site),
    propertyTable([
      ["대표 서체", t.family || site.font.name],
      ["분류", labelOf(FONT_CATEGORY_LABEL, site.font.category)],
      ["제목", t.heading],
      ["본문", t.body],
      ["굵기", t.weight]
    ]),
    paragraph(t.traits)
  );
}

// 레이아웃 원리를 보여 주는 추상 도식 (실제 화면을 옮긴 것이 아님)
function wireframe(layout) {
  if (!layout.blocks || !layout.blocks.length) return null;
  const frame = h("div", `dp-wire dp-wire--${layout.width || "contained"} dp-wire--${layout.alignment || "left"}`);
  frame.setAttribute("role", "img");
  frame.setAttribute(
    "aria-label",
    "레이아웃 도식: " + layout.blocks.map((b) => labelOf(LAYOUT_BLOCK_LABEL, b)).join(" → ")
  );
  layout.blocks.forEach((type) => {
    const block = h("div", `dp-wire__block dp-wire__block--${type}`);
    const cols = { "grid-2": 2, "grid-3": 3, "grid-4": 4, "row-scroll": 5, split: 2 }[type];
    if (cols) {
      for (let i = 0; i < cols; i++) block.appendChild(h("span", "dp-wire__cell"));
    }
    block.appendChild(h("span", "dp-wire__label", labelOf(LAYOUT_BLOCK_LABEL, type)));
    frame.appendChild(block);
  });
  return group(
    "dp-stack dp-stack--tight",
    frame,
    h("p", "dp-caption", "레이아웃 원리를 설명하는 추상 도식이며, 실제 화면을 옮긴 것이 아닙니다.")
  );
}

function layoutContent(site) {
  const l = site.layout;
  const props = propertyTable([
    ["레이아웃 성향", labelOf(LAYOUT_TYPE_LABEL, l.type)],
    ["콘텐츠 폭", labelOf(WIDTH_LABEL, l.width)],
    ["정렬", labelOf(ALIGN_LABEL, l.alignment)],
    ["여백", labelOf(WHITESPACE_LABEL, l.whitespace)],
    ["콘텐츠 밀도", labelOf(DENSITY_LABEL, l.density)],
    ["그리드", l.grid]
  ]);
  const wire = wireframe(l);
  if (!props && !wire) return null;
  return group("dp-split", wire, props);
}

// UI 요소 카드: 버튼은 데이터(모양·스타일)로 작은 견본을 그린다
function buttonSample(site, btn) {
  const sample = h("span", "dp-btn-sample", "버튼 예시");
  const color = primaryColor(site);
  const radius = { pill: "999px", rounded: "10px", sharp: "0" }[btn.shape] || "8px";
  sample.style.borderRadius = radius;
  if (btn.style === "outline") {
    sample.style.border = `1.5px solid ${color}`;
    sample.style.color = "inherit";
  } else if (btn.style === "text") {
    sample.style.color = "inherit";
    sample.style.textDecoration = "underline";
    sample.style.padding = "0";
  } else {
    sample.style.background = color;
    sample.style.color = readableTextOn(color);
  }
  sample.setAttribute("aria-hidden", "true");
  return sample;
}

const UI_COMPONENTS = [
  {
    key: "buttons",
    title: "버튼",
    meta: (c) => [labelOf(BUTTON_SHAPE_LABEL, c.shape), labelOf(BUTTON_STYLE_LABEL, c.style)].filter(Boolean).join(" · "),
    sample: (site, c) => (c.shape || c.style ? buttonSample(site, c) : null)
  },
  { key: "cards", title: "카드" },
  { key: "inputs", title: "입력창" },
  { key: "navigation", title: "내비게이션", meta: (c) => labelOf(NAV_TYPE_LABEL, c.type) }
];

function uiContent(site) {
  const ui = site.ui;
  const comps = ui.components || {};
  const cards = UI_COMPONENTS.filter((def) => comps[def.key]).map((def) => {
    const c = comps[def.key];
    const card = h("div", "dp-ui-card");
    card.appendChild(h("h3", "dp-ui-card__title", def.title));
    const meta = def.meta ? def.meta(c) : "";
    if (meta) card.appendChild(h("p", "dp-ui-card__meta", meta));
    const sample = def.sample ? def.sample(site, c) : null;
    if (sample) card.appendChild(sample);
    if (c.note) card.appendChild(h("p", "dp-ui-card__note", c.note));
    return card;
  });
  const props = propertyTable([
    ["모서리", labelOf(RADIUS_LABEL, ui.radius)],
    ["그림자", labelOf(SHADOW_LABEL, ui.shadow)],
    ["깊이감", labelOf(DEPTH_LABEL, ui.depth)]
  ]);
  if (!cards.length && !props) return null;
  return group("dp-stack", props, cards.length ? group("dp-ui-grid", cards) : null);
}

function visualContent(site) {
  const v = site.visual;
  const styles = (site.ui.imageStyle || []).map((s) => labelOf(IMAGE_STYLE_LABEL, s));
  const notes = bulletList(v.notes);
  const props = propertyTable([
    ["아이콘", v.iconography],
    ["그래픽 요소", v.graphics]
  ]);
  // 이미지 스타일만 있고 다른 설명이 없으면 DNA에서 이미 보여 주므로 섹션을 만들지 않는다
  if (!notes && !props) return null;
  return group(
    "dp-stack",
    styles.length ? group("dp-row", h("span", "dp-row__label", "이미지 스타일"), chipList(styles, "strong")) : null,
    notes ? group("dp-row dp-row--block", h("span", "dp-row__label", "특징"), notes) : null,
    props
  );
}

// Best For / Things to Avoid: 나란히 두 칸
function usageContent(site) {
  const best = site.bestFor.length
    ? group("dp-usage dp-usage--best", h("h3", "dp-usage__title", "✓ 이런 프로젝트에 참고하기 좋아요"), bulletList(site.bestFor, "dp-usage__list"))
    : null;
  const avoid = site.avoid.length
    ? group("dp-usage dp-usage--avoid", h("h3", "dp-usage__title", "! 그대로 따라 할 때 주의할 점"), bulletList(site.avoid, "dp-usage__list"))
    : null;
  return group("dp-usage-grid", best, avoid);
}

function sourcesContent(site) {
  const ul = h("ul", "dp-sources");
  site.sources.forEach((s) => {
    const li = h("li", "dp-source");
    li.appendChild(h("span", "dp-source__type", labelOf(SOURCE_TYPE_LABEL, s.type) || "출처"));
    li.appendChild(externalLink(s.url, s.label || s.url, "dp-source__link"));
    if (s.note) li.appendChild(h("span", "dp-source__note", s.note));
    ul.appendChild(li);
  });
  return group(
    "dp-stack dp-stack--tight",
    ul,
    h(
      "p",
      "dp-caption",
      [site.reviewStatus === "reviewed" ? "검수 완료된 분석" : "1차 분석 (검수 전)", site.updatedAt && `최종 수정 ${site.updatedAt}`]
        .filter(Boolean)
        .join(" · ")
    )
  );
}

// ---------- 섹션 목록 (순서 = 화면 순서 = 섹션 이동 메뉴 순서) ----------

// tier: 화면에서의 중요도. primary(크게) > secondary(작게) > usage(배경 면으로 구분) > support(출처, 가장 작게)
const DETAIL_SECTIONS = [
  { id: "dna", nav: "DNA", title: "Design DNA", sub: "디자인 성향 한눈에 보기", tier: "primary", render: dnaContent },
  { id: "points", nav: "핵심", title: "Key Characteristics", sub: "이 디자인의 핵심", tier: "primary", render: characteristicsContent },
  { id: "colors", nav: "컬러", title: "Color System", sub: "컬러", tier: "primary", render: colorsContent },
  { id: "type", nav: "타이포", title: "Typography", sub: "타이포그래피", tier: "primary", render: typographyContent },
  { id: "layout", nav: "레이아웃", title: "Layout & Spacing", sub: "레이아웃과 여백", tier: "secondary", render: layoutContent },
  { id: "ui", nav: "UI", title: "UI Style", sub: "UI 요소", tier: "secondary", render: uiContent },
  { id: "visual", nav: "비주얼", title: "Visual Direction", sub: "이미지와 그래픽", tier: "secondary", render: visualContent },
  { id: "usage", nav: "활용", title: "Best For · Things to Avoid", sub: "활용과 주의점", tier: "usage", render: usageContent },
  { id: "sources", nav: "출처", title: "Sources", sub: "출처", tier: "support", render: sourcesContent }
];

// ---------- 상단 개요 ----------

function overview(site) {
  const top = h("header", "dp-overview");
  top.id = "dp-overview";

  // 대표 색을 비율대로 늘어놓은 띠 (장식이 아니라 팔레트 요약)
  const strip = h("div", "dp-strip");
  strip.setAttribute("aria-hidden", "true");
  site.palette.slice(0, 7).forEach((c) => {
    const seg = h("span");
    seg.style.background = c.hex;
    strip.appendChild(seg);
  });

  const groupLabel = INDUSTRY_GROUPS[industryGroupOf(site)];
  const eyebrow = h(
    "p",
    "dp-eyebrow",
    [REGION_LABEL[site.region], site.industry, groupLabel && groupLabel.label !== site.industry ? groupLabel.label : null]
      .filter(Boolean)
      .join(" · ")
  );

  const titleRow = h("div", "dp-title-row");
  titleRow.append(h("h1", "dp-title", site.name), h("span", `dp-theme-badge is-${site.theme}`, `${THEME_LABEL[site.theme]} 테마`));

  const keywords = chipList(
    [...site.moods.map((m) => labelOf(MOOD_LABEL, m)), ...site.keywords.slice(0, 3)],
    "strong"
  );

  const actions = h("div", "dp-actions");
  actions.appendChild(externalLink(site.url, "공식 사이트 보기", "btn btn--primary"));
  const favBtn = h("button", "btn btn--outline");
  favBtn.type = "button";
  const setFav = () => {
    const on = isFavorite(site.id);
    favBtn.textContent = on ? "★ 즐겨찾기 해제" : "☆ 즐겨찾기";
    favBtn.setAttribute("aria-pressed", String(on));
  };
  setFav();
  favBtn.addEventListener("click", () => {
    toggleFavorite(site.id);
    setFav();
  });
  actions.appendChild(favBtn);
  // 공유 링크: brand/<slug>/ 페이지 주소 (링크 미리보기에 브랜드 정보가 나오는 주소)
  const shareBtn = h("button", "btn btn--outline", "링크 복사");
  shareBtn.type = "button";
  shareBtn.addEventListener("click", () => {
    const url = new URL(`brand/${encodeURIComponent(site.slug)}/`, window.location.href.split("#")[0]).href;
    copyText(url).then((ok) => {
      shareBtn.textContent = ok ? "링크 복사됨 ✓" : "복사 실패";
      setTimeout(() => (shareBtn.textContent = "링크 복사"), 1500);
    });
  });
  actions.appendChild(shareBtn);  const downloadBtn = h("button", "btn btn--outline", "⬇ 스타일가이드 다운로드");
  downloadBtn.type = "button";
  downloadBtn.disabled = true;
  downloadBtn.title = "준비 중입니다";
  actions.appendChild(downloadBtn);

  // 공식 사이트 첫 화면 캡처 (있을 때만)
  let shot = null;
  if (site.previewImage) {
    shot = h("figure", "dp-shot");
    const img = h("img");
    img.src = site.previewImage;
    img.alt = `${site.name} 공식 웹사이트 첫 화면`;
    img.width = 960;
    img.height = 600;
    img.decoding = "async";
    img.addEventListener("error", () => shot.remove());
    const cap = h("figcaption", "dp-caption", `공식 사이트 첫 화면 캡처${site.previewCapturedOn ? ` (${site.previewCapturedOn})` : ""} · 현재 사이트와 다를 수 있습니다.`);
    shot.append(img, cap);
  }

  top.append(
    strip,
    ...[eyebrow, titleRow, keywords, paragraph(site.description, "dp-lead"), shot, paragraph(site.analysis, "dp-analysis"), actions].filter(Boolean)
  );
  return top;
}

// ---------- 섹션 이동 메뉴 (해시 라우팅과 겹치지 않도록 링크 대신 버튼으로 스크롤) ----------

let sectionObserver = null;

function sectionNav(items) {
  const nav = h("nav", "dp-nav");
  nav.setAttribute("aria-label", "상세 섹션 이동");
  const buttons = {};
  items.forEach(({ id, label }) => {
    const btn = h("button", "dp-nav__btn", label);
    btn.type = "button";
    btn.addEventListener("click", () => {
      document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "start" });
    });
    nav.appendChild(btn);
    buttons[id] = btn;
  });

  // 지금 보고 있는 섹션의 메뉴를 표시 (색 + 밑줄, aria-current)
  if (sectionObserver) sectionObserver.disconnect();
  if ("IntersectionObserver" in window) {
    sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          Object.values(buttons).forEach((b) => b.removeAttribute("aria-current"));
          const btn = buttons[entry.target.id];
          if (btn) {
            btn.setAttribute("aria-current", "true");
            btn.scrollIntoView({ block: "nearest", inline: "nearest" });
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
  }
  return nav;
}

// ---------- 화면 그리기 ----------

function renderDetailPage(container, site) {
  container.innerHTML = "";

  const page = h("article", "dp");
  page.appendChild(overview(site));

  const rendered = [];
  const missing = [];
  DETAIL_SECTIONS.forEach((def) => {
    const content = def.render(site);
    if (!content) {
      missing.push(def.sub);
      return;
    }
    const section = h("section", `dp-section dp-section--${def.tier}`);
    section.id = `dp-${def.id}`;
    const head = h("div", "dp-section__head");
    head.append(h("h2", "dp-section__title", def.title), h("span", "dp-section__sub", def.sub));
    section.append(head, content);
    rendered.push({ section, id: section.id, label: def.nav });
  });

  page.appendChild(sectionNav([{ id: "dp-overview", label: "개요" }, ...rendered]));
  rendered.forEach(({ section }) => page.appendChild(section));

  if (missing.length) {
    const note = h("aside", "dp-missing");
    note.append(
      h("strong", null, "아직 분석되지 않은 항목"),
      h("p", null, `${missing.join(", ")} 정보는 정리 중입니다.`)
    );
    page.appendChild(note);
  }

  const bottom = h("p", "dp-bottom-nav");
  const back = h("a", "breadcrumb__back", "← 레퍼런스 목록으로");
  back.href = "#/";
  back.addEventListener("click", (e) => {
    e.preventDefault();
    navigateToList();
  });
  bottom.appendChild(back);

  container.append(page, bottom);
  if (sectionObserver) {
    [page.querySelector("#dp-overview"), ...rendered.map((r) => r.section)].forEach((s) => sectionObserver.observe(s));
  }
}

// 찾을 수 없음: kind = "brand"(없는 브랜드 주소) | "page"(없는 페이지 주소)
function renderNotFound(container, kind, slug) {
  container.innerHTML = "";
  const box = h("div", "dp-notfound");
  const title = h("h1", "dp-notfound__title", kind === "brand" ? "브랜드를 찾을 수 없습니다." : "페이지를 찾을 수 없습니다.");
  const text = h(
    "p",
    "dp-notfound__text",
    kind === "brand" ? `'${slug}'에 해당하는 브랜드가 없거나 주소가 바뀌었습니다.` : "주소가 잘못되었거나 더 이상 없는 페이지입니다."
  );
  const back = h("a", "btn btn--primary", "레퍼런스 목록으로");
  back.href = "#/";
  box.append(title, text, back);
  container.appendChild(box);
}