// 사이트 이름·소개 (임시 이름: 여기만 바꾸면 헤더와 브라우저 탭 제목이 함께 바뀐다)
const SITE_INFO = {
  name: "Design Reference",
  tagline: "유명 브랜드 웹사이트의 컬러·타이포·레이아웃·UI를 비교해 보는 디자인 레퍼런스 라이브러리"
};

/*
  브랜드 데이터 구조

  [기본 필드] 모든 브랜드 필수 (Supabase sites 테이블과 같은 항목)
    id, name, url
    region      : kr | asia | europe | us
    industry    : 업종 (자유 텍스트)
    theme       : light | dark
    colorTone   : warm | cool | grayish | multi
    mainColors  : ["#hex", ...]
    font        : { name, category }   category = serif | sans | display | custom
    description : 한 줄 디자인 설명
    tags        : ["자유 태그", ...]

  [상세 필드] 모두 선택. 상세 화면은 있는 항목만 그리고, 비어 있는 섹션은 숨긴 뒤
  맨 아래 "아직 분석되지 않은 항목"으로 알려 준다. 브랜드별 화면 코드는 따로 만들지 않는다.
    industryGroup : 업종 그룹 (INDUSTRY_GROUPS 키) - 없으면 industry에서 자동으로 정함
    moods      : ["minimal", ...]           디자인 스타일 (MOOD_LABEL 키) - 카드 키워드, 스타일 필터로 사용
    keywords   : ["넓은 여백", ...]          디자인 키워드 (자유 텍스트)
    feel       : ["차분함", ...]             화면이 주는 느낌 (자유 텍스트)
    analysis   : "왜 이런 느낌이 나는지 2~3문장 분석"
    palette    : [{ hex, role, group }, ...] group = primary | secondary | neutral (없으면 묶지 않고 표시)
                                             palette가 없으면 mainColors 사용
    colorNote  : "컬러 성향 설명"
    typography : { family, heading, body, weight, traits,
                   sample: { heading, body, weight, upper, condensed, tracking } }  sample = 미리보기 설정
    layout     : { type, density, whitespace, width, alignment, grid, blocks: ["nav", "hero", ...] }
                   blocks = 추상 도식에 쓸 화면 구성 순서 (LAYOUT_BLOCK_LABEL 키)
    ui         : { radius, shadow, depth, imageStyle: [...],
                   components: { buttons: { shape, style, note }, cards: { note },
                                 inputs: { note }, navigation: { type, note } } }
    visual     : { notes: [...], iconography, graphics }
    characteristics : [{ title, text }, ...] 또는 ["한 줄 특징", ...]
    bestFor    : ["참고하기 좋은 프로젝트", ...]
    avoid      : ["적용할 때 주의할 점", ...]
    sources    : [{ label, url, type, note }, ...]  type = SOURCE_TYPE_LABEL 키
    updatedAt  : "YYYY-MM-DD"               상세 정보를 마지막으로 정리한 날
*/

const THEME_LABEL = { light: "라이트", dark: "다크" };
const REGION_LABEL = { kr: "한국", asia: "아시아", europe: "유럽", us: "미국" };
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
  other: { label: "기타", aliases: ["other"] }
};

// 세부 업종 → 업종 그룹 기본값. 브랜드별로 다르게 묶고 싶으면 SITE_DETAILS에 industryGroup을 쓴다.
const INDUSTRY_TO_GROUP = {
  "테크/전자기기": "technology",
  "생산성": "technology",
  "포털": "technology",
  "메신저/SNS": "technology",
  "금융": "finance",
  "쇼핑": "commerce",
  "리빙/라이프스타일": "commerce",
  "명품/뷰티": "fashion",
  "디자인": "media",
  "포트폴리오": "media",
  "푸드딜리버리": "food",
  "여행/숙박": "travel",
  "음악": "entertainment",
  "미디어/엔터": "entertainment",
  "게임": "entertainment"
};

function industryGroupOf(site) {
  return site.industryGroup || INDUSTRY_TO_GROUP[site.industry] || "other";
}

// 지역·테마 검색 별칭 (예: "korea", "japan", "dark"로 검색)
const REGION_ALIASES = {
  kr: ["korea", "korean", "kr"],
  asia: ["asia", "japan", "일본"],
  europe: ["europe", "eu"],
  us: ["usa", "america", "us"]
};
const THEME_ALIASES = { light: ["light"], dark: ["dark"] };

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
