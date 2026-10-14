// 브랜드 기본 데이터 (Supabase sites 테이블과 같은 항목). 필드 설명은 js/schema.js 참고.

const SITES = [
  {
    id: "apple",
    name: "Apple",
    url: "https://www.apple.com",
    region: "us",
    theme: "light",
    colorTone: "grayish",
    mainColors: ["#000000", "#f5f5f7", "#1d1d1f"],
    font: { name: "SF Pro", category: "sans" },
    industry: "테크/전자기기",
    description: "절제된 여백과 큼직한 타이포로 제품 자체에 시선을 집중시키는 미니멀 디자인",
    tags: ["미니멀", "프리미엄", "여백"]
  },
  {
    id: "nike",
    name: "Nike",
    url: "https://www.nike.com",
    region: "us",
    theme: "light",
    colorTone: "grayish",
    mainColors: ["#111111", "#ffffff", "#fa5400"],
    font: { name: "Nike Futura (custom)", category: "custom" },
    industry: "쇼핑",
    description: "흑백 대비와 다이내믹한 이미지 크롭으로 스포츠의 에너지를 표현",
    tags: ["다이내믹", "스포츠", "대비"]
  },
  {
    id: "airbnb",
    name: "Airbnb",
    url: "https://www.airbnb.com",
    region: "us",
    theme: "light",
    colorTone: "warm",
    mainColors: ["#ff5a5f", "#ffffff", "#484848"],
    font: { name: "Airbnb Cereal (custom)", category: "custom" },
    industry: "여행/숙박",
    description: "따뜻한 코랄톤과 둥근 일러스트로 신뢰감 있는 여행 경험을 전달",
    tags: ["따뜻함", "친근함", "일러스트"]
  },
  {
    id: "spotify",
    name: "Spotify",
    url: "https://www.spotify.com",
    region: "europe",
    theme: "dark",
    colorTone: "cool",
    mainColors: ["#191414", "#1db954", "#ffffff"],
    font: { name: "Spotify Circular (custom)", category: "custom" },
    industry: "음악",
    description: "짙은 다크 배경 위 시그니처 그린으로 몰입감 있는 음악 경험을 강조",
    tags: ["다크모드", "생동감", "몰입감"]
  },
  {
    id: "netflix",
    name: "Netflix",
    url: "https://www.netflix.com",
    region: "us",
    theme: "dark",
    colorTone: "warm",
    mainColors: ["#141414", "#e50914", "#ffffff"],
    font: { name: "Netflix Sans (custom)", category: "custom" },
    industry: "미디어/엔터",
    description: "블랙 배경과 강렬한 레드 포인트로 몰입형 스트리밍 무드를 연출",
    tags: ["임팩트", "몰입감", "엔터테인먼트"]
  },
  {
    id: "notion",
    name: "Notion",
    url: "https://www.notion.so",
    region: "us",
    theme: "light",
    colorTone: "grayish",
    mainColors: ["#ffffff", "#191919", "#f7f6f3"],
    font: { name: "Inter", category: "sans" },
    industry: "생산성",
    description: "군더더기 없는 흑백 톤과 명확한 위계로 생산성에 집중한 구성",
    tags: ["미니멀", "명료함", "툴"]
  },
  {
    id: "linear",
    name: "Linear",
    url: "https://linear.app",
    region: "us",
    theme: "dark",
    colorTone: "cool",
    mainColors: ["#0c0c14", "#5e6ad2", "#ffffff"],
    font: { name: "Inter", category: "sans" },
    industry: "생산성",
    description: "딥퍼플 그라데이션과 정교한 인터랙션으로 세련된 개발자 경험을 구현",
    tags: ["세련됨", "그라데이션", "디테일"]
  },
  {
    id: "figma",
    name: "Figma",
    url: "https://www.figma.com",
    region: "us",
    theme: "light",
    colorTone: "multi",
    mainColors: ["#0acf83", "#a259ff", "#f24e1e", "#1abcfe"],
    font: { name: "Inter", category: "sans" },
    industry: "디자인",
    description: "다채로운 브랜드 컬러와 명료한 그리드로 창의적인 협업 무드를 표현",
    tags: ["컬러풀", "협업", "그리드"]
  },
  {
    id: "stripe",
    name: "Stripe",
    url: "https://stripe.com",
    region: "us",
    theme: "light",
    colorTone: "cool",
    mainColors: ["#635bff", "#0a2540", "#ffffff"],
    font: { name: "system sans", category: "sans" },
    industry: "금융",
    description: "인디고 그라데이션과 정교한 모션으로 신뢰감 있는 개발자 경험을 전달",
    tags: ["그라데이션", "신뢰감", "테크"]
  },
  {
    id: "behance",
    name: "Behance",
    url: "https://www.behance.net",
    region: "us",
    theme: "light",
    colorTone: "cool",
    mainColors: ["#0057ff", "#ffffff", "#191919"],
    font: { name: "system sans", category: "sans" },
    industry: "포트폴리오",
    description: "강렬한 블루 포인트와 카드형 그리드로 작업물을 돋보이게 배치",
    tags: ["갤러리", "그리드", "포트폴리오"]
  },
  {
    id: "dribbble",
    name: "Dribbble",
    url: "https://dribbble.com",
    region: "us",
    theme: "light",
    colorTone: "warm",
    mainColors: ["#ea4c89", "#ffffff", "#333333"],
    font: { name: "system sans", category: "sans" },
    industry: "포트폴리오",
    description: "핑크 포인트 컬러와 밀도 높은 카드 그리드로 생동감 있는 커뮤니티를 표현",
    tags: ["생동감", "커뮤니티", "카드형"]
  },
  {
    id: "awwwards",
    name: "Awwwards",
    url: "https://www.awwwards.com",
    region: "europe",
    theme: "dark",
    colorTone: "warm",
    mainColors: ["#0d0d0d", "#ffd200", "#ffffff"],
    font: { name: "system sans", category: "sans" },
    industry: "디자인",
    description: "다크 배경과 옐로우 포인트로 실험적이고 도전적인 웹디자인을 큐레이션",
    tags: ["실험적", "큐레이션", "포인트컬러"]
  },
  {
    id: "naver",
    name: "네이버",
    url: "https://www.naver.com",
    region: "kr",
    theme: "light",
    colorTone: "cool",
    mainColors: ["#03c75a", "#ffffff", "#191919"],
    font: { name: "Pretendard", category: "sans" },
    industry: "포털",
    description: "시그니처 그린과 정보 밀도 높은 레이아웃으로 실용적인 포털 경험을 제공",
    tags: ["정보형", "실용성", "포털"]
  },
  {
    id: "kakao",
    name: "카카오",
    url: "https://www.kakaocorp.com",
    region: "kr",
    theme: "light",
    colorTone: "warm",
    mainColors: ["#fee500", "#391b1b", "#ffffff"],
    font: { name: "Pretendard", category: "sans" },
    industry: "메신저/SNS",
    description: "카카오 옐로우와 둥근 캐릭터 그래픽으로 친근한 브랜드 경험을 연출",
    tags: ["친근함", "캐릭터", "브랜드"]
  },
  {
    id: "toss",
    name: "토스",
    url: "https://toss.im",
    region: "kr",
    theme: "light",
    colorTone: "cool",
    mainColors: ["#0064ff", "#ffffff", "#191f28"],
    font: { name: "Toss Product Sans (custom)", category: "custom" },
    industry: "금융",
    description: "선명한 블루톤과 큼직한 타이포로 직관적인 금융 경험을 설계",
    tags: ["직관성", "블루톤", "핀테크"]
  },
  {
    id: "coupang",
    name: "쿠팡",
    url: "https://www.coupang.com",
    region: "kr",
    theme: "light",
    colorTone: "cool",
    mainColors: ["#0073e6", "#ffffff", "#333333"],
    font: { name: "Pretendard", category: "sans" },
    industry: "쇼핑",
    description: "로켓배송을 상징하는 블루 포인트와 밀도 높은 정보구조로 빠른 쇼핑을 지원",
    tags: ["정보형", "빠른탐색", "쇼핑"]
  },
  {
    id: "musinsa",
    name: "무신사",
    url: "https://www.musinsa.com",
    region: "kr",
    theme: "dark",
    colorTone: "grayish",
    mainColors: ["#000000", "#ffffff", "#c4c4c4"],
    font: { name: "Pretendard", category: "sans" },
    industry: "쇼핑",
    description: "블랙앤화이트 기반의 스트리트 무드로 트렌디한 패션 감성을 연출",
    tags: ["스트리트", "트렌디", "패션"]
  },
  {
    id: "baemin",
    name: "배달의민족",
    url: "https://www.baemin.com",
    region: "kr",
    theme: "light",
    colorTone: "cool",
    mainColors: ["#2ac1bc", "#ffffff", "#333333"],
    font: { name: "한나체 (custom)", category: "display" },
    industry: "푸드딜리버리",
    description: "민트톤과 위트있는 한나체 타이포로 유쾌한 브랜드 개성을 표현",
    tags: ["위트", "브랜드개성", "타이포"]
  },
  {
    id: "line",
    name: "LINE",
    url: "https://line.me",
    region: "asia",
    theme: "light",
    colorTone: "cool",
    mainColors: ["#06c755", "#ffffff", "#000000"],
    font: { name: "system sans", category: "sans" },
    industry: "메신저/SNS",
    description: "라인 그린과 캐릭터 일러스트로 친근한 커뮤니케이션 경험을 제공",
    tags: ["친근함", "캐릭터", "커뮤니케이션"]
  },
  {
    id: "muji",
    name: "MUJI",
    url: "https://www.muji.com",
    region: "asia",
    theme: "light",
    colorTone: "grayish",
    mainColors: ["#f7f5f0", "#3a3a3a", "#c9a97e"],
    font: { name: "system sans", category: "sans" },
    industry: "리빙/라이프스타일",
    description: "무채색과 넉넉한 여백을 활용한 절제된 미니멀리즘으로 브랜드 철학을 전달",
    tags: ["절제미", "여백", "라이프스타일"]
  },
  {
    id: "uniqlo",
    name: "유니클로",
    url: "https://www.uniqlo.com",
    region: "asia",
    theme: "light",
    colorTone: "warm",
    mainColors: ["#ff0000", "#ffffff", "#111111"],
    font: { name: "system sans", category: "sans" },
    industry: "쇼핑",
    description: "강렬한 레드 로고와 그리드형 상품 나열로 실용적인 쇼핑 경험을 구성",
    tags: ["그리드", "실용성", "쇼핑"]
  },
  {
    id: "sony",
    name: "Sony",
    url: "https://www.sony.com",
    region: "asia",
    theme: "dark",
    colorTone: "grayish",
    mainColors: ["#000000", "#ffffff", "#8c8c8c"],
    font: { name: "system sans", category: "sans" },
    industry: "테크/전자기기",
    description: "블랙 기반의 하이테크 무드와 절제된 타이포로 프리미엄 감성을 강조",
    tags: ["하이테크", "프리미엄", "절제미"]
  },
  {
    id: "nintendo",
    name: "Nintendo",
    url: "https://www.nintendo.com",
    region: "asia",
    theme: "light",
    colorTone: "warm",
    mainColors: ["#e60012", "#ffffff", "#1a1a1a"],
    font: { name: "Nintendo Display (custom)", category: "display" },
    industry: "게임",
    description: "경쾌한 레드 포인트와 둥근 그래픽으로 즐거운 게임 경험을 전달",
    tags: ["경쾌함", "그래픽", "게임"]
  },
  {
    id: "ikea",
    name: "IKEA",
    url: "https://www.ikea.com",
    region: "europe",
    theme: "light",
    colorTone: "multi",
    mainColors: ["#0058a3", "#ffda1a", "#ffffff"],
    font: { name: "Noto Sans", category: "sans" },
    industry: "리빙/라이프스타일",
    description: "블루와 옐로우의 선명한 대비로 친근하고 실용적인 라이프스타일을 제안",
    tags: ["대비", "실용성", "친근함"]
  },
  {
    id: "bmw",
    name: "BMW",
    url: "https://www.bmw.com",
    region: "europe",
    theme: "dark",
    colorTone: "cool",
    mainColors: ["#0c0c0c", "#1c69d4", "#c6c6c6"],
    font: { name: "BMW Type Next (custom)", category: "custom" },
    industry: "자동차",
    description: "딥블루와 메탈릭 그레이 톤으로 정교한 엔지니어링 감성을 표현",
    tags: ["엔지니어링", "메탈릭", "정교함"]
  },
  {
    id: "louisvuitton",
    name: "Louis Vuitton",
    url: "https://www.louisvuitton.com",
    region: "europe",
    theme: "dark",
    colorTone: "grayish",
    mainColors: ["#000000", "#c9a86a", "#ffffff"],
    font: { name: "LV Serif (custom)", category: "serif" },
    industry: "명품/뷰티",
    description: "블랙과 골드의 대비, 클래식한 세리프 타이포로 럭셔리한 헤리티지를 강조",
    tags: ["럭셔리", "헤리티지", "클래식"]
  },
  {
    id: "chanel",
    name: "Chanel",
    url: "https://www.chanel.com",
    region: "europe",
    theme: "light",
    colorTone: "grayish",
    mainColors: ["#000000", "#ffffff", "#d0d0d0"],
    font: { name: "Chanel Serif (custom)", category: "serif" },
    industry: "명품/뷰티",
    description: "블랙앤화이트의 절제된 대비와 세리프 타이포로 시대를 초월한 우아함을 표현",
    tags: ["우아함", "절제미", "클래식"]
  },
  {
    id: "riotgames",
    name: "Riot Games",
    url: "https://www.riotgames.com",
    region: "us",
    theme: "dark",
    colorTone: "multi",
    mainColors: ["#0a0e14", "#d13639", "#eb0029", "#005a82"],
    font: { name: "Riot Display (custom)", category: "display" },
    industry: "게임",
    description: "다크 배경 위 강렬한 그래픽과 커스텀 타이포로 몰입감 있는 게임 세계관을 구현",
    tags: ["몰입감", "세계관", "그래픽"]
  },
  {
    id: "steam",
    name: "Steam",
    url: "https://store.steampowered.com",
    region: "us",
    theme: "dark",
    colorTone: "cool",
    mainColors: ["#1b2838", "#66c0f4", "#ffffff"],
    font: { name: "system sans", category: "sans" },
    industry: "게임",
    description: "짙은 블루그레이 톤과 밀도 높은 레이아웃으로 방대한 게임 라이브러리를 탐색하게 함",
    tags: ["정보형", "밀도", "게임플랫폼"]
  },
  {
    id: "playstation",
    name: "PlayStation",
    url: "https://www.playstation.com",
    region: "us",
    theme: "dark",
    colorTone: "cool",
    mainColors: ["#003791", "#ffffff", "#000000"],
    font: { name: "system sans", category: "sans" },
    industry: "게임",
    description: "딥블루와 화이트의 강한 대비로 강력한 콘솔 브랜드 이미지를 전달",
    tags: ["강렬함", "브랜드", "콘솔"]
  }
];

// ---------- 상세 디자인 정보 (id로 기본 데이터에 덧붙임) ----------
// 기본 데이터가 Supabase에서 오든 위 SITES에서 오든 같은 id면 이 정보가 합쳐진다.
// 필드 설명은 js/schema.js 참고. 1차 정리본이므로 실제 사이트와 대조해 다듬어 갈 것.
const SITE_DETAILS = {
  apple: {
    moods: ["minimal", "luxury", "modern"],
    keywords: ["넓은 여백", "제품 중심", "큰 헤드라인", "섹션 단위 구성"],
    feel: ["차분함", "정제됨", "자신감"],
    analysis:
      "넓은 여백과 정밀한 타이포, 제품 중심의 시각 위계가 철저하게 통제된 프리미엄 경험을 만든다. 장식을 거의 쓰지 않고 '큰 제품 이미지 + 짧은 헤드라인' 한 쌍을 섹션마다 반복해 리듬을 만든다.",
    palette: [
      { hex: "#0071e3", role: "버튼·링크 강조", group: "primary" },
      { hex: "#000000", role: "어두운 섹션 배경", group: "secondary" },
      { hex: "#ffffff", role: "기본 배경", group: "neutral" },
      { hex: "#f5f5f7", role: "보조 섹션 배경", group: "neutral" },
      { hex: "#1d1d1f", role: "본문 텍스트", group: "neutral" },
      { hex: "#6e6e73", role: "보조 텍스트", group: "neutral" },
      { hex: "#d2d2d7", role: "구분선", group: "neutral" }
    ],
    colorNote: "흰색·연회색 배경에 거의 검은 텍스트. 유채색은 버튼과 링크의 파랑뿐이고, 화면의 색은 제품 사진이 맡는다.",
    typography: {
      family: "SF Pro (Display · Text)",
      heading: "크고 굵게, 한두 줄로 짧게. 자간을 살짝 좁혀 단단한 인상",
      body: "중간 크기의 담백한 문장, 보조 설명은 회색으로 한 단계 낮춤",
      weight: "Regular · Semibold · Bold",
      traits: "크기 대비가 위계를 만든다. 헤드라인은 아주 크고 본문은 작게 두어, 읽는 순서가 자연스럽게 정해진다.",
      sample: { heading: "Pro. Beyond.", body: "가볍고 강력하게. 하루 종일 가는 배터리와 함께.", weight: 700, tracking: "-0.02em" }
    },
    layout: {
      type: "full-width",
      density: "spacious",
      whitespace: "generous",
      width: "mixed",
      alignment: "center",
      grid: "섹션마다 1~2단의 단순한 모듈 그리드",
      blocks: ["nav", "hero", "full-image", "grid-2", "text", "footer"]
    },
    ui: {
      radius: "round",
      shadow: "none",
      depth: "flat",
      imageStyle: ["product", "3d"],
      components: {
        buttons: { shape: "pill", style: "filled", note: "작은 알약형 파란 버튼과 '더 알아보기 >' 텍스트 링크를 짝지어 쓴다." },
        cards: { note: "테두리 없이 연회색 배경과 큰 둥근 모서리로 구분한다." },
        navigation: { type: "minimal", note: "얇은 상단 바에 카테고리만 나열하고, 제품 페이지에서는 보조 내비게이션이 따로 붙는다." }
      }
    },
    visual: {
      notes: ["깨끗한 단색 배경", "화면을 가득 채우는 큰 제품 크기", "시각적 잡음 최소화", "조명이 통제된 제품 렌더링"],
      iconography: "얇고 단순한 선 아이콘",
      graphics: "장식 그래픽 대신 제품 이미지와 여백이 화면을 채운다"
    },
    characteristics: [
      { title: "넓은 여백", text: "콘텐츠 블록 사이를 넉넉히 띄워 고급스러운 리듬을 유지한다." },
      { title: "제품이 주인공", text: "큰 제품 이미지가 위계를 지배하고, 카피는 짧게 받친다." },
      { title: "통제된 타이포", text: "큰 헤드라인과 짧은 본문으로 읽는 순서가 분명하다." },
      { title: "장식 최소화", text: "테두리·그림자·장식 요소를 의도적으로 줄인다." }
    ],
    bestFor: ["프리미엄 제품 출시 페이지", "전자기기·하드웨어 소개", "고가 제품 쇼핑몰", "미니멀한 기업 사이트"],
    avoid: [
      "넓은 여백은 정보가 많은 서비스에서 비효율적이다.",
      "극단적으로 단순한 메뉴는 원하는 정보를 찾기 어렵게 만들 수 있다.",
      "큰 제품 이미지를 쓰려면 고품질 비주얼 자료가 필요하다.",
      "좋은 이미지 없이 스타일만 따라 하면 사이트가 텅 비어 보인다."
    ],
    sources: [
      { label: "Apple 공식 사이트", url: "https://www.apple.com", type: "official" },
      {
        label: "Apple Human Interface Guidelines",
        url: "https://developer.apple.com/design/human-interface-guidelines/",
        type: "guideline",
        note: "앱 디자인 가이드. 웹사이트와 일부 원칙을 공유한다."
      }
    ],
    updatedAt: "2026-10-14"
  },
  nike: {
    industryGroup: "fashion",
    moods: ["bold", "modern"],
    keywords: ["흑백 대비", "대형 캠페인 사진", "굵은 대문자 헤드라인"],
    feel: ["역동적", "자신감", "직설적"],
    analysis:
      "흑백 바탕 위에 화면을 꽉 채운 캠페인 사진과 아주 굵은 대문자 헤드라인을 올려, 색 대신 사진과 글자의 힘으로 에너지를 만든다. 쇼핑 영역은 반대로 담백한 그리드로 정리해 캠페인과 상품 탐색의 온도를 나눈다.",
    palette: [
      { hex: "#111111", role: "텍스트·버튼 (브랜드 블랙)", group: "primary" },
      { hex: "#fa5400", role: "할인·알림 포인트", group: "secondary" },
      { hex: "#ffffff", role: "기본 배경", group: "neutral" },
      { hex: "#f5f5f5", role: "상품 이미지 배경", group: "neutral" },
      { hex: "#707072", role: "보조 텍스트", group: "neutral" },
      { hex: "#e5e5e5", role: "구분선", group: "neutral" }
    ],
    colorNote: "흑백이 기본이고, 색은 거의 사진에서 나온다. 주황은 할인·알림 같은 작은 포인트에만 쓴다.",
    typography: {
      family: "Nike Futura (헤드라인) · Helvetica Now (본문)",
      heading: "아주 굵고 폭이 좁은 대문자, 줄 간격을 바짝 붙임",
      body: "작고 담백한 산세리프, 상품명·가격은 굵기로만 구분",
      weight: "Medium (본문) · Extra Bold Condensed (헤드라인)",
      traits: "헤드라인과 본문의 성격 차이가 매우 크다. 헤드라인은 그래픽처럼, 본문은 정보처럼 쓴다.",
      sample: { heading: "Just Do It.", body: "새로운 시즌 컬렉션을 지금 만나 보세요.", weight: 900, upper: true, condensed: true, tracking: "-0.01em" }
    },
    layout: {
      type: "full-width",
      density: "comfortable",
      whitespace: "balanced",
      width: "mixed",
      alignment: "mixed",
      grid: "캠페인은 전체 폭 1단, 상품 목록은 3~4단 그리드",
      blocks: ["nav", "full-image", "text", "row-scroll", "grid-3", "footer"]
    },
    ui: {
      radius: "round",
      shadow: "none",
      depth: "flat",
      imageStyle: ["photography", "product"],
      components: {
        buttons: { shape: "pill", style: "filled", note: "검정 또는 흰색 알약형 버튼. 사진 위에서는 흰색 버튼을 쓴다." },
        cards: { note: "테두리·그림자 없이 연회색 배경의 정사각형 상품 사진과 짧은 텍스트로 구성한다." },
        inputs: { note: "연회색 배경의 둥근 알약형 검색창." },
        navigation: { type: "mega", note: "상단 카테고리에 마우스를 올리면 큰 메가 메뉴가 펼쳐진다." }
      }
    },
    visual: {
      notes: ["운동선수의 움직임을 담은 역동적인 사진", "화면 끝까지 꽉 채운 과감한 크롭", "상품은 연회색 배경의 깔끔한 단독 컷"],
      graphics: "장식 그래픽 대신 큰 글자 자체를 그래픽처럼 쓴다"
    },
    characteristics: [
      { title: "사진이 메시지", text: "설명보다 화면을 가득 채운 캠페인 사진이 먼저 말한다." },
      { title: "글자가 곧 그래픽", text: "굵은 대문자 헤드라인을 이미지처럼 크게 배치한다." },
      { title: "흑백 + 한 점의 포인트", text: "색을 아껴서 사진과 주황 포인트가 더 눈에 띈다." },
      { title: "캠페인과 쇼핑의 분리", text: "감성적인 캠페인 영역과 담백한 상품 그리드를 확실히 나눈다." }
    ],
    bestFor: ["스포츠·패션 브랜드", "캠페인·이벤트 랜딩 페이지", "메시지가 강한 브랜드 사이트", "이미지 중심 커머스"],
    avoid: [
      "사진 퀄리티가 받쳐 주지 않으면 밋밋해진다.",
      "굵은 영문 대문자 느낌은 한글로 그대로 옮기기 어렵다.",
      "강한 대비와 큰 글자가 많으면 정보형 서비스에서는 피로감을 준다."
    ],
    sources: [{ label: "Nike 공식 사이트", url: "https://www.nike.com", type: "official" }],
    updatedAt: "2026-10-14"
  },
  airbnb: {
    moods: ["friendly", "modern", "minimal"],
    keywords: ["코랄 포인트", "둥근 카드", "사진 중심 목록", "검색창 중심"],
    feel: ["따뜻함", "친근함", "신뢰"],
    analysis:
      "흰 바탕과 둥근 카드, 통일된 사진 비율로 수많은 숙소를 정돈해 보여 준다. 코랄 레드는 로고와 핵심 버튼에만 쓰고, 화면의 색과 감성은 숙소 사진이 채운다.",
    palette: [
      { hex: "#ff385c", role: "브랜드 코랄 (로고·예약 버튼)", group: "primary" },
      { hex: "#ffffff", role: "기본 배경", group: "neutral" },
      { hex: "#f7f7f7", role: "보조 배경", group: "neutral" },
      { hex: "#222222", role: "본문 텍스트", group: "neutral" },
      { hex: "#6a6a6a", role: "보조 텍스트", group: "neutral" },
      { hex: "#dddddd", role: "구분선·테두리", group: "neutral" }
    ],
    colorNote: "흰 바탕에 코랄 레드는 로고와 주요 버튼에만. 화면의 색은 숙소 사진이 채운다.",
    typography: {
      family: "Airbnb Cereal (자체 서체)",
      heading: "중간 크기의 굵은 제목, 크기보다 굵기로 위계를 만듦",
      body: "읽기 편한 크기, 짙은 회색과 중간 회색 두 단계",
      weight: "Book · Medium · Bold",
      traits: "둥글고 부드러운 글자 형태가 친근한 인상을 만든다. 글자 크기 차이를 크게 두지 않아 화면이 차분하다.",
      sample: { heading: "어디로 떠나시나요?", body: "전 세계의 독특한 숙소와 체험을 찾아보세요.", weight: 600 }
    },
    layout: {
      type: "card",
      density: "comfortable",
      whitespace: "balanced",
      width: "contained",
      alignment: "left",
      grid: "화면 폭에 따라 2~6단으로 늘어나는 카드 그리드",
      blocks: ["nav", "search", "grid-4", "grid-4", "footer"]
    },
    ui: {
      radius: "round",
      shadow: "subtle",
      depth: "layered",
      imageStyle: ["photography"],
      components: {
        buttons: { shape: "rounded", style: "filled", note: "코랄 계열의 둥근 사각 버튼은 예약처럼 가장 중요한 행동에만 쓴다." },
        cards: { note: "테두리 없이 둥근 모서리 사진과 아래 텍스트로 구성. 사진이 카드 대부분을 차지한다." },
        inputs: { note: "그림자가 살짝 있는 알약형 검색 바. 칸을 나눠 장소·날짜·인원을 입력한다." },
        navigation: { type: "minimal", note: "로고 · 가운데 검색 바 · 오른쪽 메뉴로 이뤄진 단순한 상단 바." }
      }
    },
    visual: {
      notes: ["숙소 사진이 화면 대부분을 차지", "사진 비율을 통일해 목록을 정돈", "사람과 공간이 함께 나오는 따뜻한 사진"],
      iconography: "카테고리 메뉴의 작고 단순한 아이콘"
    },
    characteristics: [
      { title: "사진 중심 카드 그리드", text: "같은 비율의 사진 카드를 반복해 많은 숙소를 정돈해 보여 준다." },
      { title: "검색 바가 주인공", text: "화면 상단 가운데의 검색 바가 첫 행동을 안내한다." },
      { title: "부드러운 둥근 형태", text: "카드·버튼·검색 바 모두 둥근 모서리로 친근함을 만든다." },
      { title: "아껴 쓰는 그림자", text: "그림자는 검색 바·팝업처럼 떠 있는 요소에만 약하게 쓴다." }
    ],
    bestFor: ["예약·숙박·여행 서비스", "사진 목록이 많은 마켓플레이스", "지역 기반 서비스", "친근한 분위기의 커머스"],
    avoid: [
      "사진 톤이 제각각이면 카드 그리드가 산만해진다.",
      "포인트 컬러를 여러 곳에 쓰면 강조 효과가 사라진다.",
      "사진이 부족한 서비스에서는 카드가 빈약해 보인다."
    ],
    sources: [
      { label: "Airbnb 공식 사이트", url: "https://www.airbnb.com", type: "official" },
      { label: "Airbnb Design", url: "https://airbnb.design", type: "article", note: "Airbnb 디자인 팀의 글 모음" }
    ],
    updatedAt: "2026-10-14"
  },
  spotify: {
    moods: ["bold", "playful", "modern"],
    keywords: ["다크 배경", "시그니처 그린", "앨범 아트 중심", "굵은 타이포"],
    feel: ["몰입", "생동감", "젊음"],
    analysis:
      "거의 검은 배경 위에서 앨범 아트가 색을 맡고, 시그니처 그린은 '재생'처럼 핵심 행동에만 아껴 쓴다. 홍보 페이지는 반대로 쨍한 색과 굵은 글자를 대담하게 써서 서비스 화면과 다른 에너지를 낸다.",
    palette: [
      { hex: "#1db954", role: "시그니처 그린 (재생·주요 버튼)", group: "primary" },
      { hex: "#121212", role: "기본 배경", group: "neutral" },
      { hex: "#181818", role: "카드 배경", group: "neutral" },
      { hex: "#282828", role: "마우스를 올린 카드", group: "neutral" },
      { hex: "#ffffff", role: "본문 텍스트", group: "neutral" },
      { hex: "#b3b3b3", role: "보조 텍스트", group: "neutral" }
    ],
    colorNote: "서비스 화면은 거의 검정 배경에 그린 포인트 하나. 홍보 페이지에서는 쨍한 색 조합을 대담하게 쓴다.",
    typography: {
      family: "자체 산세리프 (Spotify Mix, 이전 Circular)",
      heading: "굵고 꽉 찬 산세리프, 짧고 리듬감 있는 문구",
      body: "작은 크기의 흰색·회색 텍스트, 두 단계 회색으로 위계",
      weight: "Regular · Bold · Black",
      traits: "어두운 배경에서도 또렷하게 보이도록 헤드라인을 아주 굵게 쓴다. 본문은 작고 간결하다.",
      sample: { heading: "지금 듣고 싶은 모든 음악", body: "나만을 위한 플레이리스트와 새로운 음악을 만나 보세요.", weight: 800, tracking: "-0.02em" }
    },
    layout: {
      type: "card",
      density: "comfortable",
      whitespace: "balanced",
      width: "full",
      alignment: "left",
      grid: "왼쪽 사이드바 + 가로로 넘기는 카드 줄 여러 개",
      blocks: ["nav", "hero", "row-scroll", "row-scroll", "grid-4", "footer"]
    },
    ui: {
      radius: "round",
      shadow: "subtle",
      depth: "layered",
      imageStyle: ["photography", "illustration"],
      components: {
        buttons: { shape: "pill", style: "filled", note: "그린 원형 재생 버튼과 알약형 버튼. 보조 버튼은 테두리형을 쓴다." },
        cards: { note: "테두리 없이 살짝 밝은 어두운 면 위에 정사각형 커버. 마우스를 올리면 면이 밝아진다." },
        inputs: { note: "어두운 배경의 둥근 알약형 검색창." },
        navigation: { type: "sidebar", note: "웹 플레이어는 왼쪽 고정 사이드바와 하단 재생 바로 구성된다." }
      }
    },
    visual: {
      notes: ["앨범·플레이리스트 커버가 화면의 색을 결정", "홍보 페이지는 원색 배경 + 잘라낸 인물 사진 콜라주", "정사각형 커버 이미지의 반복"],
      iconography: "꽉 찬(Filled) 단순한 아이콘"
    },
    characteristics: [
      { title: "콘텐츠가 색을 낸다", text: "배경은 어둡게 비워 두고 앨범 아트가 화면의 색을 채운다." },
      { title: "아껴 쓰는 그린", text: "브랜드 그린은 재생 같은 핵심 행동에만 써서 눈에 잘 띈다." },
      { title: "가로 스크롤 진열대", text: "주제별 카드 줄을 쌓아 많은 콘텐츠를 빠르게 훑게 한다." },
      { title: "두 가지 얼굴", text: "차분한 서비스 화면과 대담한 홍보 화면을 분명히 구분한다." }
    ],
    bestFor: ["음악·영상 스트리밍", "콘텐츠 큐레이션 플랫폼", "다크 모드 중심 앱", "젊은 층 대상 서비스"],
    avoid: [
      "다크 배경 위 작은 회색 글자는 대비가 낮아지기 쉽다.",
      "포인트 그린을 넓은 면에 쓰면 눈이 피로하다.",
      "커버 이미지가 없으면 화면이 단조로운 검은 면이 된다."
    ],
    sources: [
      { label: "Spotify 공식 사이트", url: "https://www.spotify.com", type: "official" },
      {
        label: "Spotify Design Guidelines",
        url: "https://developer.spotify.com/documentation/design",
        type: "guideline",
        note: "Spotify 콘텐츠·로고를 쓸 때의 가이드"
      }
    ],
    updatedAt: "2026-10-14"
  },
  notion: {
    moods: ["minimal", "friendly", "editorial"],
    keywords: ["흑백 위주", "손그림 일러스트", "문서 같은 구성", "가벼운 UI", "SaaS"],
    palette: [
      { hex: "#ffffff", role: "배경" },
      { hex: "#191919", role: "텍스트" },
      { hex: "#f7f6f3", role: "보조 배경" },
      { hex: "#2383e2", role: "버튼·링크" }
    ],
    colorNote: "흑백에 따뜻한 회색 면을 더하고, 버튼 등 일부에만 파랑을 쓴다.",
    typography: { traits: "Inter 계열 산세리프. 헤드라인은 굵고 크게, 본문은 문서처럼 읽기 편한 크기." },
    layout: { type: "minimal", density: "comfortable", whitespace: "generous" },
    ui: { radius: "slight", shadow: "subtle", depth: "flat", imageStyle: ["illustration", "product"] },
    characteristics: [
      "흑백 손그림 캐릭터 일러스트로 친근함을 더한다",
      "제품 화면을 그대로 보여 주는 구성",
      "장식을 줄이고 글과 여백으로 위계를 만든다"
    ],
    bestFor: ["업무·생산성 도구", "문서·지식 서비스", "스타트업 소개 페이지"],
    avoid: ["일러스트 없이 따라 하면 너무 건조해 보인다", "흑백 위주라 브랜드 개성을 보여 줄 장치가 따로 필요하다"],
    updatedAt: "2026-10-14"
  },
  linear: {
    moods: ["technical", "modern", "minimal"],
    keywords: ["다크 UI", "은은한 빛 효과", "얇은 테두리", "정교한 제품 화면", "SaaS"],
    palette: [
      { hex: "#08090a", role: "배경" },
      { hex: "#f7f8f8", role: "텍스트" },
      { hex: "#8a8f98", role: "보조 텍스트" },
      { hex: "#5e6ad2", role: "포인트" }
    ],
    colorNote: "검정에 가까운 배경에서 회색 단계로 위계를 만들고, 보라는 아주 적게 쓴다.",
    typography: { traits: "Inter 계열. 큰 헤드라인은 자간을 좁히고, 문장 일부를 흐린 회색으로 처리해 단계감을 준다." },
    layout: { type: "grid", density: "comfortable", whitespace: "generous" },
    ui: { radius: "slight", shadow: "subtle", depth: "layered", imageStyle: ["product", "3d"] },
    characteristics: [
      "1px 얇은 테두리와 은은한 빛으로 깊이를 표현한다",
      "제품 화면 캡처가 핵심 이미지",
      "스크롤에 맞춰 차분하게 나타나는 움직임"
    ],
    bestFor: ["개발자 도구·B2B SaaS", "테크 스타트업", "제품 소개 랜딩 페이지"],
    avoid: ["어두운 회색 단계가 많아 화면에 따라 구분이 어렵다", "분위기만 따라 하면 흔한 다크 SaaS 느낌이 된다"],
    updatedAt: "2026-10-14"
  },
  stripe: {
    moods: ["technical", "modern", "bold"],
    keywords: ["그라데이션 배경", "기울어진 섹션", "코드 예시", "정교한 도식", "SaaS"],
    palette: [
      { hex: "#ffffff", role: "배경" },
      { hex: "#0a2540", role: "텍스트" },
      { hex: "#635bff", role: "포인트" },
      { hex: "#00d4ff", role: "그라데이션" },
      { hex: "#ff7600", role: "그라데이션" }
    ],
    colorNote: "흰 배경과 짙은 남색 글자 위에, 보라·하늘·주황이 섞인 그라데이션을 상단에 크게 쓴다.",
    typography: { traits: "얇고 정갈한 산세리프(Söhne 계열). 굵기를 낮춘 큰 헤드라인으로 차분한 신뢰감." },
    layout: { type: "grid", density: "comfortable", whitespace: "generous" },
    ui: { radius: "slight", shadow: "subtle", depth: "layered", imageStyle: ["illustration", "product", "3d"] },
    characteristics: [
      "움직이는 그라데이션이 첫인상을 만든다",
      "복잡한 기능을 도식·코드 조각으로 보여 준다",
      "정보량이 많아도 그리드 정렬로 정돈한다"
    ],
    bestFor: ["핀테크·결제 서비스", "개발자 대상 API 서비스", "신뢰가 중요한 B2B"],
    avoid: ["그라데이션을 과하게 쓰면 글자가 잘 안 읽힌다", "움직임이 많아 성능 관리가 필요하다"],
    updatedAt: "2026-10-14"
  },
  toss: {
    moods: ["minimal", "friendly", "modern"],
    keywords: ["토스 블루", "큰 문장", "넉넉한 여백", "3D 아이콘"],
    feel: ["쉬움", "신뢰", "가벼움"],
    analysis:
      "한 화면에 큰 문장 하나만 두고 나머지를 비워, 금융처럼 어려운 내용을 대화하듯 쉽게 읽히게 만든다. 촘촘하게 나눈 회색 단계와 단 하나의 파란 강조색이 위계를 담당한다.",
    palette: [
      { hex: "#3182f6", role: "토스 블루 (버튼·강조)", group: "primary" },
      { hex: "#ffffff", role: "기본 배경", group: "neutral" },
      { hex: "#f2f4f6", role: "보조 배경·카드 면", group: "neutral" },
      { hex: "#191f28", role: "제목 텍스트", group: "neutral" },
      { hex: "#4e5968", role: "본문 텍스트", group: "neutral" },
      { hex: "#8b95a1", role: "보조 텍스트", group: "neutral" },
      { hex: "#e5e8eb", role: "구분선", group: "neutral" }
    ],
    colorNote: "흰 바탕과 연회색 면, 파랑은 버튼과 강조에만. 회색을 촘촘한 단계로 나눠 위계를 만든다.",
    typography: {
      family: "Toss Product Sans (자체 서체)",
      heading: "크고 굵은 한두 줄 문장, 말하듯 쉬운 표현",
      body: "넉넉한 줄 간격, 회색 농도로 중요도를 나눔",
      weight: "Regular · Semibold · Bold",
      traits: "문장 자체가 디자인이다. 설명문 대신 사용자에게 말을 거는 짧은 문장을 크게 보여 준다.",
      sample: { heading: "송금, 이제 쉽고 간편하게", body: "계좌번호를 몰라도 연락처만 있으면 바로 보낼 수 있어요.", weight: 700, tracking: "-0.02em" }
    },
    layout: {
      type: "full-width",
      density: "spacious",
      whitespace: "generous",
      width: "mixed",
      alignment: "mixed",
      grid: "문장과 앱 화면 이미지가 좌우로 번갈아 나오는 2단 구성",
      blocks: ["nav", "hero", "split", "split", "text", "footer"]
    },
    ui: {
      radius: "round",
      shadow: "none",
      depth: "flat",
      imageStyle: ["3d", "illustration", "product"],
      components: {
        buttons: { shape: "rounded", style: "filled", note: "모서리가 둥근 큰 파란 버튼. 모바일에서는 화면 폭을 꽉 채우는 경우가 많다." },
        cards: { note: "테두리 없이 연회색 면과 둥근 모서리로 내용을 묶는다." },
        navigation: { type: "minimal", note: "로고와 몇 개의 메뉴만 있는 단순한 상단 바." }
      }
    },
    visual: {
      notes: ["입체감 있는 3D 아이콘과 오브젝트", "앱 화면을 휴대폰 틀에 담아 보여 줌", "배경은 비워 두고 오브젝트만 강조"],
      iconography: "둥글고 입체적인 이모지형 아이콘 (토스페이스)"
    },
    characteristics: [
      { title: "한 화면, 한 메시지", text: "한 번에 하나의 문장과 하나의 이미지만 보여 준다." },
      { title: "대화하는 문장", text: "설명문 대신 사용자에게 말을 거는 짧은 문장을 쓴다." },
      { title: "회색 단계로 만든 위계", text: "색을 늘리지 않고 회색 농도로 제목·본문·보조 정보를 나눈다." },
      { title: "부드러운 3D 그래픽", text: "딱딱한 금융 주제를 입체 아이콘으로 친근하게 바꾼다." }
    ],
    bestFor: ["금융·핀테크 서비스", "모바일 앱 소개 페이지", "복잡한 절차를 쉽게 설명해야 하는 서비스", "스타트업 서비스 랜딩"],
    avoid: [
      "문장이 길어지면 큰 글자 구성이 무너진다.",
      "3D 그래픽은 스타일을 통일해 제작해야 해서 비용이 든다.",
      "정보를 한 화면에 하나씩 나누면 비교·탐색이 많은 서비스에서는 스크롤이 길어진다."
    ],
    sources: [
      { label: "토스 공식 사이트", url: "https://toss.im", type: "official" },
      { label: "토스 기술 블로그", url: "https://toss.tech", type: "article", note: "디자인·개발 과정을 소개하는 글 모음" }
    ],
    updatedAt: "2026-10-14"
  },
  baemin: {
    moods: ["playful", "friendly", "bold"],
    keywords: ["민트 컬러", "자체 제작 서체", "말장난 카피", "일러스트"],
    palette: [
      { hex: "#2ac1bc", role: "브랜드 컬러" },
      { hex: "#ffffff", role: "배경" },
      { hex: "#333333", role: "텍스트" },
      { hex: "#f5f5f5", role: "보조 배경" }
    ],
    colorNote: "민트 하나를 브랜드 색으로 강하게 쓰고, 나머지는 흰색·검정으로 단순하게 둔다.",
    typography: { traits: "한나체·주아체·도현체 등 자체 제작 서체. 글자 자체가 브랜드 개성을 드러낸다." },
    layout: { type: "card", density: "comfortable", whitespace: "balanced" },
    ui: { radius: "round", shadow: "subtle", depth: "flat", imageStyle: ["illustration", "photography"] },
    characteristics: [
      "B급 감성의 말장난 카피가 디자인의 일부",
      "서체가 곧 브랜드 자산",
      "음식 사진과 일러스트를 함께 쓴다"
    ],
    bestFor: ["음식·생활 서비스", "친근한 커뮤니티", "유머가 어울리는 브랜드"],
    avoid: ["재치 있는 카피 없이 서체만 가져오면 어색하다", "신뢰가 중요한 금융·의료 분야에는 어울리지 않는다"],
    updatedAt: "2026-10-14"
  },
  musinsa: {
    industryGroup: "fashion",
    moods: ["minimal", "bold", "modern"],
    keywords: ["블랙앤화이트", "촘촘한 상품 그리드", "매거진식 기획전", "작은 글씨"],
    palette: [
      { hex: "#ffffff", role: "배경" },
      { hex: "#000000", role: "텍스트·버튼" },
      { hex: "#f1f1f1", role: "보조 배경" },
      { hex: "#a0a0a0", role: "보조 텍스트" }
    ],
    colorNote: "색을 거의 쓰지 않는 흑백 구성. 상품 사진이 유일한 색이다.",
    typography: { traits: "작고 단단한 고딕. 상품명·가격 정보를 촘촘하게 배치한다." },
    layout: { type: "grid", density: "compact", whitespace: "tight" },
    ui: { radius: "sharp", shadow: "none", depth: "flat", imageStyle: ["photography", "product"] },
    characteristics: [
      "색을 줄여 상품 사진을 돋보이게 한다",
      "한 화면에 많은 상품을 보여 주는 촘촘한 그리드",
      "각진 버튼과 이미지로 날카로운 인상"
    ],
    bestFor: ["패션·편집숍", "상품 수가 많은 쇼핑몰", "스트리트·트렌드 브랜드"],
    avoid: ["글씨가 작고 촘촘해 모바일에서 읽기 어려울 수 있다", "흑백만 쓰면 다른 브랜드와 구분이 약해진다"],
    updatedAt: "2026-10-14"
  },
  muji: {
    moods: ["minimal", "editorial"],
    keywords: ["무채색", "생활 장면 사진", "넉넉한 여백", "담백한 문장"],
    palette: [
      { hex: "#ffffff", role: "배경" },
      { hex: "#f7f5f0", role: "보조 배경" },
      { hex: "#3c3c3c", role: "텍스트" },
      { hex: "#7f0019", role: "로고·포인트" }
    ],
    colorNote: "흰색·베이지 배경에 무채색 글자. 로고의 짙은 붉은색만 포인트로 쓴다.",
    typography: { traits: "장식 없는 고딕. 크기 차이를 크게 두지 않아 차분하다." },
    layout: { type: "grid", density: "comfortable", whitespace: "generous" },
    ui: { radius: "sharp", shadow: "none", depth: "flat", imageStyle: ["lifestyle", "product"] },
    characteristics: [
      "생활 장면 사진으로 제품을 자연스럽게 보여 준다",
      "강조를 최소화해 차분한 톤을 유지한다",
      "정사각형 상품 그리드"
    ],
    bestFor: ["리빙·생활용품", "친환경·자연주의 브랜드", "카페·라이프스타일 공간"],
    avoid: ["사진 톤 관리가 안 되면 밋밋해 보인다", "구매 버튼 같은 행동 유도가 약해질 수 있다"],
    updatedAt: "2026-10-14"
  },
  chanel: {
    moods: ["luxury", "editorial", "minimal"],
    keywords: ["블랙앤화이트", "대문자 로고타입", "대형 화보", "넓은 여백"],
    palette: [
      { hex: "#ffffff", role: "배경" },
      { hex: "#000000", role: "텍스트·버튼" },
      { hex: "#d0d0d0", role: "구분선" }
    ],
    colorNote: "흑백만으로 구성한다. 색은 화보 사진에서만 나온다.",
    typography: { traits: "대문자 로고타입과 절제된 세리프·산세리프 조합. 글자 수를 최소화한다." },
    layout: { type: "editorial", density: "spacious", whitespace: "generous" },
    ui: { radius: "sharp", shadow: "none", depth: "flat", imageStyle: ["photography"] },
    characteristics: [
      "화보 사진을 크게 배치한 잡지 같은 구성",
      "버튼도 각진 흑백으로 장식을 최소화한다",
      "설명보다 이미지로 분위기를 전달한다"
    ],
    bestFor: ["명품·뷰티·패션", "갤러리·전시", "프리미엄 호텔·레스토랑"],
    avoid: ["사진 퀄리티가 핵심이라 촬영 부담이 크다", "정보가 많은 서비스에는 비효율적이다"],
    updatedAt: "2026-10-14"
  },

  // ----- 아래는 탐색용 기본 분류(무드·업종 그룹)만 정리한 브랜드. 상세 정보는 이후 단계에서 채운다. -----
  netflix: { moods: ["bold", "modern"] },
  figma: { industryGroup: "technology", moods: ["playful", "friendly", "modern"], keywords: ["컬러풀", "협업", "그리드", "SaaS"] },
  behance: { moods: ["modern", "bold"] },
  dribbble: { moods: ["playful", "friendly", "modern"] },
  awwwards: { moods: ["bold", "editorial", "modern"] },
  naver: { moods: ["modern", "friendly"] },
  kakao: { moods: ["friendly", "playful"] },
  coupang: { moods: ["modern", "friendly"] },
  line: { moods: ["friendly", "playful"] },
  uniqlo: { industryGroup: "fashion", moods: ["minimal", "bold", "modern"] },
  sony: { moods: ["minimal", "technical", "modern"] },
  nintendo: { moods: ["playful", "friendly", "bold"] },
  ikea: { moods: ["friendly", "bold"] },
  bmw: { moods: ["luxury", "technical", "modern"] },
  louisvuitton: { moods: ["luxury", "editorial"] },
  riotgames: { moods: ["bold", "modern"] },
  steam: { moods: ["technical", "modern"] },
  playstation: { moods: ["bold", "modern", "technical"] }
};
