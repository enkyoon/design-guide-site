-- 자동 생성 파일: sql/schema.sql + sql/seed.sql을 합친 것. Supabase SQL Editor에 통째로 붙여 넣고 Run.
-- 여러 번 실행해도 안전하다 (같은 slug는 덮어씀).

-- =====================================================================
-- 브랜드 레퍼런스 테이블 (Supabase SQL Editor에서 실행)
-- 여러 번 실행해도 안전하다. 데이터 입력은 sql/seed.sql.
-- 값 규칙은 MD/DATA_GUIDE.md 참고. 처음 설정은 이 파일 대신 sql/setup.sql 하나만 실행해도 된다.
-- =====================================================================

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),

  -- 기본 정보 (검색·필터·주소에 쓰므로 독립 칸)
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  website_url text not null,
  region text not null
    check (region in ('korea', 'usa', 'europe', 'japan', 'china', 'southeast-asia', 'other')),
  country text,                                   -- ISO 국가 코드 2자리 (예: US, KR, JP)
  industry text not null
    check (industry in ('technology', 'finance', 'commerce', 'fashion', 'media', 'food', 'travel',
                        'entertainment', 'education', 'mobility', 'healthcare', 'other')),
  industry_detail text,                           -- 세부 업종 (화면 표시용 자유 텍스트)
  theme text not null check (theme in ('light', 'dark', 'mixed')),
  color_tone text check (color_tone in ('warm', 'cool', 'grayish', 'multi')),
  description text not null,                      -- 한 줄 디자인 설명 (카드·상세 공통)
  analysis text,                                  -- 왜 이런 느낌인지 2~3문장 분석
  preview_image text,                             -- 첫 화면 캡처 이미지 경로 또는 URL (이미지 자체는 넣지 않음)
  preview_captured_on date,                       -- 캡처한 날

  -- 디자인 분류 (필터·검색)
  design_keywords text[] not null default '{}'
    check (design_keywords <@ array['minimal', 'modern', 'bold', 'editorial', 'luxury',
                                    'playful', 'friendly', 'technical']::text[]),
  mood text[] not null default '{}',              -- 느낌 (자유 텍스트, 예: 차분함)
  tags text[] not null default '{}',              -- 자유 키워드 (예: 넓은 여백)

  -- 상세 분석 (구조가 있는 데이터는 JSONB)
  colors jsonb not null default '{"primary": [], "secondary": [], "neutral": []}',
  typography jsonb not null default '{}',
  layout jsonb not null default '{}',
  ui_style jsonb not null default '{}',
  visual jsonb not null default '{}',
  design_characteristics jsonb not null default '[]',
  best_for text[] not null default '{}',
  things_to_avoid text[] not null default '{}',
  sources jsonb not null default '[]',

  -- 관리용
  review_status text not null default 'draft' check (review_status in ('draft', 'reviewed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 이미 테이블을 만든 뒤라면 새 칸만 추가 (여러 번 실행해도 안전)
alter table public.brands add column if not exists preview_image text;
alter table public.brands add column if not exists preview_captured_on date;

-- 수정할 때마다 updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists brands_set_updated_at on public.brands;
create trigger brands_set_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

-- 보안: 누구나 읽기만 가능. 쓰기 정책을 만들지 않으므로
-- 브라우저(anon/publishable key)에서는 추가·수정·삭제가 모두 막힌다.
-- 데이터 입력은 SQL Editor(관리자 권한)에서만 한다.
alter table public.brands enable row level security;

drop policy if exists "brands are publicly readable" on public.brands;
create policy "brands are publicly readable"
  on public.brands for select
  to anon, authenticated
  using (true);

-- 참고: 예전 sites 테이블은 이 화면에서 더 이상 쓰지 않는다.
-- brands 데이터가 정상으로 보이는 것을 확인한 뒤 필요하면 아래를 실행해 정리한다.
-- drop table if exists public.sites;

-- 자동 생성 파일: 직접 고치지 말고 data/brands.json을 고친 뒤 tools/build-seed.ps1을 실행하세요.
-- 브랜드 69개. sql/schema.sql을 먼저 실행한 뒤 이 파일을 실행합니다.
-- 같은 slug가 이미 있으면 내용을 덮어씁니다(여러 번 실행해도 안전).

insert into public.brands (
  slug, name, website_url, region, country, industry, industry_detail, theme, color_tone, description, analysis, preview_image, preview_captured_on, design_keywords, mood, tags, colors, typography, layout, ui_style, visual, design_characteristics, best_for, things_to_avoid, sources, review_status
)
select
  r.slug,
  r.name,
  r.website_url,
  r.region,
  r.country,
  r.industry,
  r.industry_detail,
  r.theme,
  r.color_tone,
  r.description,
  r.analysis,
  r.preview_image,
  r.preview_captured_on,
  coalesce(r.design_keywords, '{}'::text[]),
  coalesce(r.mood, '{}'::text[]),
  coalesce(r.tags, '{}'::text[]),
  coalesce(r.colors, '{"primary": [], "secondary": [], "neutral": []}'::jsonb),
  coalesce(r.typography, '{}'::jsonb),
  coalesce(r.layout, '{}'::jsonb),
  coalesce(r.ui_style, '{}'::jsonb),
  coalesce(r.visual, '{}'::jsonb),
  coalesce(r.design_characteristics, '[]'::jsonb),
  coalesce(r.best_for, '{}'::text[]),
  coalesce(r.things_to_avoid, '{}'::text[]),
  coalesce(r.sources, '[]'::jsonb),
  coalesce(r.review_status, 'draft')
from jsonb_populate_recordset(null::public.brands, $seed$
[
  {
    "slug": "apple",
    "name": "Apple",
    "website_url": "https://www.apple.com",
    "region": "usa",
    "country": "US",
    "industry": "technology",
    "industry_detail": "테크/전자기기",
    "theme": "light",
    "color_tone": "grayish",
    "description": "절제된 여백과 큼직한 타이포로 제품 자체에 시선을 집중시키는 미니멀 디자인",
    "analysis": "넓은 여백과 정밀한 타이포, 제품 중심의 시각 위계가 철저하게 통제된 프리미엄 경험을 만든다. 장식을 거의 쓰지 않고 '큰 제품 이미지 + 짧은 헤드라인' 한 쌍을 섹션마다 반복해 리듬을 만든다.",
    "preview_image": "assets/previews/apple.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "minimal",
      "luxury"
    ],
    "mood": [
      "차분함",
      "정제됨",
      "자신감"
    ],
    "tags": [
      "넓은 여백",
      "제품 중심",
      "큰 헤드라인",
      "섹션 단위 구성"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#0071e3",
          "role": "버튼·링크 강조"
        }
      ],
      "secondary": [
        {
          "hex": "#000000",
          "role": "어두운 섹션 배경"
        }
      ],
      "neutral": [
        {
          "hex": "#ffffff",
          "role": "기본 배경"
        },
        {
          "hex": "#f5f5f7",
          "role": "보조 섹션 배경"
        },
        {
          "hex": "#1d1d1f",
          "role": "본문 텍스트"
        },
        {
          "hex": "#6e6e73",
          "role": "보조 텍스트"
        },
        {
          "hex": "#d2d2d7",
          "role": "구분선"
        }
      ],
      "note": "흰색·연회색 배경에 거의 검은 텍스트. 유채색은 버튼과 링크의 파랑뿐이고, 화면의 색은 제품 사진이 맡는다."
    },
    "typography": {
      "family": "SF Pro (Display · Text)",
      "category": "sans",
      "heading": "크고 굵게, 한두 줄로 짧게. 자간을 살짝 좁혀 단단한 인상",
      "body": "중간 크기의 담백한 문장, 보조 설명은 회색으로 한 단계 낮춤",
      "weights": [
        "Regular",
        "Semibold",
        "Bold"
      ],
      "description": "크기 대비가 위계를 만든다. 헤드라인은 아주 크고 본문은 작게 두어, 읽는 순서가 자연스럽게 정해진다.",
      "sample": {
        "heading": "Pro. Beyond.",
        "body": "가볍고 강력하게. 하루 종일 가는 배터리와 함께.",
        "weight": 700,
        "tracking": "-0.02em"
      }
    },
    "layout": {
      "type": "full-width",
      "content_width": "mixed",
      "alignment": "center",
      "whitespace": "generous",
      "density": "spacious",
      "grid": "섹션마다 1~2단의 단순한 모듈 그리드",
      "blocks": [
        "nav",
        "hero",
        "full-image",
        "grid-2",
        "text",
        "footer"
      ]
    },
    "ui_style": {
      "radius": "round",
      "shadow": "none",
      "depth": "flat",
      "button": {
        "shape": "pill",
        "style": "filled",
        "note": "작은 알약형 파란 버튼과 '더 알아보기 >' 텍스트 링크를 짝지어 쓴다."
      },
      "card": {
        "note": "테두리 없이 연회색 배경과 큰 둥근 모서리로 구분한다."
      },
      "navigation": {
        "type": "minimal",
        "note": "얇은 상단 바에 카테고리만 나열하고, 제품 페이지에서는 보조 내비게이션이 따로 붙는다."
      }
    },
    "visual": {
      "image_style": [
        "product",
        "3d"
      ],
      "characteristics": [
        "깨끗한 단색 배경",
        "화면을 가득 채우는 큰 제품 크기",
        "시각적 잡음 최소화",
        "조명이 통제된 제품 렌더링"
      ],
      "icon_style": "얇고 단순한 선 아이콘",
      "graphics": "장식 그래픽 대신 제품 이미지와 여백이 화면을 채운다"
    },
    "design_characteristics": [
      {
        "title": "넓은 여백",
        "text": "콘텐츠 블록 사이를 넉넉히 띄워 고급스러운 리듬을 유지한다."
      },
      {
        "title": "제품이 주인공",
        "text": "큰 제품 이미지가 위계를 지배하고, 카피는 짧게 받친다."
      },
      {
        "title": "통제된 타이포",
        "text": "큰 헤드라인과 짧은 본문으로 읽는 순서가 분명하다."
      },
      {
        "title": "장식 최소화",
        "text": "테두리·그림자·장식 요소를 의도적으로 줄인다."
      }
    ],
    "best_for": [
      "프리미엄 제품 출시 페이지",
      "전자기기·하드웨어 소개",
      "고가 제품 쇼핑몰",
      "미니멀한 기업 사이트"
    ],
    "things_to_avoid": [
      "넓은 여백은 정보가 많은 서비스에서 비효율적이다.",
      "극단적으로 단순한 메뉴는 원하는 정보를 찾기 어렵게 만들 수 있다.",
      "큰 제품 이미지를 쓰려면 고품질 비주얼 자료가 필요하다.",
      "좋은 이미지 없이 스타일만 따라 하면 사이트가 텅 비어 보인다."
    ],
    "sources": [
      {
        "type": "official",
        "label": "Apple 공식 사이트",
        "url": "https://www.apple.com"
      },
      {
        "type": "guideline",
        "label": "Apple Human Interface Guidelines",
        "url": "https://developer.apple.com/design/human-interface-guidelines/",
        "note": "앱 디자인 가이드. 웹사이트와 일부 원칙을 공유한다."
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "nike",
    "name": "Nike",
    "website_url": "https://www.nike.com",
    "region": "usa",
    "country": "US",
    "industry": "fashion",
    "industry_detail": "스포츠웨어",
    "theme": "light",
    "color_tone": "grayish",
    "description": "흑백 대비와 다이내믹한 이미지 크롭으로 스포츠의 에너지를 표현",
    "preview_image": "assets/previews/nike.jpg",
    "preview_captured_on": "2026-10-15",
    "analysis": "흑백 바탕 위에 화면을 꽉 채운 캠페인 사진과 아주 굵은 대문자 헤드라인을 올려, 색 대신 사진과 글자의 힘으로 에너지를 만든다. 쇼핑 영역은 반대로 담백한 그리드로 정리해 캠페인과 상품 탐색의 온도를 나눈다.",
    "design_keywords": [
      "bold",
      "editorial"
    ],
    "mood": [
      "역동적",
      "자신감",
      "직설적"
    ],
    "tags": [
      "흑백 대비",
      "대형 캠페인 사진",
      "굵은 대문자 헤드라인"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#111111",
          "role": "텍스트·버튼 (브랜드 블랙)"
        }
      ],
      "secondary": [
        {
          "hex": "#fa5400",
          "role": "할인·알림 포인트"
        }
      ],
      "neutral": [
        {
          "hex": "#ffffff",
          "role": "기본 배경"
        },
        {
          "hex": "#f5f5f5",
          "role": "상품 이미지 배경"
        },
        {
          "hex": "#707072",
          "role": "보조 텍스트"
        },
        {
          "hex": "#e5e5e5",
          "role": "구분선"
        }
      ],
      "note": "흑백이 기본이고, 색은 거의 사진에서 나온다. 주황은 할인·알림 같은 작은 포인트에만 쓴다."
    },
    "typography": {
      "family": "Nike Futura (헤드라인) · Helvetica Now (본문)",
      "category": "custom",
      "heading": "아주 굵고 폭이 좁은 대문자, 줄 간격을 바짝 붙임",
      "body": "작고 담백한 산세리프, 상품명·가격은 굵기로만 구분",
      "weights": [
        "Medium (본문)",
        "Extra Bold Condensed (헤드라인)"
      ],
      "description": "헤드라인과 본문의 성격 차이가 매우 크다. 헤드라인은 그래픽처럼, 본문은 정보처럼 쓴다.",
      "sample": {
        "heading": "Just Do It.",
        "body": "새로운 시즌 컬렉션을 지금 만나 보세요.",
        "weight": 900,
        "upper": true,
        "condensed": true,
        "tracking": "-0.01em"
      }
    },
    "layout": {
      "type": "full-width",
      "content_width": "mixed",
      "alignment": "mixed",
      "whitespace": "balanced",
      "density": "comfortable",
      "grid": "캠페인은 전체 폭 1단, 상품 목록은 3~4단 그리드",
      "blocks": [
        "nav",
        "full-image",
        "text",
        "row-scroll",
        "grid-3",
        "footer"
      ]
    },
    "ui_style": {
      "radius": "round",
      "shadow": "none",
      "depth": "flat",
      "button": {
        "shape": "pill",
        "style": "filled",
        "note": "검정 또는 흰색 알약형 버튼. 사진 위에서는 흰색 버튼을 쓴다."
      },
      "card": {
        "note": "테두리·그림자 없이 연회색 배경의 정사각형 상품 사진과 짧은 텍스트로 구성한다."
      },
      "input": {
        "note": "연회색 배경의 둥근 알약형 검색창."
      },
      "navigation": {
        "type": "mega",
        "note": "상단 카테고리에 마우스를 올리면 큰 메가 메뉴가 펼쳐진다."
      }
    },
    "visual": {
      "image_style": [
        "photography",
        "product"
      ],
      "characteristics": [
        "운동선수의 움직임을 담은 역동적인 사진",
        "화면 끝까지 꽉 채운 과감한 크롭",
        "상품은 연회색 배경의 깔끔한 단독 컷"
      ],
      "graphics": "장식 그래픽 대신 큰 글자 자체를 그래픽처럼 쓴다"
    },
    "design_characteristics": [
      {
        "title": "사진이 메시지",
        "text": "설명보다 화면을 가득 채운 캠페인 사진이 먼저 말한다."
      },
      {
        "title": "글자가 곧 그래픽",
        "text": "굵은 대문자 헤드라인을 이미지처럼 크게 배치한다."
      },
      {
        "title": "흑백 + 한 점의 포인트",
        "text": "색을 아껴서 사진과 주황 포인트가 더 눈에 띈다."
      },
      {
        "title": "캠페인과 쇼핑의 분리",
        "text": "감성적인 캠페인 영역과 담백한 상품 그리드를 확실히 나눈다."
      }
    ],
    "best_for": [
      "스포츠·패션 브랜드",
      "캠페인·이벤트 랜딩 페이지",
      "메시지가 강한 브랜드 사이트",
      "이미지 중심 커머스"
    ],
    "things_to_avoid": [
      "사진 퀄리티가 받쳐 주지 않으면 밋밋해진다.",
      "굵은 영문 대문자 느낌은 한글로 그대로 옮기기 어렵다.",
      "강한 대비와 큰 글자가 많으면 정보형 서비스에서는 피로감을 준다."
    ],
    "sources": [
      {
        "type": "official",
        "label": "Nike 공식 사이트",
        "url": "https://www.nike.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "airbnb",
    "name": "Airbnb",
    "website_url": "https://www.airbnb.com",
    "region": "usa",
    "country": "US",
    "industry": "travel",
    "industry_detail": "여행/숙박",
    "theme": "light",
    "color_tone": "warm",
    "description": "따뜻한 코랄톤과 둥근 일러스트로 신뢰감 있는 여행 경험을 전달",
    "analysis": "흰 바탕과 둥근 카드, 통일된 사진 비율로 수많은 숙소를 정돈해 보여 준다. 코랄 레드는 로고와 핵심 버튼에만 쓰고, 화면의 색과 감성은 숙소 사진이 채운다.",
    "preview_image": "assets/previews/airbnb.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "friendly",
      "minimal"
    ],
    "mood": [
      "따뜻함",
      "친근함",
      "신뢰"
    ],
    "tags": [
      "코랄 포인트",
      "둥근 카드",
      "사진 중심 목록",
      "검색창 중심"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#ff385c",
          "role": "브랜드 코랄 (로고·예약 버튼)"
        }
      ],
      "neutral": [
        {
          "hex": "#ffffff",
          "role": "기본 배경"
        },
        {
          "hex": "#f7f7f7",
          "role": "보조 배경"
        },
        {
          "hex": "#222222",
          "role": "본문 텍스트"
        },
        {
          "hex": "#6a6a6a",
          "role": "보조 텍스트"
        },
        {
          "hex": "#dddddd",
          "role": "구분선·테두리"
        }
      ],
      "note": "흰 바탕에 코랄 레드는 로고와 주요 버튼에만. 화면의 색은 숙소 사진이 채운다."
    },
    "typography": {
      "family": "Airbnb Cereal (자체 서체)",
      "category": "custom",
      "heading": "중간 크기의 굵은 제목, 크기보다 굵기로 위계를 만듦",
      "body": "읽기 편한 크기, 짙은 회색과 중간 회색 두 단계",
      "weights": [
        "Book",
        "Medium",
        "Bold"
      ],
      "description": "둥글고 부드러운 글자 형태가 친근한 인상을 만든다. 글자 크기 차이를 크게 두지 않아 화면이 차분하다.",
      "sample": {
        "heading": "어디로 떠나시나요?",
        "body": "전 세계의 독특한 숙소와 체험을 찾아보세요.",
        "weight": 600
      }
    },
    "layout": {
      "type": "card",
      "content_width": "contained",
      "alignment": "left",
      "whitespace": "balanced",
      "density": "comfortable",
      "grid": "화면 폭에 따라 2~6단으로 늘어나는 카드 그리드",
      "blocks": [
        "nav",
        "search",
        "grid-4",
        "grid-4",
        "footer"
      ]
    },
    "ui_style": {
      "radius": "round",
      "shadow": "subtle",
      "depth": "layered",
      "button": {
        "shape": "rounded",
        "style": "filled",
        "note": "코랄 계열의 둥근 사각 버튼은 예약처럼 가장 중요한 행동에만 쓴다."
      },
      "card": {
        "note": "테두리 없이 둥근 모서리 사진과 아래 텍스트로 구성. 사진이 카드 대부분을 차지한다."
      },
      "input": {
        "note": "그림자가 살짝 있는 알약형 검색 바. 칸을 나눠 장소·날짜·인원을 입력한다."
      },
      "navigation": {
        "type": "minimal",
        "note": "로고 · 가운데 검색 바 · 오른쪽 메뉴로 이뤄진 단순한 상단 바."
      }
    },
    "visual": {
      "image_style": [
        "photography"
      ],
      "characteristics": [
        "숙소 사진이 화면 대부분을 차지",
        "사진 비율을 통일해 목록을 정돈",
        "사람과 공간이 함께 나오는 따뜻한 사진"
      ],
      "icon_style": "카테고리 메뉴의 작고 단순한 아이콘"
    },
    "design_characteristics": [
      {
        "title": "사진 중심 카드 그리드",
        "text": "같은 비율의 사진 카드를 반복해 많은 숙소를 정돈해 보여 준다."
      },
      {
        "title": "검색 바가 주인공",
        "text": "화면 상단 가운데의 검색 바가 첫 행동을 안내한다."
      },
      {
        "title": "부드러운 둥근 형태",
        "text": "카드·버튼·검색 바 모두 둥근 모서리로 친근함을 만든다."
      },
      {
        "title": "아껴 쓰는 그림자",
        "text": "그림자는 검색 바·팝업처럼 떠 있는 요소에만 약하게 쓴다."
      }
    ],
    "best_for": [
      "예약·숙박·여행 서비스",
      "사진 목록이 많은 마켓플레이스",
      "지역 기반 서비스",
      "친근한 분위기의 커머스"
    ],
    "things_to_avoid": [
      "사진 톤이 제각각이면 카드 그리드가 산만해진다.",
      "포인트 컬러를 여러 곳에 쓰면 강조 효과가 사라진다.",
      "사진이 부족한 서비스에서는 카드가 빈약해 보인다."
    ],
    "sources": [
      {
        "type": "official",
        "label": "Airbnb 공식 사이트",
        "url": "https://www.airbnb.com"
      },
      {
        "type": "article",
        "label": "Airbnb Design",
        "url": "https://airbnb.design",
        "note": "Airbnb 디자인 팀의 글 모음"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "spotify",
    "name": "Spotify",
    "website_url": "https://www.spotify.com",
    "region": "europe",
    "country": "SE",
    "industry": "entertainment",
    "industry_detail": "음악",
    "theme": "dark",
    "color_tone": "cool",
    "description": "짙은 다크 배경 위 시그니처 그린으로 몰입감 있는 음악 경험을 강조",
    "analysis": "거의 검은 배경 위에서 앨범 아트가 색을 맡고, 시그니처 그린은 '재생'처럼 핵심 행동에만 아껴 쓴다. 홍보 페이지는 반대로 쨍한 색과 굵은 글자를 대담하게 써서 서비스 화면과 다른 에너지를 낸다.",
    "preview_image": "assets/previews/spotify.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "bold",
      "playful"
    ],
    "mood": [
      "몰입",
      "생동감",
      "젊음"
    ],
    "tags": [
      "다크 배경",
      "시그니처 그린",
      "앨범 아트 중심",
      "굵은 타이포"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#1db954",
          "role": "시그니처 그린 (재생·주요 버튼)"
        }
      ],
      "neutral": [
        {
          "hex": "#121212",
          "role": "기본 배경"
        },
        {
          "hex": "#181818",
          "role": "카드 배경"
        },
        {
          "hex": "#282828",
          "role": "마우스를 올린 카드"
        },
        {
          "hex": "#ffffff",
          "role": "본문 텍스트"
        },
        {
          "hex": "#b3b3b3",
          "role": "보조 텍스트"
        }
      ],
      "note": "서비스 화면은 거의 검정 배경에 그린 포인트 하나. 홍보 페이지에서는 쨍한 색 조합을 대담하게 쓴다."
    },
    "typography": {
      "family": "자체 산세리프 (Spotify Mix, 이전 Circular)",
      "category": "custom",
      "heading": "굵고 꽉 찬 산세리프, 짧고 리듬감 있는 문구",
      "body": "작은 크기의 흰색·회색 텍스트, 두 단계 회색으로 위계",
      "weights": [
        "Regular",
        "Bold",
        "Black"
      ],
      "description": "어두운 배경에서도 또렷하게 보이도록 헤드라인을 아주 굵게 쓴다. 본문은 작고 간결하다.",
      "sample": {
        "heading": "지금 듣고 싶은 모든 음악",
        "body": "나만을 위한 플레이리스트와 새로운 음악을 만나 보세요.",
        "weight": 800,
        "tracking": "-0.02em"
      }
    },
    "layout": {
      "type": "card",
      "content_width": "full",
      "alignment": "left",
      "whitespace": "balanced",
      "density": "comfortable",
      "grid": "왼쪽 사이드바 + 가로로 넘기는 카드 줄 여러 개",
      "blocks": [
        "nav",
        "hero",
        "row-scroll",
        "row-scroll",
        "grid-4",
        "footer"
      ]
    },
    "ui_style": {
      "radius": "round",
      "shadow": "subtle",
      "depth": "layered",
      "button": {
        "shape": "pill",
        "style": "filled",
        "note": "그린 원형 재생 버튼과 알약형 버튼. 보조 버튼은 테두리형을 쓴다."
      },
      "card": {
        "note": "테두리 없이 살짝 밝은 어두운 면 위에 정사각형 커버. 마우스를 올리면 면이 밝아진다."
      },
      "input": {
        "note": "어두운 배경의 둥근 알약형 검색창."
      },
      "navigation": {
        "type": "sidebar",
        "note": "웹 플레이어는 왼쪽 고정 사이드바와 하단 재생 바로 구성된다."
      }
    },
    "visual": {
      "image_style": [
        "photography",
        "illustration"
      ],
      "characteristics": [
        "앨범·플레이리스트 커버가 화면의 색을 결정",
        "홍보 페이지는 원색 배경 + 잘라낸 인물 사진 콜라주",
        "정사각형 커버 이미지의 반복"
      ],
      "icon_style": "꽉 찬(Filled) 단순한 아이콘"
    },
    "design_characteristics": [
      {
        "title": "콘텐츠가 색을 낸다",
        "text": "배경은 어둡게 비워 두고 앨범 아트가 화면의 색을 채운다."
      },
      {
        "title": "아껴 쓰는 그린",
        "text": "브랜드 그린은 재생 같은 핵심 행동에만 써서 눈에 잘 띈다."
      },
      {
        "title": "가로 스크롤 진열대",
        "text": "주제별 카드 줄을 쌓아 많은 콘텐츠를 빠르게 훑게 한다."
      },
      {
        "title": "두 가지 얼굴",
        "text": "차분한 서비스 화면과 대담한 홍보 화면을 분명히 구분한다."
      }
    ],
    "best_for": [
      "음악·영상 스트리밍",
      "콘텐츠 큐레이션 플랫폼",
      "다크 모드 중심 앱",
      "젊은 층 대상 서비스"
    ],
    "things_to_avoid": [
      "다크 배경 위 작은 회색 글자는 대비가 낮아지기 쉽다.",
      "포인트 그린을 넓은 면에 쓰면 눈이 피로하다.",
      "커버 이미지가 없으면 화면이 단조로운 검은 면이 된다."
    ],
    "sources": [
      {
        "type": "official",
        "label": "Spotify 공식 사이트",
        "url": "https://www.spotify.com"
      },
      {
        "type": "guideline",
        "label": "Spotify Design Guidelines",
        "url": "https://developer.spotify.com/documentation/design",
        "note": "Spotify 콘텐츠·로고를 쓸 때의 가이드"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "netflix",
    "name": "Netflix",
    "website_url": "https://www.netflix.com",
    "region": "usa",
    "country": "US",
    "industry": "entertainment",
    "industry_detail": "미디어/엔터",
    "theme": "dark",
    "color_tone": "warm",
    "description": "블랙 배경과 강렬한 레드 포인트로 몰입형 스트리밍 무드를 연출",
    "preview_image": "assets/previews/netflix.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "bold",
      "modern"
    ],
    "tags": [
      "임팩트",
      "몰입감",
      "엔터테인먼트"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#141414"
        },
        {
          "hex": "#e50914"
        },
        {
          "hex": "#ffffff"
        }
      ]
    },
    "typography": {
      "family": "Netflix Sans (custom)",
      "category": "custom"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.netflix.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "notion",
    "name": "Notion",
    "website_url": "https://www.notion.so",
    "region": "usa",
    "country": "US",
    "industry": "technology",
    "industry_detail": "생산성",
    "theme": "light",
    "color_tone": "grayish",
    "description": "군더더기 없는 흑백 톤과 명확한 위계로 생산성에 집중한 구성",
    "preview_image": "assets/previews/notion.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "minimal",
      "friendly",
      "editorial"
    ],
    "tags": [
      "흑백 위주",
      "손그림 일러스트",
      "문서 같은 구성",
      "가벼운 UI",
      "SaaS"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#2383e2",
          "role": "버튼·링크"
        }
      ],
      "neutral": [
        {
          "hex": "#ffffff",
          "role": "배경"
        },
        {
          "hex": "#191919",
          "role": "텍스트"
        },
        {
          "hex": "#f7f6f3",
          "role": "보조 배경"
        }
      ],
      "note": "흑백에 따뜻한 회색 면을 더하고, 버튼 등 일부에만 파랑을 쓴다."
    },
    "typography": {
      "family": "Inter",
      "category": "sans",
      "description": "Inter 계열 산세리프. 헤드라인은 굵고 크게, 본문은 문서처럼 읽기 편한 크기."
    },
    "layout": {
      "type": "minimal",
      "whitespace": "generous",
      "density": "comfortable"
    },
    "ui_style": {
      "radius": "slight",
      "shadow": "subtle",
      "depth": "flat"
    },
    "visual": {
      "image_style": [
        "illustration",
        "product"
      ]
    },
    "design_characteristics": [
      {
        "title": "흑백 손그림 캐릭터 일러스트로 친근함을 더한다"
      },
      {
        "title": "제품 화면을 그대로 보여 주는 구성"
      },
      {
        "title": "장식을 줄이고 글과 여백으로 위계를 만든다"
      }
    ],
    "best_for": [
      "업무·생산성 도구",
      "문서·지식 서비스",
      "스타트업 소개 페이지"
    ],
    "things_to_avoid": [
      "일러스트 없이 따라 하면 너무 건조해 보인다",
      "흑백 위주라 브랜드 개성을 보여 줄 장치가 따로 필요하다"
    ],
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.notion.so"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "linear",
    "name": "Linear",
    "website_url": "https://linear.app",
    "region": "usa",
    "country": "US",
    "industry": "technology",
    "industry_detail": "생산성",
    "theme": "dark",
    "color_tone": "cool",
    "description": "딥퍼플 그라데이션과 정교한 인터랙션으로 세련된 개발자 경험을 구현",
    "preview_image": "assets/previews/linear.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "technical",
      "modern",
      "minimal"
    ],
    "tags": [
      "다크 UI",
      "은은한 빛 효과",
      "얇은 테두리",
      "정교한 제품 화면",
      "SaaS"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#5e6ad2",
          "role": "포인트"
        }
      ],
      "neutral": [
        {
          "hex": "#08090a",
          "role": "배경"
        },
        {
          "hex": "#f7f8f8",
          "role": "텍스트"
        },
        {
          "hex": "#8a8f98",
          "role": "보조 텍스트"
        }
      ],
      "note": "검정에 가까운 배경에서 회색 단계로 위계를 만들고, 보라는 아주 적게 쓴다."
    },
    "typography": {
      "family": "Inter",
      "category": "sans",
      "description": "Inter 계열. 큰 헤드라인은 자간을 좁히고, 문장 일부를 흐린 회색으로 처리해 단계감을 준다."
    },
    "layout": {
      "type": "grid",
      "whitespace": "generous",
      "density": "comfortable"
    },
    "ui_style": {
      "radius": "slight",
      "shadow": "subtle",
      "depth": "layered"
    },
    "visual": {
      "image_style": [
        "product",
        "3d"
      ]
    },
    "design_characteristics": [
      {
        "title": "1px 얇은 테두리와 은은한 빛으로 깊이를 표현한다"
      },
      {
        "title": "제품 화면 캡처가 핵심 이미지"
      },
      {
        "title": "스크롤에 맞춰 차분하게 나타나는 움직임"
      }
    ],
    "best_for": [
      "개발자 도구·B2B SaaS",
      "테크 스타트업",
      "제품 소개 랜딩 페이지"
    ],
    "things_to_avoid": [
      "어두운 회색 단계가 많아 화면에 따라 구분이 어렵다",
      "분위기만 따라 하면 흔한 다크 SaaS 느낌이 된다"
    ],
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://linear.app"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "figma",
    "name": "Figma",
    "website_url": "https://www.figma.com",
    "region": "usa",
    "country": "US",
    "industry": "technology",
    "industry_detail": "디자인 툴",
    "theme": "light",
    "color_tone": "multi",
    "description": "다채로운 브랜드 컬러와 명료한 그리드로 창의적인 협업 무드를 표현",
    "preview_image": "assets/previews/figma.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "playful",
      "friendly",
      "modern"
    ],
    "tags": [
      "컬러풀",
      "협업",
      "그리드",
      "SaaS"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#0acf83"
        },
        {
          "hex": "#a259ff"
        },
        {
          "hex": "#f24e1e"
        },
        {
          "hex": "#1abcfe"
        }
      ]
    },
    "typography": {
      "family": "Inter",
      "category": "sans"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.figma.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "stripe",
    "name": "Stripe",
    "website_url": "https://stripe.com",
    "region": "usa",
    "country": "US",
    "industry": "finance",
    "industry_detail": "금융",
    "theme": "light",
    "color_tone": "cool",
    "description": "인디고 그라데이션과 정교한 모션으로 신뢰감 있는 개발자 경험을 전달",
    "preview_image": "assets/previews/stripe.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "technical",
      "modern",
      "bold"
    ],
    "tags": [
      "그라데이션 배경",
      "기울어진 섹션",
      "코드 예시",
      "정교한 도식",
      "SaaS"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#635bff",
          "role": "포인트"
        }
      ],
      "secondary": [
        {
          "hex": "#00d4ff",
          "role": "그라데이션"
        },
        {
          "hex": "#ff7600",
          "role": "그라데이션"
        }
      ],
      "neutral": [
        {
          "hex": "#ffffff",
          "role": "배경"
        },
        {
          "hex": "#0a2540",
          "role": "텍스트"
        }
      ],
      "note": "흰 배경과 짙은 남색 글자 위에, 보라·하늘·주황이 섞인 그라데이션을 상단에 크게 쓴다."
    },
    "typography": {
      "family": "system sans",
      "category": "sans",
      "description": "얇고 정갈한 산세리프(Söhne 계열). 굵기를 낮춘 큰 헤드라인으로 차분한 신뢰감."
    },
    "layout": {
      "type": "grid",
      "whitespace": "generous",
      "density": "comfortable"
    },
    "ui_style": {
      "radius": "slight",
      "shadow": "subtle",
      "depth": "layered"
    },
    "visual": {
      "image_style": [
        "illustration",
        "product",
        "3d"
      ]
    },
    "design_characteristics": [
      {
        "title": "움직이는 그라데이션이 첫인상을 만든다"
      },
      {
        "title": "복잡한 기능을 도식·코드 조각으로 보여 준다"
      },
      {
        "title": "정보량이 많아도 그리드 정렬로 정돈한다"
      }
    ],
    "best_for": [
      "핀테크·결제 서비스",
      "개발자 대상 API 서비스",
      "신뢰가 중요한 B2B"
    ],
    "things_to_avoid": [
      "그라데이션을 과하게 쓰면 글자가 잘 안 읽힌다",
      "움직임이 많아 성능 관리가 필요하다"
    ],
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://stripe.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "behance",
    "name": "Behance",
    "website_url": "https://www.behance.net",
    "region": "usa",
    "country": "US",
    "industry": "media",
    "industry_detail": "포트폴리오",
    "theme": "light",
    "color_tone": "cool",
    "description": "강렬한 블루 포인트와 카드형 그리드로 작업물을 돋보이게 배치",
    "preview_image": "assets/previews/behance.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "bold",
      "editorial"
    ],
    "tags": [
      "갤러리",
      "그리드",
      "포트폴리오"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#0057ff"
        },
        {
          "hex": "#ffffff"
        },
        {
          "hex": "#191919"
        }
      ]
    },
    "typography": {
      "family": "system sans",
      "category": "sans"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.behance.net"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "dribbble",
    "name": "Dribbble",
    "website_url": "https://dribbble.com",
    "region": "usa",
    "country": "US",
    "industry": "media",
    "industry_detail": "포트폴리오",
    "theme": "light",
    "color_tone": "warm",
    "description": "핑크 포인트 컬러와 밀도 높은 카드 그리드로 생동감 있는 커뮤니티를 표현",
    "preview_image": "assets/previews/dribbble.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "playful",
      "friendly"
    ],
    "tags": [
      "생동감",
      "커뮤니티",
      "카드형"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#ea4c89"
        },
        {
          "hex": "#ffffff"
        },
        {
          "hex": "#333333"
        }
      ]
    },
    "typography": {
      "family": "system sans",
      "category": "sans"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://dribbble.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "awwwards",
    "name": "Awwwards",
    "website_url": "https://www.awwwards.com",
    "region": "europe",
    "country": "ES",
    "industry": "media",
    "industry_detail": "디자인 어워드",
    "theme": "dark",
    "color_tone": "warm",
    "description": "다크 배경과 옐로우 포인트로 실험적이고 도전적인 웹디자인을 큐레이션",
    "preview_image": "assets/previews/awwwards.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "bold",
      "editorial"
    ],
    "tags": [
      "실험적",
      "큐레이션",
      "포인트컬러"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#0d0d0d"
        },
        {
          "hex": "#ffd200"
        },
        {
          "hex": "#ffffff"
        }
      ]
    },
    "typography": {
      "family": "system sans",
      "category": "sans"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.awwwards.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "naver",
    "name": "네이버",
    "website_url": "https://www.naver.com",
    "region": "korea",
    "country": "KR",
    "industry": "technology",
    "industry_detail": "포털",
    "theme": "light",
    "color_tone": "cool",
    "description": "시그니처 그린과 정보 밀도 높은 레이아웃으로 실용적인 포털 경험을 제공",
    "preview_image": "assets/previews/naver.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "modern",
      "friendly"
    ],
    "tags": [
      "정보형",
      "실용성",
      "포털"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#03c75a"
        },
        {
          "hex": "#ffffff"
        },
        {
          "hex": "#191919"
        }
      ]
    },
    "typography": {
      "family": "Pretendard",
      "category": "sans"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.naver.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "kakao",
    "name": "카카오",
    "website_url": "https://www.kakaocorp.com",
    "region": "korea",
    "country": "KR",
    "industry": "technology",
    "industry_detail": "메신저/SNS",
    "theme": "light",
    "color_tone": "warm",
    "description": "카카오 옐로우와 둥근 캐릭터 그래픽으로 친근한 브랜드 경험을 연출",
    "preview_image": "assets/previews/kakao.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "friendly",
      "playful"
    ],
    "tags": [
      "캐릭터",
      "브랜드"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#fee500"
        },
        {
          "hex": "#391b1b"
        },
        {
          "hex": "#ffffff"
        }
      ]
    },
    "typography": {
      "family": "Pretendard",
      "category": "sans"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.kakaocorp.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "toss",
    "name": "토스",
    "website_url": "https://toss.im",
    "region": "korea",
    "country": "KR",
    "industry": "finance",
    "industry_detail": "금융",
    "theme": "light",
    "color_tone": "cool",
    "description": "선명한 블루톤과 큼직한 타이포로 직관적인 금융 경험을 설계",
    "analysis": "한 화면에 큰 문장 하나만 두고 나머지를 비워, 금융처럼 어려운 내용을 대화하듯 쉽게 읽히게 만든다. 촘촘하게 나눈 회색 단계와 단 하나의 파란 강조색이 위계를 담당한다.",
    "preview_image": "assets/previews/toss.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "minimal",
      "friendly"
    ],
    "mood": [
      "쉬움",
      "신뢰",
      "가벼움"
    ],
    "tags": [
      "토스 블루",
      "큰 문장",
      "넉넉한 여백",
      "3D 아이콘"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#3182f6",
          "role": "토스 블루 (버튼·강조)"
        }
      ],
      "neutral": [
        {
          "hex": "#ffffff",
          "role": "기본 배경"
        },
        {
          "hex": "#f2f4f6",
          "role": "보조 배경·카드 면"
        },
        {
          "hex": "#191f28",
          "role": "제목 텍스트"
        },
        {
          "hex": "#4e5968",
          "role": "본문 텍스트"
        },
        {
          "hex": "#8b95a1",
          "role": "보조 텍스트"
        },
        {
          "hex": "#e5e8eb",
          "role": "구분선"
        }
      ],
      "note": "흰 바탕과 연회색 면, 파랑은 버튼과 강조에만. 회색을 촘촘한 단계로 나눠 위계를 만든다."
    },
    "typography": {
      "family": "Toss Product Sans (자체 서체)",
      "category": "custom",
      "heading": "크고 굵은 한두 줄 문장, 말하듯 쉬운 표현",
      "body": "넉넉한 줄 간격, 회색 농도로 중요도를 나눔",
      "weights": [
        "Regular",
        "Semibold",
        "Bold"
      ],
      "description": "문장 자체가 디자인이다. 설명문 대신 사용자에게 말을 거는 짧은 문장을 크게 보여 준다.",
      "sample": {
        "heading": "송금, 이제 쉽고 간편하게",
        "body": "계좌번호를 몰라도 연락처만 있으면 바로 보낼 수 있어요.",
        "weight": 700,
        "tracking": "-0.02em"
      }
    },
    "layout": {
      "type": "full-width",
      "content_width": "mixed",
      "alignment": "mixed",
      "whitespace": "generous",
      "density": "spacious",
      "grid": "문장과 앱 화면 이미지가 좌우로 번갈아 나오는 2단 구성",
      "blocks": [
        "nav",
        "hero",
        "split",
        "split",
        "text",
        "footer"
      ]
    },
    "ui_style": {
      "radius": "round",
      "shadow": "none",
      "depth": "flat",
      "button": {
        "shape": "rounded",
        "style": "filled",
        "note": "모서리가 둥근 큰 파란 버튼. 모바일에서는 화면 폭을 꽉 채우는 경우가 많다."
      },
      "card": {
        "note": "테두리 없이 연회색 면과 둥근 모서리로 내용을 묶는다."
      },
      "navigation": {
        "type": "minimal",
        "note": "로고와 몇 개의 메뉴만 있는 단순한 상단 바."
      }
    },
    "visual": {
      "image_style": [
        "3d",
        "illustration",
        "product"
      ],
      "characteristics": [
        "입체감 있는 3D 아이콘과 오브젝트",
        "앱 화면을 휴대폰 틀에 담아 보여 줌",
        "배경은 비워 두고 오브젝트만 강조"
      ],
      "icon_style": "둥글고 입체적인 이모지형 아이콘 (토스페이스)"
    },
    "design_characteristics": [
      {
        "title": "한 화면, 한 메시지",
        "text": "한 번에 하나의 문장과 하나의 이미지만 보여 준다."
      },
      {
        "title": "대화하는 문장",
        "text": "설명문 대신 사용자에게 말을 거는 짧은 문장을 쓴다."
      },
      {
        "title": "회색 단계로 만든 위계",
        "text": "색을 늘리지 않고 회색 농도로 제목·본문·보조 정보를 나눈다."
      },
      {
        "title": "부드러운 3D 그래픽",
        "text": "딱딱한 금융 주제를 입체 아이콘으로 친근하게 바꾼다."
      }
    ],
    "best_for": [
      "금융·핀테크 서비스",
      "모바일 앱 소개 페이지",
      "복잡한 절차를 쉽게 설명해야 하는 서비스",
      "스타트업 서비스 랜딩"
    ],
    "things_to_avoid": [
      "문장이 길어지면 큰 글자 구성이 무너진다.",
      "3D 그래픽은 스타일을 통일해 제작해야 해서 비용이 든다.",
      "정보를 한 화면에 하나씩 나누면 비교·탐색이 많은 서비스에서는 스크롤이 길어진다."
    ],
    "sources": [
      {
        "type": "official",
        "label": "토스 공식 사이트",
        "url": "https://toss.im"
      },
      {
        "type": "article",
        "label": "토스 기술 블로그",
        "url": "https://toss.tech",
        "note": "디자인·개발 과정을 소개하는 글 모음"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "coupang",
    "name": "쿠팡",
    "website_url": "https://www.coupang.com",
    "region": "korea",
    "country": "KR",
    "industry": "commerce",
    "industry_detail": "온라인 쇼핑",
    "theme": "light",
    "color_tone": "cool",
    "description": "로켓배송을 상징하는 블루 포인트와 밀도 높은 정보구조로 빠른 쇼핑을 지원",
    "preview_image": "assets/previews/coupang.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "bold",
      "friendly"
    ],
    "tags": [
      "정보형",
      "빠른탐색",
      "쇼핑"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#0073e6"
        },
        {
          "hex": "#ffffff"
        },
        {
          "hex": "#333333"
        }
      ]
    },
    "typography": {
      "family": "Pretendard",
      "category": "sans"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.coupang.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "musinsa",
    "name": "무신사",
    "website_url": "https://www.musinsa.com",
    "region": "korea",
    "country": "KR",
    "industry": "fashion",
    "industry_detail": "패션 플랫폼",
    "theme": "dark",
    "color_tone": "grayish",
    "description": "블랙앤화이트 기반의 스트리트 무드로 트렌디한 패션 감성을 연출",
    "preview_image": "assets/previews/musinsa.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "minimal",
      "bold",
      "modern"
    ],
    "tags": [
      "블랙앤화이트",
      "촘촘한 상품 그리드",
      "매거진식 기획전",
      "작은 글씨"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#000000",
          "role": "텍스트·버튼"
        }
      ],
      "neutral": [
        {
          "hex": "#ffffff",
          "role": "배경"
        },
        {
          "hex": "#f1f1f1",
          "role": "보조 배경"
        },
        {
          "hex": "#a0a0a0",
          "role": "보조 텍스트"
        }
      ],
      "note": "색을 거의 쓰지 않는 흑백 구성. 상품 사진이 유일한 색이다."
    },
    "typography": {
      "family": "Pretendard",
      "category": "sans",
      "description": "작고 단단한 고딕. 상품명·가격 정보를 촘촘하게 배치한다."
    },
    "layout": {
      "type": "grid",
      "whitespace": "tight",
      "density": "compact"
    },
    "ui_style": {
      "radius": "sharp",
      "shadow": "none",
      "depth": "flat"
    },
    "visual": {
      "image_style": [
        "photography",
        "product"
      ]
    },
    "design_characteristics": [
      {
        "title": "색을 줄여 상품 사진을 돋보이게 한다"
      },
      {
        "title": "한 화면에 많은 상품을 보여 주는 촘촘한 그리드"
      },
      {
        "title": "각진 버튼과 이미지로 날카로운 인상"
      }
    ],
    "best_for": [
      "패션·편집숍",
      "상품 수가 많은 쇼핑몰",
      "스트리트·트렌드 브랜드"
    ],
    "things_to_avoid": [
      "글씨가 작고 촘촘해 모바일에서 읽기 어려울 수 있다",
      "흑백만 쓰면 다른 브랜드와 구분이 약해진다"
    ],
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.musinsa.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "baemin",
    "name": "배달의민족",
    "website_url": "https://www.baemin.com",
    "region": "korea",
    "country": "KR",
    "industry": "food",
    "industry_detail": "음식 배달",
    "theme": "light",
    "color_tone": "cool",
    "description": "민트톤과 위트있는 한나체 타이포로 유쾌한 브랜드 개성을 표현",
    "preview_image": "assets/previews/baemin.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "playful",
      "friendly",
      "bold"
    ],
    "tags": [
      "민트 컬러",
      "자체 제작 서체",
      "말장난 카피",
      "일러스트"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#2ac1bc",
          "role": "브랜드 컬러"
        }
      ],
      "neutral": [
        {
          "hex": "#ffffff",
          "role": "배경"
        },
        {
          "hex": "#333333",
          "role": "텍스트"
        },
        {
          "hex": "#f5f5f5",
          "role": "보조 배경"
        }
      ],
      "note": "민트 하나를 브랜드 색으로 강하게 쓰고, 나머지는 흰색·검정으로 단순하게 둔다."
    },
    "typography": {
      "family": "한나체 (custom)",
      "category": "display",
      "description": "한나체·주아체·도현체 등 자체 제작 서체. 글자 자체가 브랜드 개성을 드러낸다."
    },
    "layout": {
      "type": "card",
      "whitespace": "balanced",
      "density": "comfortable"
    },
    "ui_style": {
      "radius": "round",
      "shadow": "subtle",
      "depth": "flat"
    },
    "visual": {
      "image_style": [
        "illustration",
        "photography"
      ]
    },
    "design_characteristics": [
      {
        "title": "B급 감성의 말장난 카피가 디자인의 일부"
      },
      {
        "title": "서체가 곧 브랜드 자산"
      },
      {
        "title": "음식 사진과 일러스트를 함께 쓴다"
      }
    ],
    "best_for": [
      "음식·생활 서비스",
      "친근한 커뮤니티",
      "유머가 어울리는 브랜드"
    ],
    "things_to_avoid": [
      "재치 있는 카피 없이 서체만 가져오면 어색하다",
      "신뢰가 중요한 금융·의료 분야에는 어울리지 않는다"
    ],
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.baemin.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "line",
    "name": "LINE",
    "website_url": "https://line.me",
    "region": "japan",
    "country": "JP",
    "industry": "technology",
    "industry_detail": "메신저/SNS",
    "theme": "light",
    "color_tone": "cool",
    "description": "라인 그린과 캐릭터 일러스트로 친근한 커뮤니케이션 경험을 제공",
    "preview_image": "assets/previews/line.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "friendly",
      "playful"
    ],
    "tags": [
      "캐릭터",
      "커뮤니케이션"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#06c755"
        },
        {
          "hex": "#ffffff"
        },
        {
          "hex": "#000000"
        }
      ]
    },
    "typography": {
      "family": "system sans",
      "category": "sans"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://line.me"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "muji",
    "name": "MUJI",
    "website_url": "https://www.muji.com",
    "region": "japan",
    "country": "JP",
    "industry": "commerce",
    "industry_detail": "리빙/라이프스타일",
    "theme": "light",
    "color_tone": "grayish",
    "description": "무채색과 넉넉한 여백을 활용한 절제된 미니멀리즘으로 브랜드 철학을 전달",
    "preview_image": "assets/previews/muji.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "minimal",
      "editorial"
    ],
    "tags": [
      "무채색",
      "생활 장면 사진",
      "넉넉한 여백",
      "담백한 문장"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#7f0019",
          "role": "로고·포인트"
        }
      ],
      "neutral": [
        {
          "hex": "#ffffff",
          "role": "배경"
        },
        {
          "hex": "#f7f5f0",
          "role": "보조 배경"
        },
        {
          "hex": "#3c3c3c",
          "role": "텍스트"
        }
      ],
      "note": "흰색·베이지 배경에 무채색 글자. 로고의 짙은 붉은색만 포인트로 쓴다."
    },
    "typography": {
      "family": "system sans",
      "category": "sans",
      "description": "장식 없는 고딕. 크기 차이를 크게 두지 않아 차분하다."
    },
    "layout": {
      "type": "grid",
      "whitespace": "generous",
      "density": "comfortable"
    },
    "ui_style": {
      "radius": "sharp",
      "shadow": "none",
      "depth": "flat"
    },
    "visual": {
      "image_style": [
        "lifestyle",
        "product"
      ]
    },
    "design_characteristics": [
      {
        "title": "생활 장면 사진으로 제품을 자연스럽게 보여 준다"
      },
      {
        "title": "강조를 최소화해 차분한 톤을 유지한다"
      },
      {
        "title": "정사각형 상품 그리드"
      }
    ],
    "best_for": [
      "리빙·생활용품",
      "친환경·자연주의 브랜드",
      "카페·라이프스타일 공간"
    ],
    "things_to_avoid": [
      "사진 톤 관리가 안 되면 밋밋해 보인다",
      "구매 버튼 같은 행동 유도가 약해질 수 있다"
    ],
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.muji.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "uniqlo",
    "name": "유니클로",
    "website_url": "https://www.uniqlo.com",
    "region": "japan",
    "country": "JP",
    "industry": "fashion",
    "industry_detail": "패션 (SPA)",
    "theme": "light",
    "color_tone": "warm",
    "description": "작은 레드 로고 아래 화면을 꽉 채운 화보, 그 뒤로 이어지는 그리드형 상품 나열로 실용적인 쇼핑 경험을 구성",
    "preview_image": "assets/previews/uniqlo.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": [
      "minimal",
      "bold"
    ],
    "tags": [
      "그리드",
      "실용성",
      "쇼핑"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#ff0000"
        },
        {
          "hex": "#ffffff"
        },
        {
          "hex": "#111111"
        }
      ]
    },
    "typography": {
      "family": "system sans",
      "category": "sans"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.uniqlo.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "sony",
    "name": "Sony",
    "website_url": "https://www.sony.com",
    "region": "japan",
    "country": "JP",
    "industry": "technology",
    "industry_detail": "테크/전자기기",
    "theme": "dark",
    "color_tone": "grayish",
    "description": "블랙 기반의 하이테크 무드와 절제된 타이포로 프리미엄 감성을 강조",
    "preview_image": "assets/previews/sony.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "minimal",
      "technical"
    ],
    "tags": [
      "하이테크",
      "프리미엄",
      "절제미"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#000000"
        },
        {
          "hex": "#ffffff"
        },
        {
          "hex": "#8c8c8c"
        }
      ]
    },
    "typography": {
      "family": "system sans",
      "category": "sans"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.sony.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "nintendo",
    "name": "Nintendo",
    "website_url": "https://www.nintendo.com",
    "region": "japan",
    "country": "JP",
    "industry": "entertainment",
    "industry_detail": "게임",
    "theme": "light",
    "color_tone": "warm",
    "description": "경쾌한 레드 포인트와 둥근 그래픽으로 즐거운 게임 경험을 전달",
    "preview_image": "assets/previews/nintendo.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "playful",
      "friendly",
      "bold"
    ],
    "tags": [
      "그래픽",
      "게임"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#e60012"
        },
        {
          "hex": "#ffffff"
        },
        {
          "hex": "#1a1a1a"
        }
      ]
    },
    "typography": {
      "family": "Nintendo Display (custom)",
      "category": "display"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.nintendo.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "ikea",
    "name": "IKEA",
    "website_url": "https://www.ikea.com",
    "region": "europe",
    "country": "SE",
    "industry": "commerce",
    "industry_detail": "리빙/라이프스타일",
    "theme": "light",
    "color_tone": "multi",
    "description": "블루와 옐로우의 선명한 대비로 친근하고 실용적인 라이프스타일을 제안",
    "preview_image": "assets/previews/ikea.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "friendly",
      "bold"
    ],
    "tags": [
      "대비",
      "실용성"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#0058a3"
        },
        {
          "hex": "#ffda1a"
        },
        {
          "hex": "#ffffff"
        }
      ]
    },
    "typography": {
      "family": "Noto Sans",
      "category": "sans"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.ikea.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "bmw",
    "name": "BMW",
    "website_url": "https://www.bmw.com",
    "region": "europe",
    "country": "DE",
    "industry": "mobility",
    "industry_detail": "자동차",
    "theme": "dark",
    "color_tone": "cool",
    "description": "딥블루와 메탈릭 그레이 톤으로 정교한 엔지니어링 감성을 표현",
    "preview_image": "assets/previews/bmw.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "luxury",
      "technical"
    ],
    "tags": [
      "엔지니어링",
      "메탈릭",
      "정교함"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#0c0c0c"
        },
        {
          "hex": "#1c69d4"
        },
        {
          "hex": "#c6c6c6"
        }
      ]
    },
    "typography": {
      "family": "BMW Type Next (custom)",
      "category": "custom"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.bmw.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "louisvuitton",
    "name": "Louis Vuitton",
    "website_url": "https://www.louisvuitton.com",
    "region": "europe",
    "country": "FR",
    "industry": "fashion",
    "industry_detail": "명품/뷰티",
    "theme": "light",
    "color_tone": "grayish",
    "description": "흰 바탕에 가운데 로고, 화면을 꽉 채운 화보와 아주 작은 글씨로 절제된 럭셔리를 표현",
    "preview_image": "assets/previews/louisvuitton.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": [
      "luxury",
      "editorial"
    ],
    "tags": [
      "헤리티지",
      "풀스크린 화보",
      "가운데 로고",
      "작은 글씨"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#000000",
          "role": "로고·텍스트"
        }
      ],
      "neutral": [
        {
          "hex": "#ffffff",
          "role": "배경"
        }
      ],
      "note": "흑백 바탕에 색은 화보 사진에서만 나온다."
    },
    "typography": {
      "family": "Louis Vuitton (전용 서체)",
      "category": "custom"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.louisvuitton.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "chanel",
    "name": "Chanel",
    "website_url": "https://www.chanel.com",
    "region": "europe",
    "country": "FR",
    "industry": "fashion",
    "industry_detail": "명품/뷰티",
    "theme": "light",
    "color_tone": "grayish",
    "description": "블랙앤화이트의 절제된 대비와 대문자 로고타입, 대형 화보로 시대를 초월한 우아함을 표현",
    "preview_image": "assets/previews/chanel.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": [
      "luxury",
      "editorial",
      "minimal"
    ],
    "tags": [
      "블랙앤화이트",
      "대문자 로고타입",
      "대형 화보",
      "넓은 여백"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#000000",
          "role": "텍스트·버튼"
        }
      ],
      "neutral": [
        {
          "hex": "#ffffff",
          "role": "배경"
        },
        {
          "hex": "#d0d0d0",
          "role": "구분선"
        }
      ],
      "note": "흑백만으로 구성한다. 색은 화보 사진에서만 나온다."
    },
    "typography": {
      "family": "Chanel (전용 서체)",
      "category": "custom",
      "description": "대문자 로고타입과 단정한 산세리프. 글자 수를 최소화한다."
    },
    "layout": {
      "type": "editorial",
      "whitespace": "generous",
      "density": "spacious"
    },
    "ui_style": {
      "radius": "sharp",
      "shadow": "none",
      "depth": "flat"
    },
    "visual": {
      "image_style": [
        "photography"
      ]
    },
    "design_characteristics": [
      {
        "title": "화보 사진을 크게 배치한 잡지 같은 구성"
      },
      {
        "title": "버튼도 각진 흑백으로 장식을 최소화한다"
      },
      {
        "title": "설명보다 이미지로 분위기를 전달한다"
      }
    ],
    "best_for": [
      "명품·뷰티·패션",
      "갤러리·전시",
      "프리미엄 호텔·레스토랑"
    ],
    "things_to_avoid": [
      "사진 퀄리티가 핵심이라 촬영 부담이 크다",
      "정보가 많은 서비스에는 비효율적이다"
    ],
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.chanel.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "riotgames",
    "name": "Riot Games",
    "website_url": "https://www.riotgames.com",
    "region": "usa",
    "country": "US",
    "industry": "entertainment",
    "industry_detail": "게임",
    "theme": "dark",
    "color_tone": "multi",
    "description": "다크 배경 위 강렬한 그래픽과 커스텀 타이포로 몰입감 있는 게임 세계관을 구현",
    "preview_image": "assets/previews/riotgames.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "bold",
      "playful"
    ],
    "tags": [
      "몰입감",
      "세계관",
      "그래픽"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#0a0e14"
        },
        {
          "hex": "#d13639"
        },
        {
          "hex": "#eb0029"
        },
        {
          "hex": "#005a82"
        }
      ]
    },
    "typography": {
      "family": "Riot Display (custom)",
      "category": "display"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.riotgames.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "steam",
    "name": "Steam",
    "website_url": "https://store.steampowered.com",
    "region": "usa",
    "country": "US",
    "industry": "entertainment",
    "industry_detail": "게임",
    "theme": "dark",
    "color_tone": "cool",
    "description": "짙은 블루그레이 톤과 밀도 높은 레이아웃으로 방대한 게임 라이브러리를 탐색하게 함",
    "preview_image": "assets/previews/steam.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "technical",
      "modern"
    ],
    "tags": [
      "정보형",
      "밀도",
      "게임플랫폼"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#1b2838"
        },
        {
          "hex": "#66c0f4"
        },
        {
          "hex": "#ffffff"
        }
      ]
    },
    "typography": {
      "family": "system sans",
      "category": "sans"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://store.steampowered.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "playstation",
    "name": "PlayStation",
    "website_url": "https://www.playstation.com",
    "region": "usa",
    "country": "US",
    "industry": "entertainment",
    "industry_detail": "게임",
    "theme": "dark",
    "color_tone": "cool",
    "description": "딥블루와 화이트의 강한 대비로 강력한 콘솔 브랜드 이미지를 전달",
    "preview_image": "assets/previews/playstation.jpg",
    "preview_captured_on": "2026-10-14",
    "design_keywords": [
      "bold",
      "technical"
    ],
    "tags": [
      "강렬함",
      "브랜드",
      "콘솔"
    ],
    "colors": {
      "primary": [
        {
          "hex": "#003791"
        },
        {
          "hex": "#ffffff"
        },
        {
          "hex": "#000000"
        }
      ]
    },
    "typography": {
      "family": "system sans",
      "category": "sans"
    },
    "sources": [
      {
        "type": "official",
        "label": "공식 사이트",
        "url": "https://www.playstation.com"
      }
    ],
    "review_status": "draft"
  },
  {
    "slug": "bluebottle",
    "name": "Blue Bottle Coffee",
    "website_url": "https://bluebottlecoffee.com",
    "region": "usa",
    "country": "US",
    "industry": "food",
    "industry_detail": "커피/카페",
    "theme": "light",
    "color_tone": "grayish",
    "description": "흑백 사진과 자간을 넓힌 대문자 메뉴, 파란 병 로고 하나로 절제된 커피 브랜드를 표현",
    "preview_image": "assets/previews/bluebottle.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["minimal", "editorial"],
    "mood": ["차분함", "정제됨"],
    "tags": ["흑백 사진", "대문자 메뉴", "파란 포인트", "슬라이드 배너"],
    "colors": {
      "primary": [{ "hex": "#00a9e0", "role": "로고 포인트" }],
      "neutral": [{ "hex": "#ffffff", "role": "배경" }, { "hex": "#f4f2ec", "role": "상단 띠·헤더 배경" }, { "hex": "#333333", "role": "버튼·텍스트" }],
      "note": "유채색은 로고의 파랑 하나뿐이고, 나머지는 흑백 사진과 무채색이다."
    },
    "typography": { "category": "sans", "description": "자간을 넓힌 대문자 산세리프로 메뉴와 제목을 정돈한다." },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://bluebottlecoffee.com" }],
    "review_status": "draft"
  },
  {
    "slug": "oatly",
    "name": "Oatly",
    "website_url": "https://www.oatly.com",
    "region": "europe",
    "country": "SE",
    "industry": "food",
    "industry_detail": "식물성 음료",
    "theme": "light",
    "color_tone": "warm",
    "description": "모눈종이 배경과 손글씨 같은 레터링, 장난스러운 문구로 식품 브랜드를 잡지처럼 풀어냄",
    "preview_image": "assets/previews/oatly.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["playful", "bold", "editorial"],
    "mood": ["장난스러움", "솔직함"],
    "tags": ["모눈종이 배경", "손글씨 레터링", "브라우저 창 같은 틀", "대문자 문구"],
    "colors": {
      "primary": [{ "hex": "#000000", "role": "테두리·텍스트" }],
      "secondary": [{ "hex": "#ffd27a", "role": "분류 이름표" }],
      "neutral": [{ "hex": "#fbf9f0", "role": "모눈 배경" }, { "hex": "#ffffff", "role": "카드 바탕" }],
      "note": "크림색 모눈 위에 검은 선으로 틀을 그리고, 노랑은 작은 이름표에만 쓴다."
    },
    "typography": { "category": "display", "description": "손으로 그린 듯한 대문자 레터링과 좁은 고딕을 섞어 말투를 만든다." },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.oatly.com" }],
    "review_status": "draft"
  },
  {
    "slug": "fritz",
    "name": "프릳츠",
    "website_url": "https://fritz.co.kr",
    "region": "korea",
    "country": "KR",
    "industry": "food",
    "industry_detail": "커피/베이커리",
    "theme": "dark",
    "color_tone": "warm",
    "description": "한옥 매장 사진을 화면 가득 깔고 물개 캐릭터 로고와 한글·영문 메뉴를 나란히 둔 레트로 감성",
    "preview_image": "assets/previews/fritz.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["editorial", "friendly"],
    "mood": ["따뜻함", "레트로"],
    "tags": ["풀스크린 사진", "캐릭터 로고", "한영 병기 메뉴", "왼쪽 세로 메뉴"],
    "colors": {
      "primary": [{ "hex": "#1d3a5f", "role": "상단 띠 배너" }],
      "neutral": [{ "hex": "#ffffff", "role": "텍스트·로고" }, { "hex": "#2b2620", "role": "어둡게 누른 사진 톤" }],
      "note": "사진을 어둡게 눌러 흰 글씨를 얹고, 남색은 상단 띠에만 쓴다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://fritz.co.kr" }],
    "review_status": "draft"
  },
  {
    "slug": "arabica",
    "name": "% Arabica",
    "website_url": "https://arabica.com",
    "region": "japan",
    "country": "JP",
    "industry": "food",
    "industry_detail": "커피/카페",
    "theme": "dark",
    "color_tone": "multi",
    "description": "벽화 영상을 화면 전체에 깔고 가운데 로고만 남긴 몰입형 첫 화면",
    "preview_image": "assets/previews/arabica.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["editorial", "minimal"],
    "mood": ["감각적", "여유"],
    "tags": ["풀스크린 영상", "가운데 로고", "작은 대문자 메뉴", "브랜드 필름"],
    "colors": {
      "neutral": [{ "hex": "#ffffff", "role": "로고·메뉴" }],
      "note": "UI는 흰 글씨뿐이고, 색은 모두 영상에서 나온다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://arabica.com" }],
    "review_status": "draft"
  },
  {
    "slug": "aman",
    "name": "Aman",
    "website_url": "https://www.aman.com",
    "region": "europe",
    "country": "CH",
    "industry": "travel",
    "industry_detail": "럭셔리 호텔/리조트",
    "theme": "light",
    "color_tone": "warm",
    "description": "베이지 바탕에 여백을 크게 두고 영상 한 장과 세리프 문구만 놓은 조용한 럭셔리",
    "preview_image": "assets/previews/aman.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["luxury", "minimal", "editorial"],
    "mood": ["고요함", "고급스러움"],
    "tags": ["넓은 여백", "세리프 이탤릭", "베이지 배경", "영상 히어로"],
    "colors": {
      "primary": [{ "hex": "#2b2b2b", "role": "예약 버튼" }],
      "neutral": [{ "hex": "#f2ede6", "role": "배경" }, { "hex": "#ffffff", "role": "영상 위 문구" }],
      "note": "따뜻한 베이지와 짙은 회색만 쓰고, 색감은 영상에 맡긴다."
    },
    "typography": { "category": "serif", "description": "자간을 넓힌 대문자 세리프에 이탤릭 한 단어를 섞어 리듬을 준다." },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.aman.com" }],
    "review_status": "draft"
  },
  {
    "slug": "hoshinoya",
    "name": "HOSHINOYA",
    "website_url": "https://hoshinoresorts.com/en/brands/hoshinoya/",
    "region": "japan",
    "country": "JP",
    "industry": "travel",
    "industry_detail": "럭셔리 료칸/리조트",
    "theme": "dark",
    "color_tone": "warm",
    "description": "검은 바탕에 세로쓰기 로고와 세리프 문구, 이어지는 석양 사진으로 일본식 고요함을 연출",
    "preview_image": "assets/previews/hoshinoya.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["luxury", "editorial"],
    "mood": ["고요함", "몰입"],
    "tags": ["세로쓰기", "검은 배경", "세리프 문구", "가격 표시 예약 버튼"],
    "colors": {
      "primary": [{ "hex": "#000000", "role": "배경" }],
      "secondary": [{ "hex": "#1aa3d9", "role": "예약 버튼" }],
      "neutral": [{ "hex": "#ffffff", "role": "텍스트·헤더" }],
      "note": "검은 면과 사진의 노을빛이 대비를 만들고, 파랑은 예약 버튼에만 쓴다."
    },
    "typography": { "category": "serif", "description": "세로쓰기 일본어 로고와 대문자 세리프 문구를 함께 쓴다." },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://hoshinoresorts.com/en/brands/hoshinoya/" }],
    "review_status": "draft"
  },
  {
    "slug": "koreanair",
    "name": "대한항공",
    "website_url": "https://www.koreanair.com",
    "region": "korea",
    "country": "KR",
    "industry": "travel",
    "industry_detail": "항공사",
    "theme": "light",
    "color_tone": "cool",
    "description": "하늘색 그라데이션 위에 항공권 검색 카드를 바로 올려, 예약을 첫 화면의 주인공으로 둔 실용형 구성",
    "preview_image": "assets/previews/koreanair.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["friendly", "technical"],
    "mood": ["신뢰", "산뜻함"],
    "tags": ["검색 위젯", "그라데이션 배경", "둥근 카드", "탭 메뉴"],
    "colors": {
      "primary": [{ "hex": "#00256c", "role": "로고·선택된 탭" }],
      "secondary": [{ "hex": "#4fb3e8", "role": "검색 버튼" }],
      "neutral": [{ "hex": "#ffffff", "role": "카드 바탕" }, { "hex": "#e8f4fc", "role": "배경" }],
      "note": "하늘을 떠올리게 하는 파랑 계열로만 구성한다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.koreanair.com" }],
    "review_status": "draft"
  },
  {
    "slug": "porsche",
    "name": "Porsche",
    "website_url": "https://www.porsche.com/korea/ko/",
    "region": "europe",
    "country": "DE",
    "industry": "mobility",
    "industry_detail": "자동차",
    "theme": "dark",
    "color_tone": "warm",
    "description": "검은 화면에 붉은 빛줄기 영상과 아주 큰 한글 헤드라인만 남겨, 차보다 감정을 먼저 보여 주는 첫 화면",
    "analysis": "정보를 거의 지우고 영상과 초대형 문장 하나만 남겨서 광고 한 장면처럼 보인다. 메뉴·버튼은 작고 반투명하게 눌러 영상의 긴장감을 해치지 않는다.",
    "preview_image": "assets/previews/porsche.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["luxury", "bold", "minimal"],
    "mood": ["긴장감", "고급스러움", "자신감"],
    "tags": ["풀스크린 영상", "초대형 헤드라인", "와이드 로고", "반투명 버튼"],
    "colors": {
      "primary": [{ "hex": "#000000", "role": "배경" }],
      "secondary": [{ "hex": "#d5001c", "role": "영상 속 빛·강조" }],
      "neutral": [{ "hex": "#ffffff", "role": "헤드라인·메뉴" }, { "hex": "#3c3c3c", "role": "반투명 버튼 바탕" }],
      "note": "검정과 흰 글씨만으로 UI를 만들고, 빨강은 영상 속 빛으로만 등장한다."
    },
    "typography": {
      "family": "Porsche Next",
      "category": "sans",
      "heading": "화면 높이의 절반에 가까울 만큼 크게, 짧게 끊어 여러 줄로",
      "body": "작고 담백한 버튼·메뉴 글씨",
      "description": "가는 굵기의 초대형 헤드라인과 아주 작은 UI 글씨의 극단적 크기 차이가 위계를 만든다.",
      "sample": { "heading": "스포츠카에 대한 사랑으로", "body": "더 알아보기", "weight": 400, "tracking": "-0.01em" }
    },
    "layout": {
      "type": "full-width",
      "content_width": "full",
      "alignment": "left",
      "whitespace": "generous",
      "density": "spacious",
      "grid": "영상 위 왼쪽에 문장 한 덩어리와 버튼 하나",
      "blocks": ["nav", "hero"]
    },
    "ui_style": {
      "radius": "slight",
      "shadow": "none",
      "depth": "glass",
      "button": { "shape": "rounded", "style": "filled", "note": "반투명 회색 바탕의 작은 버튼" },
      "navigation": { "type": "minimal", "note": "왼쪽 메뉴, 가운데 와이드 로고, 오른쪽 아이콘만 둔 얇은 바" }
    },
    "visual": {
      "image_style": ["photography"],
      "characteristics": ["어둡게 누른 영상", "붉은 빛의 곡선"],
      "graphics": "장식 그래픽 없이 영상과 글자만 쓴다"
    },
    "design_characteristics": [
      { "title": "문장 하나가 첫 화면을 차지한다", "text": "제품명이나 가격 대신 브랜드의 태도를 담은 짧은 문장을 아주 크게 놓는다." },
      { "title": "영상이 곧 배경이자 색", "text": "UI는 흑백으로 비워 두고, 빨간 빛줄기 같은 색은 영상 안에서만 나온다." },
      { "title": "작고 반투명한 컨트롤", "text": "메뉴·버튼을 작게, 반투명하게 만들어 영상 위에 떠 있는 느낌을 준다." },
      { "title": "와이드 로고타입", "text": "옆으로 넓은 로고를 가운데 두어 상단 바만으로 브랜드를 알아보게 한다." }
    ],
    "best_for": ["프리미엄 자동차·제품 출시 페이지", "감성 중심 브랜드 캠페인", "영상 자산이 강한 브랜드"],
    "things_to_avoid": ["첫 화면에서 모델·가격 같은 정보를 바로 찾기 어렵다", "어두운 영상 위 작은 글씨는 대비가 약해질 수 있다", "영상이 늦게 뜨면 빈 검은 화면만 보인다"],
    "sources": [
      { "type": "official", "label": "공식 사이트", "url": "https://www.porsche.com/korea/ko/" },
      { "type": "design-system", "label": "Porsche Design System", "url": "https://designsystem.porsche.com/" }
    ],
    "review_status": "draft"
  },
  {
    "slug": "genesis",
    "name": "Genesis",
    "website_url": "https://www.genesis.com/kr/ko",
    "region": "korea",
    "country": "KR",
    "industry": "mobility",
    "industry_detail": "자동차",
    "theme": "dark",
    "color_tone": "grayish",
    "description": "차가 달리는 영상을 화면 가득 깔고 왼쪽 아래에 모델명만 작게 둔 절제된 프리미엄",
    "preview_image": "assets/previews/genesis.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["luxury", "minimal"],
    "mood": ["여유", "고급스러움"],
    "tags": ["풀스크린 영상", "왼쪽 아래 문구", "투명 내비게이션", "슬라이드"],
    "colors": {
      "primary": [{ "hex": "#000000", "role": "기본 색" }],
      "neutral": [{ "hex": "#ffffff", "role": "텍스트·메뉴" }],
      "note": "흑백 UI만 두고 풍경 영상의 자연색을 그대로 살린다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.genesis.com/kr/ko" }],
    "review_status": "draft"
  },
  {
    "slug": "polestar",
    "name": "Polestar",
    "website_url": "https://www.polestar.com/kr/",
    "region": "europe",
    "country": "SE",
    "industry": "mobility",
    "industry_detail": "전기차",
    "theme": "light",
    "color_tone": "grayish",
    "description": "흑백 사진과 흑백 UI만 써서 색 없이 차의 형태를 드러내는 스칸디나비아식 미니멀",
    "preview_image": "assets/previews/polestar.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["minimal", "technical"],
    "mood": ["차가움", "정제됨"],
    "tags": ["흑백 사진", "얇은 테두리 버튼", "상단 띠 배너", "모델명 메뉴"],
    "colors": {
      "primary": [{ "hex": "#000000", "role": "텍스트·상단 띠" }],
      "neutral": [{ "hex": "#ffffff", "role": "배경·버튼 테두리" }],
      "note": "사진까지 흑백으로 맞춰 색을 완전히 뺀다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.polestar.com/kr/" }],
    "review_status": "draft"
  },
  {
    "slug": "revolut",
    "name": "Revolut",
    "website_url": "https://www.revolut.com",
    "region": "europe",
    "country": "GB",
    "industry": "finance",
    "industry_detail": "핀테크",
    "theme": "light",
    "color_tone": "cool",
    "description": "하늘 사진 위에 아주 큰 헤드라인과 앱 화면 조각을 겹쳐, 은행을 라이프스타일 앱처럼 보여 줌",
    "preview_image": "assets/previews/revolut.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["bold", "modern"],
    "mood": ["자신감", "자유로움"],
    "tags": ["초대형 헤드라인", "사진 위 UI 카드", "알약 버튼", "인물 사진"],
    "colors": {
      "primary": [{ "hex": "#191c1f", "role": "주요 버튼" }],
      "neutral": [{ "hex": "#ffffff", "role": "헤드라인·보조 버튼" }],
      "note": "버튼은 검정과 흰색뿐이고, 파랑은 하늘 사진에서 나온다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.revolut.com" }],
    "review_status": "draft"
  },
  {
    "slug": "hyundaicard",
    "name": "현대카드",
    "website_url": "https://www.hyundaicard.com",
    "region": "korea",
    "country": "KR",
    "industry": "finance",
    "industry_detail": "카드사",
    "theme": "light",
    "color_tone": "multi",
    "description": "카드 실물과 굵은 영문 타이포를 상품처럼 진열해, 금융사를 디자인 브랜드처럼 보이게 하는 구성",
    "preview_image": "assets/previews/hyundaicard.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["editorial", "bold"],
    "mood": ["세련됨", "자신감"],
    "tags": ["카드 진열", "굵은 영문 타이포", "오른쪽 로그인 패널", "포스터형 배너"],
    "colors": {
      "primary": [{ "hex": "#000000", "role": "텍스트·버튼" }],
      "secondary": [{ "hex": "#e60012", "role": "대표 카드 색" }],
      "neutral": [{ "hex": "#ffffff", "role": "배경" }],
      "note": "흑백 바탕 위에 카드 실물과 포스터 배너가 색을 맡는다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.hyundaicard.com" }],
    "review_status": "draft"
  },
  {
    "slug": "29cm",
    "name": "29CM",
    "website_url": "https://www.29cm.co.kr",
    "region": "korea",
    "country": "KR",
    "industry": "commerce",
    "industry_detail": "편집숍",
    "theme": "light",
    "color_tone": "multi",
    "description": "큰 영문 메뉴와 3단 화보를 잡지 표지처럼 배치한 감성 편집숍",
    "preview_image": "assets/previews/29cm.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["editorial", "bold"],
    "mood": ["감각적", "트렌디"],
    "tags": ["3단 화보", "영문 대문자 카테고리", "매거진", "큰 메뉴"],
    "colors": {
      "primary": [{ "hex": "#000000", "role": "텍스트" }],
      "neutral": [{ "hex": "#ffffff", "role": "배경" }],
      "note": "UI는 흑백이고, 기획전 화보가 매번 다른 색을 가져온다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.29cm.co.kr" }],
    "review_status": "draft"
  },
  {
    "slug": "teenageengineering",
    "name": "Teenage Engineering",
    "website_url": "https://teenage.engineering",
    "region": "europe",
    "country": "SE",
    "industry": "commerce",
    "industry_detail": "전자기기/음향",
    "theme": "dark",
    "color_tone": "grayish",
    "description": "검은 화면에 도면 같은 선 아이콘 메뉴와 흑백 사진만 둔, 제품 설명서 같은 실험적 구성",
    "analysis": "메뉴를 숨기지 않고 아이콘과 하위 항목까지 펼쳐 두어 첫 화면이 곧 사이트 지도가 된다. 흑백과 가는 선만 써서 하드웨어 회사다운 정밀함과 장난기를 함께 보여 준다.",
    "preview_image": "assets/previews/teenageengineering.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["technical", "playful"],
    "mood": ["실험적", "정밀함", "장난기"],
    "tags": ["선 아이콘", "흑백 사진", "펼쳐 둔 메뉴", "소문자 타이포"],
    "colors": {
      "primary": [{ "hex": "#000000", "role": "배경" }],
      "neutral": [{ "hex": "#ffffff", "role": "텍스트·아이콘" }],
      "note": "첫 화면은 흑백만 쓴다. 사진까지 흑백으로 맞춘다."
    },
    "typography": {
      "category": "sans",
      "heading": "메뉴 제목을 가는 소문자로, 본문보다 한두 단계만 크게",
      "body": "메뉴 아래 작은 글씨로 하위 항목을 나열",
      "description": "가늘고 담백한 소문자 산세리프로 기계 설명서 같은 인상을 만든다.",
      "sample": { "heading": "teenage engineering", "body": "instruments · audio · designs", "weight": 300, "tracking": "0" }
    },
    "layout": {
      "type": "full-width",
      "content_width": "full",
      "alignment": "left",
      "whitespace": "balanced",
      "density": "comfortable",
      "grid": "상단에 아이콘+글자 메뉴 다섯 칸을 한 줄로 두고 아래를 사진으로 채운다",
      "blocks": ["nav", "full-image"]
    },
    "ui_style": {
      "radius": "sharp",
      "shadow": "none",
      "depth": "flat",
      "navigation": { "type": "dense", "note": "아이콘·제목·하위 항목을 모두 펼쳐 둔 상단 메뉴" }
    },
    "visual": {
      "image_style": ["photography"],
      "characteristics": ["흑백 사진", "네온사인 같은 흰 글자"],
      "icon_style": "제품 도면처럼 가는 선 아이콘",
      "graphics": "기하 도형을 조합한 로고"
    },
    "design_characteristics": [
      { "title": "메뉴를 펼쳐 둔다", "text": "햄버거 버튼에 숨기지 않고 하위 항목까지 첫 화면에 보여 준다." },
      { "title": "도면 같은 아이콘", "text": "가는 선으로 그린 아이콘이 메뉴마다 붙어 하드웨어 회사의 성격을 드러낸다." },
      { "title": "흑백 한 가지 톤", "text": "사진까지 흑백으로 맞춰 화면 전체를 하나의 인쇄물처럼 보이게 한다." }
    ],
    "best_for": ["하드웨어·전자제품 브랜드", "디자인 스튜디오 포트폴리오", "개성을 강하게 드러내야 하는 작은 브랜드"],
    "things_to_avoid": ["가늘고 작은 글씨는 읽기 어렵다", "일반 쇼핑몰과 생김새가 달라 처음 온 사람이 헤맬 수 있다"],
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://teenage.engineering" }],
    "review_status": "draft"
  },
  {
    "slug": "balmuda",
    "name": "BALMUDA",
    "website_url": "https://www.balmuda.com/jp/",
    "region": "japan",
    "country": "JP",
    "industry": "commerce",
    "industry_detail": "가전",
    "theme": "dark",
    "color_tone": "warm",
    "description": "어두운 그라데이션 배경에 제품을 조명처럼 비추고 주황 세리프 문구를 얹은 프리미엄 가전 광고",
    "preview_image": "assets/previews/balmuda.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["luxury", "minimal"],
    "mood": ["따뜻함", "고급스러움"],
    "tags": ["제품 클로즈업", "세리프 헤드라인", "어두운 배경", "주황 포인트"],
    "colors": {
      "primary": [{ "hex": "#e8641b", "role": "헤드라인 강조" }],
      "neutral": [{ "hex": "#1a1a1a", "role": "배경" }, { "hex": "#ffffff", "role": "제품명·메뉴" }],
      "note": "토스터 불빛과 같은 주황을 헤드라인에 써서 제품과 글자를 이어 준다."
    },
    "typography": { "category": "serif", "description": "세리프 헤드라인과 둥근 산세리프 제품명을 위아래로 짝지운다." },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.balmuda.com/jp/" }],
    "review_status": "draft"
  },
  {
    "slug": "aesop",
    "name": "Aesop",
    "website_url": "https://kr.aesop.com",
    "region": "other",
    "country": "AU",
    "industry": "fashion",
    "industry_detail": "뷰티/스킨케어",
    "theme": "dark",
    "color_tone": "warm",
    "description": "호박색 병을 어둡게 비춘 사진 위에 작은 글씨만 얹어, 약국 같은 차분함과 고급스러움을 함께 표현",
    "analysis": "사진의 호박색과 낮은 조명이 곧 브랜드 색이 된다. 글씨를 작게 줄이고 버튼을 얇은 테두리로만 그려, 화면에서 가장 큰 것은 언제나 제품 사진이다.",
    "preview_image": "assets/previews/aesop.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["luxury", "editorial", "minimal"],
    "mood": ["차분함", "따뜻함", "지적임"],
    "tags": ["호박색 톤", "제품 클로즈업", "작은 글씨", "테두리 버튼"],
    "colors": {
      "primary": [{ "hex": "#6b4423", "role": "사진 속 호박색 병" }],
      "neutral": [{ "hex": "#ffffff", "role": "사진 위 텍스트" }, { "hex": "#252525", "role": "어두운 사진 톤" }],
      "note": "UI는 흰 글씨와 얇은 선뿐이고, 따뜻한 갈색은 사진에서 나온다."
    },
    "typography": {
      "category": "sans",
      "heading": "중간 크기로 차분하게, 굵기 차이를 거의 두지 않는다",
      "body": "작고 단정한 본문",
      "description": "작은 산세리프를 크기와 여백만으로 나눠 위계를 만든다."
    },
    "layout": {
      "type": "full-width",
      "content_width": "mixed",
      "alignment": "center",
      "whitespace": "generous",
      "density": "comfortable",
      "grid": "가운데 로고 아래 카테고리 한 줄, 그 아래 화면을 채운 사진과 가운데 문구",
      "blocks": ["nav", "hero"]
    },
    "ui_style": {
      "radius": "sharp",
      "shadow": "none",
      "depth": "flat",
      "button": { "shape": "sharp", "style": "outline", "note": "각진 얇은 테두리 버튼" },
      "navigation": { "type": "dense", "note": "가운데 로고 아래 카테고리를 한 줄로 늘어놓은 메뉴" }
    },
    "visual": {
      "image_style": ["product", "photography"],
      "characteristics": ["낮은 조도", "따뜻한 색온도", "제품을 반복해 늘어놓은 구도"],
      "graphics": "장식 그래픽 없이 사진과 글자만 쓴다"
    },
    "design_characteristics": [
      { "title": "사진 톤이 브랜드 색", "text": "로고 색 대신 호박색 병과 낮은 조명이 브랜드 인상을 만든다." },
      { "title": "작은 글씨", "text": "글씨를 작게 줄여 사진을 앞세우고, 조용한 분위기를 유지한다." },
      { "title": "각진 테두리 버튼", "text": "채운 버튼 대신 얇은 선만 그려 사진 위에서도 무게감이 가볍다." }
    ],
    "best_for": ["뷰티·향수 브랜드", "프리미엄 생활용품", "매장 분위기를 온라인으로 옮기고 싶은 브랜드"],
    "things_to_avoid": ["어두운 사진 위 작은 글씨는 읽기 어렵다", "상단 띠 배너·화살표·채팅 버튼이 겹치면 첫 화면이 복잡해진다"],
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://kr.aesop.com" }],
    "review_status": "draft"
  },
  {
    "slug": "gentlemonster",
    "name": "Gentle Monster",
    "website_url": "https://www.gentlemonster.com/kr/ko",
    "region": "korea",
    "country": "KR",
    "industry": "fashion",
    "industry_detail": "아이웨어",
    "theme": "dark",
    "color_tone": "warm",
    "description": "어두운 인물 화보를 꽉 채우고 가운데 로고만 둔, 패션 캠페인 같은 첫 화면",
    "preview_image": "assets/previews/gentlemonster.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["bold", "luxury", "editorial"],
    "mood": ["강렬함", "세련됨"],
    "tags": ["풀스크린 화보", "협업 캠페인", "테두리 알약 버튼", "가운데 로고"],
    "colors": {
      "primary": [{ "hex": "#000000", "role": "기본 색" }],
      "neutral": [{ "hex": "#ffffff", "role": "로고·텍스트" }, { "hex": "#f3f4f6", "role": "아래 섹션 배경" }],
      "note": "흑백 UI 위에 어두운 화보가 분위기를 만든다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.gentlemonster.com/kr/ko" }],
    "review_status": "draft"
  },
  {
    "slug": "kinfolk",
    "name": "Kinfolk",
    "website_url": "https://www.kinfolk.com",
    "region": "europe",
    "country": "DK",
    "industry": "media",
    "industry_detail": "라이프스타일 매거진",
    "theme": "light",
    "color_tone": "grayish",
    "description": "흰 바탕 가운데에 세리프 제목과 잡지 표지 한 장만 놓은, 인쇄 잡지를 그대로 옮긴 듯한 구성",
    "preview_image": "assets/previews/kinfolk.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["editorial", "minimal"],
    "mood": ["고요함", "지적임"],
    "tags": ["세리프 제목", "표지 이미지", "넓은 여백", "가운데 정렬"],
    "colors": {
      "primary": [{ "hex": "#000000", "role": "텍스트" }],
      "neutral": [{ "hex": "#ffffff", "role": "배경" }],
      "note": "흑백만 쓰고, 색은 표지와 사진이 가져온다."
    },
    "typography": { "category": "serif", "description": "가는 대문자 세리프 제목으로 인쇄 잡지의 인상을 만든다." },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.kinfolk.com" }],
    "review_status": "draft"
  },
  {
    "slug": "duolingo",
    "name": "Duolingo",
    "website_url": "https://www.duolingo.com",
    "region": "usa",
    "country": "US",
    "industry": "education",
    "industry_detail": "언어 학습",
    "theme": "light",
    "color_tone": "multi",
    "description": "선명한 연두 버튼과 캐릭터 일러스트로 공부를 게임처럼 가볍게 보이게 함",
    "preview_image": "assets/previews/duolingo.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["playful", "friendly"],
    "mood": ["경쾌함", "친근함"],
    "tags": ["캐릭터", "일러스트", "입체 버튼", "연두색"],
    "colors": {
      "primary": [{ "hex": "#58cc02", "role": "로고·주요 버튼" }],
      "secondary": [{ "hex": "#1cb0f6", "role": "보조 버튼 글씨" }],
      "neutral": [{ "hex": "#ffffff", "role": "배경" }, { "hex": "#e5e5e5", "role": "테두리" }],
      "note": "연두 하나를 강하게 쓰고, 다른 색은 일러스트에 맡긴다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.duolingo.com" }],
    "review_status": "draft"
  },
  {
    "slug": "oura",
    "name": "Oura",
    "website_url": "https://ouraring.com",
    "region": "europe",
    "country": "FI",
    "industry": "healthcare",
    "industry_detail": "웨어러블 헬스",
    "theme": "light",
    "color_tone": "warm",
    "description": "살구빛 배경과 손 사진, 가는 명조 헤드라인으로 건강 기기를 장신구처럼 보여 줌",
    "preview_image": "assets/previews/oura.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["luxury", "minimal"],
    "mood": ["따뜻함", "정제됨"],
    "tags": ["명조 헤드라인", "제품 클로즈업", "따뜻한 배경", "파란 알약 버튼"],
    "colors": {
      "primary": [{ "hex": "#2f6be0", "role": "구매 버튼" }],
      "neutral": [{ "hex": "#f2e6dc", "role": "배경" }, { "hex": "#2b2b2b", "role": "텍스트" }],
      "note": "살구빛 배경과 피부 톤을 맞추고, 파랑은 구매 버튼 하나에만 쓴다."
    },
    "typography": { "category": "serif", "description": "가는 명조 헤드라인과 작은 고딕 본문을 짝지운다." },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://ouraring.com" }],
    "review_status": "draft"
  },
  {
    "slug": "masterclass",
    "name": "MasterClass",
    "website_url": "https://www.masterclass.com",
    "region": "usa",
    "country": "US",
    "industry": "education",
    "industry_detail": "온라인 강의",
    "theme": "dark",
    "color_tone": "warm",
    "description": "검은 바탕에 아주 굵은 압축 대문자와 강사 인물 사진 기둥을 세워, 강의를 영화 예고편처럼 보여 줌",
    "preview_image": "assets/previews/masterclass.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["bold", "editorial"],
    "mood": ["몰입", "자신감"],
    "tags": ["압축 대문자", "인물 사진 그리드", "다크 배경", "체크리스트 질문"],
    "colors": {
      "primary": [{ "hex": "#e32652", "role": "가입 버튼·구분선" }],
      "neutral": [{ "hex": "#000000", "role": "배경" }, { "hex": "#222326", "role": "선택 항목 바탕" }, { "hex": "#ffffff", "role": "텍스트" }],
      "note": "검은 화면에 빨강은 가입 버튼과 짧은 구분선에만 쓴다."
    },
    "typography": { "category": "display", "description": "아주 굵고 폭이 좁은 대문자 헤드라인과 작은 산세리프 본문을 짝지운다." },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.masterclass.com" }],
    "review_status": "draft"
  },
  {
    "slug": "headspace",
    "name": "Headspace",
    "website_url": "https://www.headspace.com",
    "region": "usa",
    "country": "US",
    "industry": "healthcare",
    "industry_detail": "명상·정신건강",
    "theme": "light",
    "color_tone": "warm",
    "description": "주황 동그라미 캐릭터와 둥근 카드, 노란 띠 배너로 정신건강 앱을 가볍고 다정하게 보여 줌",
    "preview_image": "assets/previews/headspace.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["friendly", "playful"],
    "mood": ["다정함", "편안함"],
    "tags": ["둥근 카드", "캐릭터", "노란 띠 배너", "앱 화면 목업"],
    "colors": {
      "primary": [{ "hex": "#f47d31", "role": "로고·캐릭터" }],
      "secondary": [{ "hex": "#0a5ce8", "role": "가입 버튼" }, { "hex": "#ffd400", "role": "상단 띠 배너" }],
      "neutral": [{ "hex": "#ffffff", "role": "배경" }, { "hex": "#f9f4f2", "role": "카드 바탕" }, { "hex": "#2b2b2b", "role": "버튼·텍스트" }],
      "note": "주황·노랑의 따뜻한 색에 파란 가입 버튼 하나로 대비를 준다."
    },
    "typography": { "category": "sans", "description": "둥글고 굵은 산세리프 제목으로 부드러운 말투를 만든다." },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.headspace.com" }],
    "review_status": "draft"
  },
  {
    "slug": "class101",
    "name": "클래스101",
    "website_url": "https://class101.net/ko",
    "region": "korea",
    "country": "KR",
    "industry": "education",
    "industry_detail": "온라인 클래스",
    "theme": "dark",
    "color_tone": "multi",
    "description": "검은 바탕에 주황 버튼과 분야별 사진 타일을 두 줄로 흘려, 수많은 클래스를 한눈에 훑게 함",
    "preview_image": "assets/previews/class101.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["bold", "friendly"],
    "mood": ["활기", "다채로움"],
    "tags": ["다크 배경", "사진 타일", "아이콘 카테고리 메뉴", "카운트다운 띠"],
    "colors": {
      "primary": [{ "hex": "#ff5a1f", "role": "주요 버튼" }],
      "secondary": [{ "hex": "#ff8ab3", "role": "강조 문구" }],
      "neutral": [{ "hex": "#0d0d0d", "role": "배경" }, { "hex": "#ffffff", "role": "텍스트" }],
      "note": "검은 바탕 위 색은 사진 타일이 채우고, 주황은 행동 버튼에만 쓴다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://class101.net/ko" }],
    "review_status": "draft"
  },
  {
    "slug": "wise",
    "name": "Wise",
    "website_url": "https://wise.com/kr/",
    "region": "europe",
    "country": "GB",
    "industry": "finance",
    "industry_detail": "해외 송금",
    "theme": "light",
    "color_tone": "multi",
    "description": "형광 연두 바탕에 화면을 꽉 채운 초대형 굵은 대문자, 색이 다른 둥근 카드로 송금 서비스를 자신 있게 소개",
    "analysis": "브랜드 연두를 배경 전체에 깔고 헤드라인을 화면 폭만큼 키워, 금융 서비스인데도 포스터처럼 강하게 말한다. 아래 카드는 색을 하나씩 달리하고 실제 환율·금액 화면을 그대로 보여 줘서, 강한 첫인상 뒤에 바로 구체적인 신뢰를 붙인다.",
    "preview_image": "assets/previews/wise.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["bold", "friendly"],
    "mood": ["자신감", "명쾌함", "경쾌함"],
    "tags": ["형광 연두", "초대형 대문자", "색이 다른 카드", "실제 금액 화면"],
    "colors": {
      "primary": [{ "hex": "#9fe870", "role": "브랜드 연두 (배경·보조 버튼)" }],
      "secondary": [{ "hex": "#163300", "role": "짙은 초록 (헤드라인·주요 버튼)" }, { "hex": "#a0e1e1", "role": "카드 바탕" }, { "hex": "#ffc5e6", "role": "카드 바탕" }],
      "neutral": [{ "hex": "#ffffff", "role": "카드 안 화면" }, { "hex": "#1f1f1f", "role": "어두운 카드" }],
      "note": "연두와 짙은 초록 한 쌍이 기본이고, 카드마다 하늘·분홍·검정을 하나씩 바꿔 리듬을 만든다."
    },
    "typography": {
      "family": "Wise Sans (헤드라인) · Inter (본문)",
      "category": "custom",
      "heading": "아주 굵고 압축된 대문자, 줄 간격을 바짝 붙여 한 덩어리로",
      "body": "중간 크기의 담백한 산세리프",
      "description": "헤드라인은 그래픽처럼 크게, 본문은 짧고 평이하게 써서 대비를 키운다.",
      "sample": { "heading": "The international account", "body": "낮은 수수료로 빠르게 보내세요.", "weight": 900, "upper": true, "tracking": "-0.02em" }
    },
    "layout": {
      "type": "full-width",
      "content_width": "contained",
      "alignment": "center",
      "whitespace": "balanced",
      "density": "comfortable",
      "grid": "가운데 정렬 헤드라인과 버튼 둘, 그 아래 3단 카드",
      "blocks": ["nav", "hero", "grid-3"]
    },
    "ui_style": {
      "radius": "round",
      "shadow": "none",
      "depth": "flat",
      "button": { "shape": "pill", "style": "filled", "note": "짙은 초록 알약 주요 버튼, 연한 초록 알약 보조 버튼" },
      "card": { "note": "카드마다 다른 바탕색과 큰 둥근 모서리, 그림자 없음" },
      "navigation": { "type": "minimal", "note": "로고·메뉴 셋·오른쪽 가입 버튼만 둔 얇은 바" }
    },
    "visual": {
      "image_style": ["product"],
      "characteristics": ["앱 화면 조각을 카드 안에 실제처럼 배치", "국기 아이콘으로 통화를 표시"],
      "graphics": "사진 대신 큰 글자와 색면이 화면을 채운다"
    },
    "design_characteristics": [
      { "title": "브랜드 색을 배경 전체에", "text": "포인트로만 쓰기 쉬운 형광 연두를 첫 화면 배경으로 깔아 바로 알아보게 한다." },
      { "title": "포스터 같은 헤드라인", "text": "화면 폭을 채우는 굵은 대문자 세 줄로 메시지를 한 번에 전달한다." },
      { "title": "카드마다 다른 색", "text": "같은 모양의 카드에 바탕색만 바꿔 기능을 구분한다." },
      { "title": "숫자로 신뢰 주기", "text": "환율·금액 입력 화면을 그대로 보여 줘 서비스가 실제로 어떻게 동작하는지 알린다." }
    ],
    "best_for": ["핀테크·송금 서비스", "젊은 층 대상 금융 앱", "강한 브랜드 색이 있는 스타트업"],
    "things_to_avoid": ["형광 연두 위 긴 문장은 눈이 쉽게 피로해진다", "초대형 영문 대문자의 힘을 한글로 옮기면 무게감이 달라진다", "카드 색을 너무 많이 늘리면 산만해진다"],
    "sources": [
      { "type": "official", "label": "공식 사이트", "url": "https://wise.com/kr/" },
      { "type": "design-system", "label": "Wise Design", "url": "https://wise.design/" }
    ],
    "review_status": "draft"
  },
  {
    "slug": "kakaobank",
    "name": "카카오뱅크",
    "website_url": "https://www.kakaobank.com",
    "region": "korea",
    "country": "KR",
    "industry": "finance",
    "industry_detail": "인터넷 은행",
    "theme": "light",
    "color_tone": "warm",
    "description": "흰 여백 가운데에 일상 영상을 크게 두고 반투명 한글 문구를 얹은, 은행 같지 않은 첫 화면",
    "preview_image": "assets/previews/kakaobank.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["minimal", "editorial"],
    "mood": ["일상적", "따뜻함"],
    "tags": ["영상 히어로", "반투명 헤드라인", "흰 여백", "가운데 정렬"],
    "colors": {
      "neutral": [{ "hex": "#ffffff", "role": "배경·헤드라인" }, { "hex": "#1a1a1a", "role": "로고·메뉴" }],
      "note": "브랜드 노랑 대신 영상의 따뜻한 일상 톤을 앞세운다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.kakaobank.com" }],
    "review_status": "draft"
  },
  {
    "slug": "mercury",
    "name": "Mercury",
    "website_url": "https://mercury.com",
    "region": "usa",
    "country": "US",
    "industry": "finance",
    "industry_detail": "비즈니스 뱅킹",
    "theme": "dark",
    "color_tone": "cool",
    "description": "안개 낀 산 위 책상 사진을 화면 가득 깔고 가는 흰 헤드라인과 이메일 입력창만 둔, 차분한 비즈니스 뱅킹",
    "preview_image": "assets/previews/mercury.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["luxury", "minimal"],
    "mood": ["차분함", "여유"],
    "tags": ["풀스크린 사진", "유리 같은 입력창", "보라 버튼", "가는 헤드라인"],
    "colors": {
      "primary": [{ "hex": "#5266eb", "role": "가입 버튼" }],
      "neutral": [{ "hex": "#ffffff", "role": "헤드라인·메뉴" }, { "hex": "#f4f3ef", "role": "상단 띠" }],
      "note": "사진의 안개 낀 색감 위에 보라 버튼 하나만 강조한다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://mercury.com" }],
    "review_status": "draft"
  },
  {
    "slug": "theverge",
    "name": "The Verge",
    "website_url": "https://www.theverge.com",
    "region": "usa",
    "country": "US",
    "industry": "media",
    "industry_detail": "테크 뉴스",
    "theme": "dark",
    "color_tone": "multi",
    "description": "검은 바탕에 세로로 누운 거대 로고와 압축 헤드라인, 민트 포인트로 테크 뉴스를 잡지처럼 편집",
    "preview_image": "assets/previews/theverge.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["editorial", "bold"],
    "mood": ["대담함", "실험적"],
    "tags": ["세로 로고", "압축 헤드라인", "민트 포인트", "2단 피드"],
    "colors": {
      "primary": [{ "hex": "#3cffd0", "role": "구독·탭 강조" }],
      "neutral": [{ "hex": "#131313", "role": "배경" }, { "hex": "#ffffff", "role": "텍스트" }],
      "note": "검은 바탕에 민트 하나를 형광처럼 쓴다."
    },
    "typography": { "category": "display", "description": "아주 좁고 굵은 헤드라인과 세리프 본문을 섞어 잡지 같은 대비를 만든다." },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.theverge.com" }],
    "review_status": "draft"
  },
  {
    "slug": "monocle",
    "name": "Monocle",
    "website_url": "https://monocle.com",
    "region": "europe",
    "country": "GB",
    "industry": "media",
    "industry_detail": "매거진",
    "theme": "light",
    "color_tone": "warm",
    "description": "가운데 큰 세리프 로고와 가는 선으로 나눈 다단 기사, 노란 구독 버튼으로 인쇄 신문을 그대로 옮긴 편집 디자인",
    "analysis": "신문 1면처럼 큰 마스트헤드 아래 기사를 가는 세로줄로 나눠 촘촘하게 배치한다. 색은 노랑 하나만 써서 구독·라디오처럼 행동이 필요한 곳에만 시선을 모으고, 나머지는 흑백 세리프 글자가 맡는다.",
    "preview_image": "assets/previews/monocle.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["editorial", "luxury"],
    "mood": ["지적임", "단정함", "클래식"],
    "tags": ["신문식 다단", "큰 세리프 로고", "노란 포인트", "펜 선 일러스트"],
    "colors": {
      "primary": [{ "hex": "#ffd100", "role": "구독 버튼·광고 바탕·라디오 강조" }],
      "neutral": [{ "hex": "#ffffff", "role": "배경" }, { "hex": "#000000", "role": "텍스트·구분선" }, { "hex": "#2b2b2b", "role": "라디오 패널" }],
      "note": "흑백 지면에 노랑 하나만 쓴다. 노랑이 보이는 곳이 곧 누를 곳이다."
    },
    "typography": {
      "category": "serif",
      "heading": "큰 세리프 마스트헤드, 기사 제목은 중간 크기 세리프",
      "body": "세리프 본문, 분류 이름은 작은 대문자",
      "description": "세리프 하나로 로고·제목·본문을 모두 쓰고, 크기와 대문자 여부로만 위계를 나눈다.",
      "sample": { "heading": "Affairs, culture and design", "body": "Currently being edited in London", "weight": 400 }
    },
    "layout": {
      "type": "editorial",
      "content_width": "contained",
      "alignment": "mixed",
      "whitespace": "tight",
      "density": "compact",
      "grid": "가는 세로줄로 나눈 3단: 큰 기사 · 작은 기사 · 라디오 패널",
      "blocks": ["nav", "text", "grid-3"]
    },
    "ui_style": {
      "radius": "slight",
      "shadow": "none",
      "depth": "flat",
      "button": { "shape": "sharp", "style": "filled", "note": "노란 바탕의 작은 대문자 버튼" },
      "navigation": { "type": "dense", "note": "로고 위아래로 나눈 두 줄 메뉴, 섹션 이름은 세로줄로 구분" }
    },
    "visual": {
      "image_style": ["photography", "illustration"],
      "characteristics": ["기사 사진은 사각형 그대로", "로고 양옆의 펜 선 일러스트"],
      "icon_style": "펜으로 그린 듯한 선 일러스트 아이콘",
      "graphics": "가는 가로·세로 선으로 지면을 나눈다"
    },
    "design_characteristics": [
      { "title": "신문 1면 같은 마스트헤드", "text": "화면 가운데 큰 세리프 로고를 두고 양옆에 작은 문구와 일러스트를 붙인다." },
      { "title": "가는 선으로 나눈 단", "text": "상자나 그림자 대신 얇은 선으로 기사 영역을 구분한다." },
      { "title": "노랑 하나로 행동 유도", "text": "구독·라디오 등 눌러야 할 곳에만 노랑을 쓴다." },
      { "title": "기사마다 분류와 읽는 시간", "text": "작은 대문자 분류와 '3 MIN READ' 같은 정보로 훑어보기 쉽게 한다." }
    ],
    "best_for": ["매거진·뉴스 사이트", "브랜드 저널·블로그", "글 콘텐츠가 많은 문화 브랜드"],
    "things_to_avoid": ["정보가 촘촘해 모바일에서 단 구성이 쉽게 무너진다", "작은 세리프 본문은 화면에 따라 흐릿해 보일 수 있다"],
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://monocle.com" }],
    "review_status": "draft"
  },
  {
    "slug": "brunch",
    "name": "브런치",
    "website_url": "https://brunch.co.kr",
    "region": "korea",
    "country": "KR",
    "industry": "media",
    "industry_detail": "글쓰기 플랫폼",
    "theme": "light",
    "color_tone": "grayish",
    "description": "흰 바탕에 가는 명조 문장과 회색으로 흐려지는 소개글, 3칸 카드 슬라이드로 글 플랫폼의 문학적 분위기를 표현",
    "preview_image": "assets/previews/brunch.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["editorial", "minimal"],
    "mood": ["서정적", "고요함"],
    "tags": ["명조 문장", "흐려지는 회색 글", "카드 슬라이드", "넓은 여백"],
    "colors": {
      "primary": [{ "hex": "#00c3bd", "role": "공지 링크" }],
      "neutral": [{ "hex": "#ffffff", "role": "배경" }, { "hex": "#333333", "role": "제목" }, { "hex": "#bbbbbb", "role": "흐린 소개글" }],
      "note": "흑백과 회색 단계가 중심이고, 민트는 작은 링크에만 쓴다."
    },
    "typography": { "category": "serif", "description": "명조 계열 제목과 회색 농도를 달리한 문장으로 책 같은 분위기를 만든다." },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://brunch.co.kr" }],
    "review_status": "draft"
  },
  {
    "slug": "ana",
    "name": "ANA",
    "website_url": "https://www.ana.co.jp/ko/kr/",
    "region": "japan",
    "country": "JP",
    "industry": "travel",
    "industry_detail": "항공사",
    "theme": "light",
    "color_tone": "cool",
    "description": "공지 띠와 넓은 사진 슬라이드, 그 아래 둥근 예약 카드를 겹쳐 둔 정보 중심 항공사 홈",
    "preview_image": "assets/previews/ana.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["friendly", "technical"],
    "mood": ["신뢰", "정돈됨"],
    "tags": ["예약 위젯", "사진 슬라이드", "알약 탭", "아이콘 바로가기"],
    "colors": {
      "primary": [{ "hex": "#13448f", "role": "로고·주요 버튼" }],
      "neutral": [{ "hex": "#ffffff", "role": "카드 바탕" }, { "hex": "#f5f5f5", "role": "배경" }, { "hex": "#d6dce9", "role": "공지 띠" }],
      "note": "남색 하나로 브랜드와 버튼을 통일하고 나머지는 연회색으로 정돈한다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.ana.co.jp/ko/kr/" }],
    "review_status": "draft"
  },
  {
    "slug": "belmond",
    "name": "Belmond",
    "website_url": "https://www.belmond.com",
    "region": "europe",
    "country": "GB",
    "industry": "travel",
    "industry_detail": "럭셔리 호텔·열차",
    "theme": "dark",
    "color_tone": "warm",
    "description": "베네치아 실내 영상을 꽉 채우고 자간을 넓힌 로고만 가운데 둔 영화 같은 첫 화면",
    "preview_image": "assets/previews/belmond.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["luxury", "editorial", "minimal"],
    "mood": ["고급스러움", "낭만"],
    "tags": ["풀스크린 영상", "자간 넓은 로고", "얇은 상단 바", "알약 선택 버튼"],
    "colors": {
      "neutral": [{ "hex": "#ffffff", "role": "로고·버튼" }, { "hex": "#f4f1ea", "role": "상단 바" }, { "hex": "#1c1c1c", "role": "텍스트" }],
      "note": "UI는 무채색으로 비우고 영상의 실내 조명 색을 그대로 살린다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.belmond.com" }],
    "review_status": "draft"
  },
  {
    "slug": "toyota",
    "name": "Toyota",
    "website_url": "https://toyota.jp",
    "region": "japan",
    "country": "JP",
    "industry": "mobility",
    "industry_detail": "자동차",
    "theme": "light",
    "color_tone": "grayish",
    "description": "흰 바탕 가운데 상자 안에 차 사진 슬라이드와 공지 목록을 차곡차곡 쌓은 단정한 정보형 구성",
    "preview_image": "assets/previews/toyota.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["minimal", "technical"],
    "mood": ["단정함", "신뢰"],
    "tags": ["가운데 정렬 상자", "사진 슬라이드", "공지 목록", "작은 메뉴"],
    "colors": {
      "primary": [{ "hex": "#eb0a1e", "role": "슬라이드 표시점" }],
      "neutral": [{ "hex": "#ffffff", "role": "배경" }, { "hex": "#f5f5f5", "role": "공지 영역" }, { "hex": "#000000", "role": "텍스트" }],
      "note": "흑백 바탕에 빨강은 아주 작은 표시에만 쓴다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://toyota.jp" }],
    "review_status": "draft"
  },
  {
    "slug": "volvo",
    "name": "Volvo Cars",
    "website_url": "https://www.volvocars.com/kr/",
    "region": "europe",
    "country": "SE",
    "industry": "mobility",
    "industry_detail": "자동차",
    "theme": "light",
    "color_tone": "grayish",
    "description": "풀폭 사진 위 왼쪽에 가는 한글 헤드라인과 흰 알약 버튼 하나, 자간 넓힌 로고로 차분한 북유럽 미니멀",
    "preview_image": "assets/previews/volvo.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["minimal", "friendly"],
    "mood": ["차분함", "안정감"],
    "tags": ["풀폭 사진", "가는 헤드라인", "자간 넓은 로고", "흰 알약 버튼"],
    "colors": {
      "primary": [{ "hex": "#141414", "role": "상단 띠·텍스트" }],
      "neutral": [{ "hex": "#ffffff", "role": "배경·버튼" }, { "hex": "#f0f0f0", "role": "바로가기 카드" }],
      "note": "흑백 UI에 사진의 벽돌·회색 톤을 그대로 둔다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.volvocars.com/kr/" }],
    "review_status": "draft"
  },
  {
    "slug": "kia",
    "name": "Kia",
    "website_url": "https://www.kia.com/kr",
    "region": "korea",
    "country": "KR",
    "industry": "mobility",
    "industry_detail": "자동차",
    "theme": "dark",
    "color_tone": "cool",
    "description": "차 사진을 화면 가득 채우고 왼쪽 아래에 굵은 영문 헤드라인과 각진 버튼 둘을 둔 강한 광고형 첫 화면",
    "preview_image": "assets/previews/kia.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["bold", "technical"],
    "mood": ["역동적", "도시적"],
    "tags": ["풀스크린 사진", "각진 버튼", "굵은 영문 헤드라인", "투명 내비게이션"],
    "colors": {
      "primary": [{ "hex": "#05141f", "role": "보조 버튼 (미드나잇 블랙)" }],
      "neutral": [{ "hex": "#ffffff", "role": "로고·주요 버튼·텍스트" }],
      "note": "흰색과 아주 짙은 남색만 쓰고, 화면의 분위기는 사진이 만든다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.kia.com/kr" }],
    "review_status": "draft"
  },
  {
    "slug": "vercel",
    "name": "Vercel",
    "website_url": "https://vercel.com",
    "region": "usa",
    "country": "US",
    "industry": "technology",
    "industry_detail": "개발 플랫폼",
    "theme": "dark",
    "color_tone": "grayish",
    "description": "검은 화면 가운데 빛나는 삼각형 로고, 흰 헤드라인과 작은 버튼만 둔 개발자용 미니멀",
    "analysis": "로고 하나를 빛나는 오브젝트로 만들어 히어로 이미지로 쓰고, 나머지는 흑백과 회색 단계로만 정리한다. 화면을 왼쪽 문장·가운데 로고·오른쪽 목록으로 나눠 비어 보이지 않으면서도 여백이 넉넉하다.",
    "preview_image": "assets/previews/vercel.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["technical", "minimal", "modern"],
    "mood": ["정밀함", "차분함", "미래적"],
    "tags": ["빛나는 로고", "흑백", "고객사 로고 줄", "3분할 히어로"],
    "colors": {
      "primary": [{ "hex": "#000000", "role": "배경" }],
      "neutral": [{ "hex": "#ffffff", "role": "헤드라인·주요 버튼" }, { "hex": "#a1a1a1", "role": "보조 텍스트" }, { "hex": "#1f1f1f", "role": "테두리·보조 버튼" }],
      "note": "유채색이 없다. 흰색과 몇 단계의 회색으로만 위계를 만든다."
    },
    "typography": {
      "family": "Geist",
      "category": "sans",
      "heading": "중간 굵기의 큰 헤드라인, 자간을 좁혀 단단하게",
      "body": "작은 회색 설명 글",
      "description": "기하학적인 산세리프를 굵기 차이보다 크기와 회색 농도로 구분한다.",
      "sample": { "heading": "Agentic Infrastructure", "body": "For coding agents", "weight": 500, "tracking": "-0.04em" }
    },
    "layout": {
      "type": "full-width",
      "content_width": "contained",
      "alignment": "mixed",
      "whitespace": "generous",
      "density": "spacious",
      "grid": "왼쪽 헤드라인 · 가운데 로고 · 오른쪽 짧은 목록의 3분할, 아래 고객사 로고 한 줄",
      "blocks": ["nav", "hero", "row-scroll"]
    },
    "ui_style": {
      "radius": "round",
      "shadow": "none",
      "depth": "flat",
      "button": { "shape": "pill", "style": "filled", "note": "흰 알약 주요 버튼과 테두리만 있는 보조 버튼을 짝지운다" },
      "navigation": { "type": "minimal", "note": "로고·메뉴 넷·오른쪽 작은 버튼 셋만 둔 얇은 바" }
    },
    "visual": {
      "image_style": ["3d"],
      "characteristics": ["로고 뒤로 번지는 빛", "검은 면 위 고객사 로고"],
      "graphics": "로고 자체를 빛나는 오브젝트로 쓴다"
    },
    "design_characteristics": [
      { "title": "로고가 곧 히어로 이미지", "text": "사진 대신 삼각형 로고에 빛을 넣어 화면 가운데 상징으로 둔다." },
      { "title": "흑백과 회색 단계", "text": "색을 쓰지 않고 흰색·회색 농도로 중요도를 나눈다." },
      { "title": "세 덩어리로 나눈 첫 화면", "text": "문장·로고·목록을 좌우로 펼쳐 넓은 여백 속에서도 정보가 한눈에 들어온다." },
      { "title": "고객사 로고로 신뢰", "text": "첫 화면 아래에 유명 고객사 로고를 한 줄로 보여 준다." }
    ],
    "best_for": ["개발자 도구·인프라 SaaS", "AI 서비스 랜딩 페이지", "기술 스타트업"],
    "things_to_avoid": ["흑백만 쓰면 브랜드 상징이 약할 때 평범해 보인다", "검은 바탕 위 작은 회색 글씨는 읽기 어려울 수 있다"],
    "sources": [
      { "type": "official", "label": "공식 사이트", "url": "https://vercel.com" },
      { "type": "design-system", "label": "Geist Design System", "url": "https://vercel.com/geist" }
    ],
    "review_status": "draft"
  },
  {
    "slug": "raycast",
    "name": "Raycast",
    "website_url": "https://www.raycast.com",
    "region": "europe",
    "country": "GB",
    "industry": "technology",
    "industry_detail": "생산성 앱",
    "theme": "dark",
    "color_tone": "warm",
    "description": "검은 바탕에 붉은 빛줄기 그래픽을 비스듬히 흘리고 굵은 흰 문장을 가운데 둔, 날렵한 키보드 런처 앱",
    "preview_image": "assets/previews/raycast.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["technical", "bold", "modern"],
    "mood": ["날렵함", "강렬함"],
    "tags": ["빛줄기 그래픽", "떠 있는 둥근 내비게이션", "가운데 정렬", "고정폭 글씨"],
    "colors": {
      "primary": [{ "hex": "#ff6363", "role": "브랜드 빨강 (그래픽·로고)" }],
      "neutral": [{ "hex": "#0a0a0a", "role": "배경" }, { "hex": "#ffffff", "role": "헤드라인·버튼" }],
      "note": "검은 바탕에 빨강을 빛처럼 번지게 써서 속도감을 낸다."
    },
    "typography": { "category": "sans", "description": "굵은 산세리프 헤드라인과, 설치 안내에 쓴 작은 고정폭 글씨를 섞는다." },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.raycast.com" }],
    "review_status": "draft"
  },
  {
    "slug": "smarthr",
    "name": "SmartHR",
    "website_url": "https://smarthr.jp",
    "region": "japan",
    "country": "JP",
    "industry": "technology",
    "industry_detail": "HR 클라우드",
    "theme": "light",
    "color_tone": "cool",
    "description": "청록 배경에 정장 인물 사진과 굵은 일본어 헤드라인, 말풍선 달린 둥근 버튼으로 B2B 서비스를 친근하게 소개",
    "preview_image": "assets/previews/smarthr.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["friendly", "bold"],
    "mood": ["친근함", "신뢰"],
    "tags": ["청록 띠", "인물 사진", "말풍선 라벨", "실적 배지"],
    "colors": {
      "primary": [{ "hex": "#00c4cc", "role": "로고·히어로 배경" }],
      "secondary": [{ "hex": "#ffe14a", "role": "말풍선 라벨" }],
      "neutral": [{ "hex": "#ffffff", "role": "배경·헤드라인" }, { "hex": "#23221f", "role": "텍스트" }],
      "note": "청록 하나를 넓게 쓰고, 노랑은 버튼 위 작은 말풍선에만 쓴다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://smarthr.jp" }],
    "review_status": "draft"
  },
  {
    "slug": "pokemon",
    "name": "Pokémon",
    "website_url": "https://www.pokemon.co.jp",
    "region": "japan",
    "country": "JP",
    "industry": "entertainment",
    "industry_detail": "게임/캐릭터",
    "theme": "light",
    "color_tone": "multi",
    "description": "카드 이미지와 금색 배지, 화려한 그라데이션 배너를 화면 가득 채운 축제 같은 캐릭터 브랜드 홈",
    "preview_image": "assets/previews/pokemon.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["playful", "bold"],
    "mood": ["신남", "화려함"],
    "tags": ["대형 배너 슬라이드", "금색 배지", "캐릭터", "굵은 일본어 타이포"],
    "colors": {
      "primary": [{ "hex": "#ffcb05", "role": "로고·배지" }],
      "secondary": [{ "hex": "#2a75bb", "role": "로고 테두리·버튼" }],
      "neutral": [{ "hex": "#ffffff", "role": "배경" }],
      "note": "로고의 노랑·파랑에 배너마다 다른 화려한 색이 더해진다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://www.pokemon.co.jp" }],
    "review_status": "draft"
  },
  {
    "slug": "ohouse",
    "name": "오늘의집",
    "website_url": "https://ohou.se",
    "region": "korea",
    "country": "KR",
    "industry": "commerce",
    "industry_detail": "인테리어 플랫폼",
    "theme": "light",
    "color_tone": "cool",
    "description": "하늘색 포인트와 집 사진 카드, 둥근 아이콘 바로가기로 콘텐츠와 쇼핑을 한 화면에 엮은 플랫폼",
    "preview_image": "assets/previews/ohouse.jpg",
    "preview_captured_on": "2026-10-15",
    "design_keywords": ["friendly", "editorial"],
    "mood": ["산뜻함", "편안함"],
    "tags": ["집 사진 카드", "아이콘 바로가기", "하늘색 포인트", "탭 메뉴"],
    "colors": {
      "primary": [{ "hex": "#35c5f0", "role": "로고·버튼·선택된 탭" }],
      "neutral": [{ "hex": "#ffffff", "role": "배경" }, { "hex": "#f7f9fa", "role": "아이콘 바탕" }, { "hex": "#2f3438", "role": "텍스트" }],
      "note": "하늘색 하나를 브랜드 색으로 쓰고, 화면의 색은 집 사진이 채운다."
    },
    "sources": [{ "type": "official", "label": "공식 사이트", "url": "https://ohou.se" }],
    "review_status": "draft"
  }
]
$seed$::jsonb) as r
on conflict (slug) do update set
  name = excluded.name,
  website_url = excluded.website_url,
  region = excluded.region,
  country = excluded.country,
  industry = excluded.industry,
  industry_detail = excluded.industry_detail,
  theme = excluded.theme,
  color_tone = excluded.color_tone,
  description = excluded.description,
  analysis = excluded.analysis,
  preview_image = excluded.preview_image,
  preview_captured_on = excluded.preview_captured_on,
  design_keywords = excluded.design_keywords,
  mood = excluded.mood,
  tags = excluded.tags,
  colors = excluded.colors,
  typography = excluded.typography,
  layout = excluded.layout,
  ui_style = excluded.ui_style,
  visual = excluded.visual,
  design_characteristics = excluded.design_characteristics,
  best_for = excluded.best_for,
  things_to_avoid = excluded.things_to_avoid,
  sources = excluded.sources,
  review_status = excluded.review_status;

-- 확인: 아래 결과에 브랜드 수(69)와 이미지가 있는 브랜드 수가 나오면 성공
select count(*) as brands, count(preview_image) as with_preview, count(*) filter (where review_status = 'reviewed') as reviewed from public.brands;
