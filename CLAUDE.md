# 디자인 가이드 사이트 — 작업 메모 (Claude용)

- 사용자는 비개발자 강사다. 설명은 쉬운 우리말로 한다.
- 이 사이트는 사용자의 **포트폴리오이자 실제 디자인 작업용 레퍼런스 사이트**다. 수강생용이 아니다.
- 데이터 규칙은 [MD/DATA_GUIDE.md](MD/DATA_GUIDE.md), 폴더 구조는 [README.md](README.md)를 따른다.
- 커밋: `git add -A`, 제목 `v1.XX 핵심 단어 몇 개`, 태그 `ver1.XX`, main과 태그를 함께 푸시. 직전 버전은 `git tag`로 확인해 다음 번호를 쓴다.

## 브랜드 늘리기 (20개씩)

진행 상황은 **`MD/BRAND_ROADMAP.md`** 한 파일로 관리한다. 파일이 없으면 첫 "20개 만들어줘" 때 아래 형식으로 만든다.
목표는 우선 100개, 그 뒤 계속 늘린다.

### 사용자가 "20개 만들어줘"라고 하면 — 1단계: 명단

1. `data/brands.json`에서 지금 분포(업종·지역·테마·design_keywords 개수)를 센다.
2. 가장 비어 있는 필터부터 채우도록 20개를 고른다. 아래 '고르는 기준'과 '후보 풀'을 쓴다. 이미 있는 slug와 겹치지 않게 한다.
3. 각 사이트의 공식 주소가 지금 열리는지(폐쇄·로그인 전용 아닌지) 확인한다.
4. `MD/BRAND_ROADMAP.md`에 새 차수를 추가하고, 사용자에게 캡처 안내(주소 + 저장할 파일 이름)를 준다.
5. 여기서 멈추고 사용자의 캡처를 기다린다.

### 사용자가 "캡처했어 / 반영해줘"라고 하면 — 2단계: 정리

1. `captures/` 폴더의 이미지를 확인한다. 이름이 한글이거나 다르면 slug에 맞춰 짝을 짓는다.
2. 각 이미지를 16:10 비율로 (위쪽 기준) 잘라 **960×600 JPG**로 줄여 `site/assets/previews/<slug>.jpg`에 저장한다. 브라우저 주소창·스크롤바가 찍혔으면 잘라낸다. `tools/make-previews.ps1 -Items "slug=원본파일=가로위치=위쪽여백"`를 쓴다. 가로위치는 로고·제목이 왼쪽이면 0, 가운데면 0.5. 위쪽여백은 맨 위 광고 띠를 건너뛸 픽셀 수(생략 가능). 팝업이 화면을 덮은 캡처는 쓰지 말고 다시 찍어 달라고 한다. 결과를 한 장으로 모아 보고 잘린 곳이 있으면 위치를 바꿔 다시 만든다. 사용자 캡처는 대개 `스크린샷 날짜 시간.png` 이름이라 이미지를 보고 짝짓는다.
3. **캡처 이미지를 직접 보고** 기본 데이터를 작성한다. 이름이나 다른 AI 목록의 태그를 그대로 믿지 않는다.
   - 기본으로 채울 것: slug, name, website_url, region, country, industry, industry_detail, theme, color_tone, description, design_keywords(2~3개, DATA_GUIDE 기준), mood, tags, colors, preview_image, preview_captured_on(캡처한 날), review_status `draft`
   - 확실하지 않은 항목은 비워 둔다.
4. 차수마다 **2~3개만** 깊게 분석한다(typography, layout, ui_style, visual, design_characteristics, best_for, things_to_avoid). 포트폴리오 첫인상을 위해 디자인이 뛰어난 곳을 우선한다.
5. `powershell -ExecutionPolicy Bypass -File tools\build-seed.ps1`로 검사·생성한다.
6. 로드맵의 상태를 갱신하고 분포표를 다시 계산한다.
7. 사용자에게 Supabase SQL Editor에서 `sql/seed.sql` 실행을 안내한다.
8. 사용자가 원하면 커밋한다. 커밋 후 상태를 "반영됨"으로 바꾼다.

### 고르는 기준

- 누구나 아는 브랜드(신뢰감)와 디자인으로 유명한 곳(안목)을 섞는다.
- 첫 화면이 로그인·개인 추천·광고로 채워지는 "앱 같은" 대형 플랫폼(Amazon, Reddit, LinkedIn, YouTube 등)은 피한다.
- 업종·지역·라이트/다크·design_keywords가 한쪽으로 쏠리지 않게 한다. 어떤 필터를 눌러도 결과가 3개 이상 나오도록 한다.
- 자동 캡처를 막는 사이트도 괜찮다. 캡처는 사용자가 직접 한다.

### 후보 풀 (예비 명단, 쓰면 지운다)

- 푸드: Starbucks, Shake Shack, Sweetgreen, McDonald's, Chipotle, 파리바게뜨, 노티드, Doutor Coffee
- 여행: Hyatt, Marriott, Japan Airlines
- 모빌리티: Tesla, Rivian, 현대자동차, Mercedes-Benz, Lucid
- 금융: Monzo, Klarna, Ramp, Robinhood
- 패션·뷰티: adidas, New Balance, Patagonia, COS, Acne Studios, Jacquemus, TAMBURINS, Glossier, 설화수, Hermès, Dior, Prada, Loewe
- 커머스·리빙: 컬리, HAY, Vitra, Vitsœ, Dyson, Bang & Olufsen, Herman Miller, LEGO
- 테크: Framer, Webflow, Anthropic, OpenAI, Samsung, NVIDIA
- 미디어: The New York Times, Bloomberg, Medium, Pinterest
- 엔터: Disney+, Xbox, A24, HYBE, Epic Games
- 교육·헬스케어: Calm, Khan Academy (일본·한국 쪽 후보 보충 필요)

### `MD/BRAND_ROADMAP.md` 형식

```
# 브랜드 로드맵

## 현재 위치
- 총 OO개 · 다음 차수: O차 · 진행 중: O차 (캡처 대기 / 정리 중)
- 마지막 갱신: YYYY-MM-DD

## 분포
| 업종 | 개수 | ... (지역, 테마, design_keywords 표도 같은 방식)

## O차 (YYYY-MM-DD 시작)
| # | 브랜드 | slug | 주소 | 업종 | 지역 | 상태 | 메모 |
상태: 대기 → 캡처됨 → 입력됨 → 반영됨

## 제외 목록
| 브랜드 | 이유 |
```

1차는 기존 30개(v1.03 이전에 넣은 것)로 친다.

### 처음 2차를 시작할 때 할 일

- `captures/chanel.png`, `uniqlo.png`, `louisvuitton.png`는 사용자가 직접 찍은 캡처다(2차 명단 때 옮겨 둠). 2차 정리 때 함께 처리한다. 이 3곳은 데이터가 이미 있으므로 preview_image만 추가한다.
- Nike 이미지는 json에 반영됐지만, DB 반영(seed.sql 실행)은 사용자가 했는지 확인한다.
