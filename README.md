# Design Reference

유명 브랜드 웹사이트의 컬러·타이포그래피·레이아웃·UI 특징을 분석해 비교하는 웹 디자인 레퍼런스 라이브러리입니다. (사이트 이름은 임시이며 `site/js/schema.js`의 `SITE_INFO`에서 바꿉니다.)

## 주요 기능

- 검색: 브랜드명·업종·스타일·키워드·설명을 함께 검색 (영어·우리말 모두, 여러 단어는 AND)
- 필터: 업종 / 스타일 / 테마 / 지역 (+ 상세 필터: 컬러톤 / 폰트). 그룹 안은 OR, 그룹끼리는 AND
- 정렬: 추천순 / 이름순 / 지역순
- 검색·필터·정렬 상태가 주소(쿼리)에 남아 링크로 공유 가능
- 브랜드 상세 분석: Design DNA, 핵심 특징, 컬러 시스템, 타이포그래피, 레이아웃, UI, 비주얼, 활용·주의점, 출처
- 즐겨찾기 (브라우저 localStorage)
- 불러오는 중 / 불러오기 실패 / 데이터 없음 / 결과 없음 / 즐겨찾기 없음 / 찾을 수 없음 화면

## 기술 스택

- 빌드 도구 없는 정적 사이트: HTML + CSS + 바닐라 JavaScript
- 데이터: Supabase (PostgreSQL) — `@supabase/supabase-js` v2를 CDN에서 필요할 때만 불러옴
- 데이터 입력 도구: PowerShell 스크립트 (`tools/build-seed.ps1`)

## 실행 방법

빌드가 필요 없습니다.

- 가장 간단하게: `site/index.html`을 브라우저로 엽니다.
- 배포와 같은 환경으로 확인하려면 `site/` 폴더를 로컬 서버로 엽니다 (예: VS Code Live Server 확장).

주소 형식: 목록 `index.html#/`, 브랜드 상세 `index.html#/brand/apple`. 해시(#) 주소라서 정적 호스팅에서 새로고침·직접 접속해도 별도 서버 설정이 필요 없습니다.

## Supabase 설정 (처음 한 번, 약 5분)

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 만듭니다.
2. 왼쪽 메뉴 **SQL Editor** → New query → `sql/setup.sql` 내용을 통째로 붙여 넣고 **Run**.
   마지막 줄 결과에 `brands 30`이 나오면 성공입니다. (테이블 생성 + 읽기 전용 보안 + 데이터 입력이 한 번에 됩니다)
3. **Project Settings → API**에서 Project URL과 **publishable(anon) key**를 복사해 `site/js/supabase-config.js`에 넣습니다.
4. 사이트를 새로고침해서 결과 줄의 "샘플 데이터" 표시가 사라지면 DB에서 읽는 중입니다.

- 빌드 도구가 없어 `.env` 대신 이 설정 파일을 씁니다. publishable key는 브라우저 공개를 전제로 만든 키이고, `brands` 테이블은 RLS로 읽기만 허용되어 있습니다.
- secret / service_role key는 절대 넣지 않습니다.
- 두 값이 비어 있으면 **샘플 데이터 모드**로 동작합니다 (`site/data/sample-brands.js`).
- 예전 `sites` 테이블이 남아 있다면 확인 후 `drop table public.sites;`로 지워도 됩니다.

## 배포 (GitHub Pages 기준)

1. GitHub 저장소 → **Settings → Pages** → Source: **GitHub Actions** 선택 (처음 한 번).
2. main 브랜치에 올릴 때마다 `.github/workflows/deploy.yml`이 `site/` 폴더만 배포합니다. 몇 분 뒤 `https://enkyoon.github.io/design-guide-site/`에서 열립니다.
3. 주소가 다르면(다른 호스팅·도메인) `tools/build-seed.ps1`의 `$SiteUrl`과 `site/index.html`의 canonical·og 주소를 바꾸고 스크립트를 다시 실행합니다.

- 해시(#) 주소라 새로고침·직접 접속에 서버 설정이 필요 없습니다. 없는 경로는 `site/404.html`이 처리합니다.
- 공유용 주소는 `…/brand/apple/` 입니다(상세 화면의 "링크 복사"). 이 페이지에 브랜드별 제목·설명·이미지가 들어 있어 카카오톡·슬랙 등 링크 미리보기에 표시되고, 열면 상세 화면으로 이동합니다.
- `sitemap.xml`, `robots.txt`도 같은 스크립트가 만듭니다.

## 출시 전 직접 확인할 것 (자동 시험으로 못 하는 부분)

- [ ] 실제 Supabase 연결 후 목록·상세·검색이 그대로 동작하는지
- [ ] 아이폰 Safari / 안드로이드 Chrome: 필터 시트 열고 닫기, 카드 누르기, 즐겨찾기, 가로 스크롤 없음
- [ ] 상세 화면 섹션 메뉴를 눌렀을 때 부드럽게 이동하는지, 컬러 HEX 복사·"링크 복사"가 되는지
- [ ] 배포 주소를 카카오톡·슬랙에 붙여 넣어 미리보기 이미지가 나오는지 (사이트 첫 화면, `brand/apple/`)
- [ ] 키보드만으로(Tab·Enter·Esc) 검색 → 필터 → 카드 → 상세 → 목록 복귀
- [ ] 화면 낭독기(iOS VoiceOver 등)로 카드 이름·즐겨찾기 버튼이 읽히는지

## 데이터 추가 방법

`data/brands.json` 한 곳만 고칩니다. 자세한 규칙과 예시는 [MD/DATA_GUIDE.md](MD/DATA_GUIDE.md).

```
data/brands.json 수정
→ powershell -ExecutionPolicy Bypass -File tools\build-seed.ps1   (값 검사 + 파일 생성)
→ 생성된 sql/seed.sql을 Supabase SQL Editor에서 실행
```

## 폴더 구조

**직접 고치는 곳**과 **자동으로 만들어지는 곳**을 나눴습니다. 자동 생성 파일은 `tools/build-seed.ps1`을 실행하면 다시 만들어지므로 직접 고치지 않습니다.

```
design-guide-site/
├─ README.md
├─ data/
│  └─ brands.json              브랜드 데이터 원본 ✏️ 여기만 수정
├─ tools/
│  └─ build-seed.ps1           데이터 검사 + 아래 ⚙️ 파일 전부 만들기
├─ sql/
│  ├─ schema.sql               brands 테이블·보안 정책 ✏️
│  ├─ seed.sql                 ⚙️ 데이터 입력용
│  └─ setup.sql                ⚙️ 처음 설정용 (schema + seed + 확인)
├─ MD/
│  └─ DATA_GUIDE.md            브랜드 데이터 작성 규칙 (사람·AI 공용)
├─ .github/workflows/
│  └─ deploy.yml               main에 올리면 site/만 GitHub Pages로 배포
└─ site/                       🌐 배포되는 웹사이트 (이 폴더만 공개됨)
   ├─ index.html               화면 뼈대, 메타 정보 ✏️
   ├─ 404.html                 없는 주소용 페이지 ✏️
   ├─ css/style.css            디자인 토큰 + 전체 스타일 ✏️
   ├─ js/
   │  ├─ schema.js             사이트 문구, 분류 값과 이름표 ✏️
   │  ├─ supabase-config.js    Supabase 연결 정보 ✏️
   │  ├─ brand-service.js      데이터 불러오기 (Supabase / 샘플) ✏️
   │  ├─ app.js                목록·검색·필터·정렬, 주소 라우팅 ✏️
   │  ├─ detail.js             브랜드 상세 분석 화면 ✏️
   │  └─ favorites.js          즐겨찾기 ✏️
   ├─ assets/
   │  ├─ previews/             브랜드 첫 화면 캡처 (960×600 JPG)
   │  └─ og-image.jpg          공유 미리보기 기본 이미지
   ├─ data/sample-brands.js    ⚙️ 샘플 모드용
   ├─ brand/<slug>/            ⚙️ 브랜드별 공유 페이지
   └─ sitemap.xml, robots.txt  ⚙️ 검색엔진용
```

✏️ 직접 수정 · ⚙️ 자동 생성 (직접 고치지 않음)