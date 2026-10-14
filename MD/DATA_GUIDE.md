# 브랜드 데이터 작성 가이드

사이트에 보이는 브랜드는 모두 **Supabase의 `brands` 테이블**에서 읽어 옵니다. 카드, 검색, 필터, 상세 페이지가 같은 행 하나를 함께 씁니다. 브랜드를 추가할 때 화면 코드는 고치지 않습니다.

## 데이터가 흘러가는 길

```
data/brands.json  ──(tools/build-seed.ps1)──▶  sql/seed.sql  ──(Supabase SQL Editor 실행)──▶  brands 테이블  ──▶  사이트(site/)
   (입력 원본)                                ├▶ site/data/sample-brands.js (연결 정보가 없을 때만 쓰는 샘플)
                                              └▶ site/brand/<slug>/, site/sitemap.xml (공유·검색용)
```

- **고치는 곳은 `data/brands.json` 한 곳뿐입니다.** Supabase Table Editor에서 직접 고치면 다음 seed 실행 때 덮어써지고, json과 DB 내용이 서로 달라집니다.
- `sql/seed.sql`, `sql/setup.sql`, `site/data/sample-brands.js`, `site/brand/`는 자동으로 만들어지는 파일이라 직접 고치지 않습니다.

## 새 브랜드 추가 방법

1. `data/brands.json` 배열에 브랜드 객체를 하나 추가합니다. 아래 예시를 복사해서 쓰면 됩니다.
2. PowerShell에서 검사 겸 생성 스크립트를 실행합니다.
   ```
   powershell -ExecutionPolicy Bypass -File tools\build-seed.ps1
   ```
   값이 규칙에 맞지 않으면 어느 브랜드의 어느 항목이 틀렸는지 알려 주고, 파일을 만들지 않습니다.
3. 만들어진 `sql/seed.sql` 내용을 Supabase **SQL Editor**에 붙여 넣고 실행합니다. 같은 slug가 이미 있으면 덮어쓰고, 없으면 새로 추가합니다.
4. 사이트를 새로고침해서 확인합니다.

처음 한 번만 할 일: SQL Editor에서 `sql/setup.sql`을 실행해 테이블과 데이터를 한 번에 넣고, `site/js/supabase-config.js`에 URL과 publishable key를 넣습니다.

## 필수 항목

| 항목 | 설명 | 예 |
|---|---|---|
| `slug` | 주소에 쓰는 이름. 영문 소문자·숫자·하이픈만, 다른 브랜드와 겹치면 안 됨 | `apple`, `louis-vuitton` |
| `name` | 브랜드 이름 | `Apple`, `토스` |
| `website_url` | 공식 사이트 주소 (`https://`로 시작) | `https://www.apple.com` |
| `region` | 지역 (아래 목록 중 하나) | `usa` |
| `industry` | 업종 그룹 (아래 목록 중 하나) | `technology` |
| `theme` | 사이트 기본 톤 | `light` |
| `description` | 카드와 상세에 함께 쓰는 한 줄 디자인 설명 | |

## 정해진 값 목록

값은 아래 목록에 있는 영문 소문자만 씁니다. 같은 뜻을 여러 이름(`US`, `USA`, `America` 등)으로 쓰지 않습니다. 세부 특징은 `industry_detail`이나 `tags`에 적습니다.

| 항목 | 쓸 수 있는 값 |
|---|---|
| `region` | `korea` `usa` `europe` `japan` `china` `southeast-asia` `other` |
| `industry` | `technology` `finance` `commerce` `fashion` `media` `food` `travel` `entertainment` `education` `mobility` `healthcare` `other` |
| `theme` | `light` `dark` `mixed` (밝은 면과 어두운 면을 비슷하게 섞어 씀) |
| `color_tone` | `warm` `cool` `grayish` `multi` |
| `design_keywords` | `minimal` `modern` `bold` `editorial` `luxury` `playful` `friendly` `technical` (2~3개, 아래 기준 참고) |
| `review_status` | `draft` (1차 분석) / `reviewed` (실제 사이트와 대조 검수 완료) |

아래 값은 상세 화면에서 그림이나 이름표로 바뀌므로, 이 목록에 있는 값만 씁니다.

| 항목 | 쓸 수 있는 값 |
|---|---|
| `layout.type` | `grid` `editorial` `card` `full-width` `minimal` |
| `layout.content_width` | `full` `contained` `mixed` |
| `layout.alignment` | `center` `left` `mixed` |
| `layout.whitespace` | `tight` `balanced` `generous` |
| `layout.density` | `compact` `comfortable` `spacious` |
| `layout.blocks` | `nav` `hero` `full-image` `split` `search` `grid-2` `grid-3` `grid-4` `row-scroll` `text` `footer` |
| `ui_style.radius` | `sharp` `slight` `round` |
| `ui_style.shadow` | `none` `subtle` `strong` |
| `ui_style.depth` | `flat` `layered` `glass` |
| `ui_style.button.shape` / `.style` | `pill` `rounded` `sharp` / `filled` `outline` `text` |
| `ui_style.navigation.type` | `minimal` `dense` `mega` `sidebar` `floating` `fixed` |
| `visual.image_style` | `product` `lifestyle` `illustration` `photography` `3d` |
| `typography.category` | `serif` `sans` `display` `custom` |
| `sources[].type` | `official` `design-system` `guideline` `article` |

### design_keywords 기준

필터로 쓰는 값이라 "그 브랜드를 다른 브랜드와 구분해 주는 특징"만 고릅니다. 대부분의 사이트에 해당하는 말(예: 깔끔함)은 붙이지 않습니다.

| 값 | 이럴 때 붙인다 | 예 |
|---|---|---|
| `minimal` | 장식·색을 의도적으로 줄이고 여백과 글자로 위계를 만든다 | Apple, MUJI |
| `modern` | 최신 제품·SaaS 특유의 표현(그라데이션, 얇은 테두리, 정교한 제품 UI)이 핵심이다. **다른 값으로 설명되면 붙이지 않는다** | Linear, Stripe, Figma |
| `bold` | 큰 글자·강한 대비·꽉 찬 이미지로 강하게 밀어붙인다 | Nike, Spotify |
| `editorial` | 잡지처럼 큰 사진·글 배치로 이야기를 보여 준다 | Chanel, Awwwards |
| `luxury` | 고급·프리미엄 인상을 주는 절제와 소재감 | Louis Vuitton, BMW |
| `playful` | 유머·캐릭터·경쾌한 색과 움직임 | 배달의민족, Nintendo |
| `friendly` | 둥근 형태, 쉬운 말투, 부드러운 색으로 다가가기 쉽다 | Airbnb, 토스 |
| `technical` | 데이터·제품 사양·엔지니어링 느낌이 강하다 | Linear, Steam |
## 선택 항목

모르는 항목은 **아예 적지 않습니다.** 빈 섹션은 상세 화면에서 자동으로 숨겨지고, "아직 분석되지 않은 항목"으로 표시됩니다. 추측해서 채우지 않습니다.

- `country`: ISO 국가 코드 2자리 (`US`, `KR`, `JP`, `FR`)
- `industry_detail`: 화면에 보이는 세부 업종 (`테크/전자기기`)
- `analysis`: 왜 이런 느낌이 나는지 2~3문장
- `preview_image`, `preview_captured_on`: 공식 사이트 첫 화면 캡처 경로와 캡처한 날 (아래 '이미지' 참고)
- `mood`: 화면이 주는 느낌 (자유 텍스트 2~4개)
- `tags`: 자유 키워드 (검색에 쓰임)
- `colors`, `typography`, `layout`, `ui_style`, `visual`, `design_characteristics`, `best_for`, `things_to_avoid`, `sources`: 아래 예시 참고

`sources`를 비워 두면 화면에는 `website_url`이 공식 사이트로 표시됩니다.

## 전체 예시

```json
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
  "analysis": "넓은 여백과 정밀한 타이포, 제품 중심의 시각 위계가 통제된 프리미엄 경험을 만든다.",
  "preview_image": "assets/previews/apple.jpg",
  "preview_captured_on": "2026-10-14",
  "design_keywords": ["minimal", "luxury"],
  "mood": ["차분함", "정제됨"],
  "tags": ["넓은 여백", "제품 중심"],
  "colors": {
    "primary":   [{ "hex": "#0071e3", "role": "버튼·링크 강조" }],
    "secondary": [{ "hex": "#000000", "role": "어두운 섹션 배경" }],
    "neutral":   [{ "hex": "#ffffff", "role": "기본 배경" }, { "hex": "#1d1d1f", "role": "본문 텍스트" }],
    "note": "유채색은 버튼과 링크의 파랑뿐이고, 화면의 색은 제품 사진이 맡는다."
  },
  "typography": {
    "family": "SF Pro (Display · Text)",
    "category": "sans",
    "heading": "크고 굵게, 한두 줄로 짧게",
    "body": "중간 크기의 담백한 문장",
    "weights": ["Regular", "Semibold", "Bold"],
    "description": "크기 대비가 위계를 만든다.",
    "sample": { "heading": "Pro. Beyond.", "body": "가볍고 강력하게.", "weight": 700, "tracking": "-0.02em" }
  },
  "layout": {
    "type": "full-width",
    "content_width": "mixed",
    "alignment": "center",
    "whitespace": "generous",
    "density": "spacious",
    "grid": "섹션마다 1~2단의 단순한 모듈 그리드",
    "blocks": ["nav", "hero", "full-image", "grid-2", "footer"]
  },
  "ui_style": {
    "radius": "round",
    "shadow": "none",
    "depth": "flat",
    "button": { "shape": "pill", "style": "filled", "note": "작은 알약형 파란 버튼" },
    "card": { "note": "테두리 없이 연회색 배경으로 구분" },
    "input": { "note": "..." },
    "navigation": { "type": "minimal", "note": "얇은 상단 바에 카테고리만 나열" }
  },
  "visual": {
    "image_style": ["product", "3d"],
    "characteristics": ["깨끗한 단색 배경", "큰 제품 크기"],
    "icon_style": "얇고 단순한 선 아이콘",
    "graphics": "장식 그래픽 대신 제품 이미지와 여백"
  },
  "design_characteristics": [
    { "title": "넓은 여백", "text": "콘텐츠 블록 사이를 넉넉히 띄워 리듬을 유지한다." }
  ],
  "best_for": ["프리미엄 제품 출시 페이지"],
  "things_to_avoid": ["넓은 여백은 정보가 많은 서비스에서 비효율적이다."],
  "sources": [
    { "type": "official", "label": "Apple 공식 사이트", "url": "https://www.apple.com" },
    { "type": "guideline", "label": "Apple Human Interface Guidelines", "url": "https://developer.apple.com/design/human-interface-guidelines/", "note": "앱 디자인 가이드" }
  ],
  "review_status": "draft"
}
```

참고:
- `typography.sample`은 상세 화면의 글자 미리보기 설정입니다. `weight`(굵기 숫자), `tracking`(자간), `upper`(대문자), `condensed`(좁은 글자)를 쓸 수 있습니다.
- `design_characteristics`는 3~6개가 적당합니다.

## AI에게 브랜드 데이터를 맡길 때

이 문서를 함께 주고 다음처럼 요청하면 됩니다.

> DATA_GUIDE.md 규칙에 맞춰 ○○ 브랜드 웹사이트를 분석한 JSON 객체 하나를 작성해 줘. 정해진 값 목록 밖의 값은 쓰지 말고, 확실하지 않은 항목은 비워 둬. `review_status`는 `draft`로.

받은 결과는 `data/brands.json`에 붙여 넣고, `tools/build-seed.ps1`로 검사한 뒤 사람이 실제 사이트와 대조해서 확인합니다. 확인이 끝나면 `review_status`를 `reviewed`로 바꿉니다.

## 이미지

- `preview_image`에는 **이미지 경로나 URL만** 넣습니다 (예: `assets/previews/apple.jpg` = 실제 파일은 `site/assets/previews/apple.jpg`). 경로는 `site/` 기준입니다. 이미지 자체(Base64)를 행에 넣지 않습니다.
- 크기는 **960×600 JPG**(16:10, 100KB 안팎)로 맞춥니다. 1440×900 화면의 첫 화면을 캡처해 줄이면 됩니다.
- 쿠키 동의 창이 화면을 크게 가리거나 접근이 막힌 화면은 쓰지 않습니다. 이미지가 없으면 대표 색 그라데이션이 대신 나옵니다.
- `preview_captured_on`에 캡처한 날을 적습니다. 사이트가 바뀌었을 수 있으니 오래된 캡처는 다시 찍습니다.
- 검사 스크립트가 경로에 실제 파일이 있는지 확인합니다.