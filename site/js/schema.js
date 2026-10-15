// 사이트 이름·문구 (임시 이름: 여기만 바꾸면 로고·탭 제목·소개 문구가 함께 바뀐다.
// 단, 검색엔진·공유 미리보기용 기본값은 index.html <head>에도 같은 문구가 있으니 함께 고친다.)
const SITE_INFO = {
  name: "Design Reference",
  headline: "웹 디자인 레퍼런스 라이브러리",
  tagline: "유명 브랜드 웹사이트의 컬러·타이포그래피·레이아웃·UI를 분석해 비교합니다. 새 프로젝트의 디자인 방향을 잡을 때 참고하세요.",
  description: "유명 브랜드 웹사이트의 컬러·타이포그래피·레이아웃·UI 특징을 분석해 비교하는 웹 디자인 레퍼런스 라이브러리입니다."
};

/*
  화면에서 쓰는 브랜드 객체 (js/brand-service.js의 fromRow()가 DB 행을 이 모양으로 바꾼다)
  DB 테이블 구조와 값 규칙은 프로젝트 폴더의 MD/DATA_GUIDE.md, sql/schema.sql 참고.

    id, slug, name, url, region, country
    industryGroup : 업종 그룹 (INDUSTRY_GROUPS 키)     industry : 세부 업종 표시 이름
    theme, colorTone, description, analysis
    previewImage, previewCapturedOn : 첫 화면 캡처 이미지 경로와 캡처한 날 (없으면 색 그라데이션으로 대신함)
    moods    : 디자인 키워드 (MOOD_LABEL 키, DB design_keywords) - 카드 키워드, 스타일 필터
    feel     : 느낌 (DB mood)        keywords / tags : 자유 키워드 (DB tags)
    palette  : [{ hex, role, group }]  group = primary | secondary | neutral
    mainColors : 카드 썸네일용 대표 색 (palette 앞쪽 4개)
    colorNote, font { name, category }
    typography : { family, heading, body, weight, traits, sample }
    layout     : { type, density, whitespace, width, alignment, grid, blocks }
    ui         : { radius, shadow, depth, imageStyle, components: { buttons, cards, inputs, navigation } }
    visual     : { notes, iconography, graphics }
    characteristics : [{ title, text }]   bestFor, avoid : [문장]
    sources    : [{ type, label, url, note }]
    reviewStatus : draft | reviewed       updatedAt : "YYYY-MM-DD"
*/

const THEME_LABEL = { light: "라이트", dark: "다크", mixed: "혼합" };
const REGION_LABEL = {
  korea: "한국",
  usa: "미국",
  europe: "유럽",
  japan: "일본",
  china: "중국",
  "southeast-asia": "동남아시아",
  other: "기타"
};
const COLOR_TONE_LABEL = { warm: "웜톤", cool: "쿨톤", grayish: "그레이시", multi: "멀티" };
const FONT_CATEGORY_LABEL = { serif: "세리프", sans: "산세리프", display: "디스플레이", custom: "커스텀" };

const MOOD_LABEL = {
  minimal: "Minimal",
  modern: "Modern",
  editorial: "Editorial",
  playful: "Playful",
  luxury: "Luxury",
  bold: "Bold",
  friendly: "Friendly",
  technical: "Technical"
};

const LAYOUT_TYPE_LABEL = {
  grid: "그리드형",
  editorial: "매거진형",
  card: "카드형",
  "full-width": "풀와이드형",
  minimal: "미니멀형"
};
const DENSITY_LABEL = { compact: "촘촘함 (Compact)", comfortable: "보통 (Comfortable)", spacious: "여유 (Spacious)" };
const WHITESPACE_LABEL = { tight: "좁음", balanced: "보통", generous: "넉넉함" };

const RADIUS_LABEL = { sharp: "각진 (Sharp)", slight: "살짝 둥근 (Slight)", round: "둥근 (Round)" };
const SHADOW_LABEL = { none: "거의 없음", subtle: "은은함", strong: "강함" };
const DEPTH_LABEL = { flat: "평면 (Flat)", layered: "겹침 (Layered)", glass: "유리 (Glass)" };
const IMAGE_STYLE_LABEL = {
  product: "제품",
  lifestyle: "라이프스타일",
  illustration: "일러스트",
  photography: "사진",
  "3d": "3D"
};

// 상세 분석 화면용 라벨
const WIDTH_LABEL = { full: "전체 폭", contained: "가운데 고정 폭", mixed: "전체 폭 이미지 + 가운데 콘텐츠" };
const ALIGN_LABEL = { center: "가운데 정렬", left: "왼쪽 정렬", mixed: "가운데·왼쪽 혼합" };
const BUTTON_SHAPE_LABEL = { pill: "알약형", rounded: "둥근 사각", sharp: "각진 사각" };
const BUTTON_STYLE_LABEL = { filled: "채움", outline: "테두리", text: "텍스트 링크" };
const NAV_TYPE_LABEL = {
  minimal: "미니멀",
  dense: "촘촘한 메뉴",
  mega: "메가 메뉴",
  sidebar: "사이드바",
  floating: "떠 있는 바",
  fixed: "상단 고정"
};
const PALETTE_GROUP_LABEL = { primary: "Primary · 대표 컬러", secondary: "Secondary · 보조 컬러", neutral: "Neutral · 배경·텍스트·선" };
const SOURCE_TYPE_LABEL = { official: "공식 사이트", "design-system": "디자인 시스템", guideline: "가이드라인", article: "참고 글" };
const LAYOUT_BLOCK_LABEL = {
  nav: "내비게이션",
  hero: "큰 헤드라인",
  "full-image": "전체 폭 이미지",
  split: "글 + 이미지 2단",
  search: "검색 바",
  "grid-2": "2단 그리드",
  "grid-3": "3단 그리드",
  "grid-4": "4단 그리드",
  "row-scroll": "가로로 넘기는 카드 줄",
  text: "짧은 문단",
  footer: "푸터"
};
// ---------- 탐색용 분류 ----------
// 업종 그룹: 세부 업종(industry, 자유 텍스트)을 필터용 큰 묶음으로 모은다.
// aliases는 검색어로도 찾을 수 있게 하는 영어·우리말 별칭.
const INDUSTRY_GROUPS = {
  technology: { label: "테크·IT", aliases: ["technology", "tech", "it", "테크"] },
  finance: { label: "금융", aliases: ["finance", "fintech", "bank", "payment", "핀테크", "은행", "결제"] },
  commerce: { label: "커머스·리빙", aliases: ["commerce", "shopping", "ecommerce", "retail", "living", "쇼핑", "리빙"] },
  fashion: { label: "패션·뷰티", aliases: ["fashion", "beauty", "apparel", "패션", "뷰티", "명품"] },
  media: { label: "미디어·커뮤니티", aliases: ["media", "community", "portfolio", "design", "미디어", "커뮤니티"] },
  food: { label: "푸드", aliases: ["food", "delivery", "restaurant", "음식", "배달"] },
  travel: { label: "여행", aliases: ["travel", "hotel", "stay", "여행", "숙박"] },
  entertainment: { label: "엔터·게임", aliases: ["entertainment", "game", "gaming", "music", "streaming", "엔터", "게임", "음악"] },
  education: { label: "교육", aliases: ["education", "edu", "learning", "교육"] },
  mobility: { label: "모빌리티", aliases: ["mobility", "automotive", "car", "자동차", "모빌리티"] },
  healthcare: { label: "헬스케어", aliases: ["healthcare", "health", "medical", "헬스케어", "의료"] },
  other: { label: "기타", aliases: ["other"] }
};

function industryGroupOf(site) {
  return INDUSTRY_GROUPS[site.industryGroup] ? site.industryGroup : "other";
}

// 대표 색 계열: palette의 primary·secondary 색(배경·글자용 neutral은 빼고)을 색상환 위치로 나눈다.
// 유채색이 하나도 없는 브랜드는 "흑백". 한 브랜드가 여러 계열에 들 수 있다. dot = 필터 동그라미 색.
const COLOR_FAMILY = {
  red: { label: "빨강", dot: "#e5312f" },
  orange: { label: "주황", dot: "#f2852b" },
  yellow: { label: "노랑", dot: "#f5c518" },
  green: { label: "초록", dot: "#3aa856" },
  blue: { label: "파랑", dot: "#2f6fe0" },
  purple: { label: "보라", dot: "#7b4fd6" },
  pink: { label: "분홍", dot: "#ec6fa4" },
  brown: { label: "갈색", dot: "#8a5a35" },
  mono: { label: "흑백", dot: "" }
};

function hexToHsl(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}

// 색 하나 → 계열 키 (채도가 낮거나 아주 어둡고 밝으면 무채색이라 null)
function colorFamilyOfHex(hex) {
  const c = hexToHsl(hex);
  if (!c || c.s < 0.3 || c.l < 0.1 || c.l > 0.93) return null;
  const { h, s, l } = c;
  const warm = h < 50 || h >= 345;
  // 어두운 붉은·주황 기운(초콜릿·짙은 밤색)과 채도 낮은 금빛 베이지는 갈색으로 본다
  if (warm && l < 0.4 && (s < 0.6 || (h >= 10 && h < 50))) return "brown";
  if (h >= 20 && h < 55 && s < 0.45 && l < 0.75) return "brown";
  if (h < 12 || h >= 345) return "red";
  if (h < 40) return "orange";
  if (h < 68) return "yellow";
  if (h < 165) return "green";
  if (h < 255) return "blue";
  if (h < 290) return "purple";
  return "pink";
}

function colorFamiliesOf(site) {
  const fams = new Set();
  (site.palette || []).forEach((p) => {
    if (p.group === "neutral") return;
    const f = colorFamilyOfHex(p.hex);
    if (f) fams.add(f);
  });
  return fams.size ? [...fams] : ["mono"];
}

// 지역·테마 검색 별칭 (예: "korea", "japan", "dark"로 검색)
const REGION_ALIASES = {
  korea: ["korea", "korean", "kr"],
  usa: ["usa", "america", "us"],
  europe: ["europe", "eu"],
  japan: ["japan", "jp", "asia", "아시아"],
  china: ["china", "cn", "asia", "아시아"],
  "southeast-asia": ["southeast asia", "asia", "아시아"],
  other: ["other"]
};
const THEME_ALIASES = { light: ["light"], dark: ["dark"], mixed: ["mixed"] };

// 어떤 출처(로컬/Supabase)에서 온 데이터든 화면에서 안전하게 쓸 수 있도록 빈 값을 채운다.
function normalizeSite(site) {
  const mainColors = site.mainColors || [];
  return {
    ...site,
    mainColors,
    font: site.font || { name: "", category: "" },
    tags: site.tags || [],
    moods: site.moods || [],
    keywords: site.keywords || [],
    feel: site.feel || [],
    analysis: site.analysis || "",
    palette: site.palette && site.palette.length ? site.palette : mainColors.map((hex) => ({ hex, role: "" })),
    colorNote: site.colorNote || "",
    typography: site.typography || {},
    layout: site.layout || {},
    ui: site.ui || {},
    visual: site.visual || {},
    // 한 줄 문자열로 적은 특징도 { title, text } 형태로 맞춘다
    characteristics: (site.characteristics || []).map((c) => (typeof c === "string" ? { title: c, text: "" } : c)),
    bestFor: site.bestFor || [],
    avoid: site.avoid || [],
    sources: site.sources && site.sources.length ? site.sources : [{ label: "공식 사이트", url: site.url, type: "official" }]
  };
}
