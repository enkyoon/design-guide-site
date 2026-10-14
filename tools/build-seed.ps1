# data/brands.json(브랜드 데이터 원본)을 검사한 뒤 아래 두 파일을 만든다.
#   sql/seed.sql            Supabase SQL Editor에 붙여 넣어 실행 (여러 번 실행해도 안전: slug 기준으로 덮어씀)
#   site/data/sample-brands.js   Supabase 연결 정보가 비어 있을 때 쓰는 샘플 모드용
#
#   site/brand/<slug>/index.html 공유용 페이지 (링크 미리보기에 브랜드 제목·설명·이미지가 나오게. 열면 상세 화면으로 이동)
#   site/sitemap.xml, site/robots.txt  검색엔진용
#   sql/seed.sql, sql/setup.sql
#
# 실행: PowerShell에서  powershell -ExecutionPolicy Bypass -File tools\build-seed.ps1

# 배포 주소 (끝에 / 없이). 공유 미리보기 이미지·사이트맵은 전체 주소가 필요하다.
# GitHub Pages 기본 주소로 넣어 두었으니, 실제 배포 주소가 다르면 여기만 바꾸고 다시 실행한다.
$SiteUrl = "https://enkyoon.github.io/design-guide-site"
$SiteName = "Design Reference"

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot   # 프로젝트 폴더
$site = Join-Path $root "site"              # 배포되는 웹사이트 폴더
$enc = New-Object System.Text.UTF8Encoding($false)

$jsonText = [System.IO.File]::ReadAllText((Join-Path $root "data\brands.json"), $enc)
$brands = $jsonText | ConvertFrom-Json

# 값 비교는 대소문자를 구분한다 (DB 제약과 같게: Korea ≠ korea)
# ---------- 값 규칙 (sql/schema.sql, MD/DATA_GUIDE.md와 같게 유지) ----------
$allowed = @{
  region          = @("korea", "usa", "europe", "japan", "china", "southeast-asia", "other")
  industry        = @("technology", "finance", "commerce", "fashion", "media", "food", "travel", "entertainment", "education", "mobility", "healthcare", "other")
  theme           = @("light", "dark", "mixed")
  color_tone      = @("warm", "cool", "grayish", "multi")
  design_keywords = @("minimal", "modern", "bold", "editorial", "luxury", "playful", "friendly", "technical")
  review_status   = @("draft", "reviewed")
}
$required = @("slug", "name", "website_url", "region", "industry", "theme", "description")

$errors = New-Object System.Collections.Generic.List[string]
$seen = @{}
foreach ($b in $brands) {
  $who = if ($b.slug) { $b.slug } else { "(slug 없음: $($b.name))" }
  foreach ($f in $required) {
    if (-not $b.$f) { $errors.Add("$who : 필수 항목 '$f'이(가) 비어 있음") }
  }
  if ($b.slug -and $b.slug -cnotmatch '^[a-z0-9]+(-[a-z0-9]+)*$') { $errors.Add("$who : slug는 영문 소문자·숫자·하이픈만 (예: louis-vuitton)") }
  if ($b.slug) {
    if ($seen.ContainsKey($b.slug)) { $errors.Add("$who : slug 중복") } else { $seen[$b.slug] = $true }
  }
  foreach ($f in @("region", "industry", "theme", "color_tone", "review_status")) {
    if ($b.$f -and ($allowed[$f] -cnotcontains $b.$f)) { $errors.Add("$who : $f 값 '$($b.$f)'은(는) 허용되지 않음 → $($allowed[$f] -join ', ')") }
  }
  foreach ($k in @($b.design_keywords)) {
    if ($k -and ($allowed.design_keywords -cnotcontains $k)) { $errors.Add("$who : design_keywords '$k'은(는) 허용되지 않음 → $($allowed.design_keywords -join ', ')") }
  }
  if ($b.website_url -and $b.website_url -notmatch '^https?://') { $errors.Add("$who : website_url은 http(s)://로 시작해야 함") }
  if ($b.colors) {
    foreach ($g in @("primary", "secondary", "neutral")) {
      foreach ($c in @($b.colors.$g)) {
        if ($c -and $c.hex -notmatch '^#[0-9a-fA-F]{6}$') { $errors.Add("$who : colors.$g 의 hex '$($c.hex)' 형식 오류 (#rrggbb)") }
      }
    }
  }
  if ($b.preview_image) {
    if ($b.preview_image -match '^https?://') { }
    elseif (-not (Test-Path (Join-Path $site $b.preview_image) -PathType Leaf)) { $errors.Add("$who : preview_image 파일이 없음 → $($b.preview_image)") }
  }
  if ($b.preview_captured_on -and $b.preview_captured_on -notmatch '^\d{4}-\d{2}-\d{2}$') { $errors.Add("$who : preview_captured_on은 YYYY-MM-DD 형식") }
  foreach ($s in @($b.sources)) {
    if ($s -and $s.url -notmatch '^https?://') { $errors.Add("$who : sources의 url '$($s.url)' 형식 오류") }
  }
}

if ($errors.Count) {
  Write-Host "데이터 오류 $($errors.Count)건 — 파일을 만들지 않았습니다." -ForegroundColor Red
  $errors | ForEach-Object { Write-Host " - $_" }
  exit 1
}

# ---------- sql/seed.sql ----------
if ($jsonText.Contains('$seed$')) { throw "brands.json 안에 `$seed`$ 문자열이 있으면 안 됩니다." }

$cols = @("slug", "name", "website_url", "region", "country", "industry", "industry_detail", "theme", "color_tone",
  "description", "analysis", "preview_image", "preview_captured_on", "design_keywords", "mood", "tags", "colors", "typography", "layout", "ui_style",
  "visual", "design_characteristics", "best_for", "things_to_avoid", "sources", "review_status")
# JSON에 없는 항목은 테이블 기본값으로 채운다
$defaults = @{
  design_keywords = "'{}'::text[]"; mood = "'{}'::text[]"; tags = "'{}'::text[]"
  colors = "'{`"primary`": [], `"secondary`": [], `"neutral`": []}'::jsonb"
  typography = "'{}'::jsonb"; layout = "'{}'::jsonb"; ui_style = "'{}'::jsonb"; visual = "'{}'::jsonb"
  design_characteristics = "'[]'::jsonb"; best_for = "'{}'::text[]"; things_to_avoid = "'{}'::text[]"
  sources = "'[]'::jsonb"; review_status = "'draft'"
}
$selectList = ($cols | ForEach-Object { if ($defaults.ContainsKey($_)) { "coalesce(r.$_, $($defaults[$_]))" } else { "r.$_" } }) -join ",`n  "
$updateList = ($cols | Where-Object { $_ -ne "slug" } | ForEach-Object { "$_ = excluded.$_" }) -join ",`n  "

$sql = @"
-- 자동 생성 파일: 직접 고치지 말고 data/brands.json을 고친 뒤 tools/build-seed.ps1을 실행하세요.
-- 브랜드 $($brands.Count)개. sql/schema.sql을 먼저 실행한 뒤 이 파일을 실행합니다.
-- 같은 slug가 이미 있으면 내용을 덮어씁니다(여러 번 실행해도 안전).

insert into public.brands (
  $($cols -join ", ")
)
select
  $selectList
from jsonb_populate_recordset(null::public.brands, `$seed`$
$($jsonText.TrimEnd())
`$seed`$::jsonb) as r
on conflict (slug) do update set
  $updateList;
"@
[System.IO.File]::WriteAllText((Join-Path $root "sql\seed.sql"), $sql.Replace("`r`n", "`n") + "`n", $enc)

# ---------- sql/setup.sql (처음 한 번: 테이블 만들기 + 데이터 넣기 + 확인을 한 파일로) ----------
$schemaSql = [System.IO.File]::ReadAllText((Join-Path $root "sql\schema.sql"), $enc).TrimEnd()
$setup = "-- 자동 생성 파일: sql/schema.sql + sql/seed.sql을 합친 것. Supabase SQL Editor에 통째로 붙여 넣고 Run.`n" +
         "-- 여러 번 실행해도 안전하다 (같은 slug는 덮어씀).`n`n" + $schemaSql + "`n`n" + $sql.Replace("`r`n", "`n").TrimEnd() + "`n`n" +
         "-- 확인: 아래 결과에 브랜드 수($($brands.Count))와 이미지가 있는 브랜드 수가 나오면 성공`n" +
         "select count(*) as brands, count(preview_image) as with_preview, count(*) filter (where review_status = 'reviewed') as reviewed from public.brands;`n"
[System.IO.File]::WriteAllText((Join-Path $root "sql\setup.sql"), $setup, $enc)
# ---------- site/data/sample-brands.js ----------
$js = "// 자동 생성 파일: data/brands.json을 고친 뒤 tools/build-seed.ps1을 실행하세요.`n" +
      "// Supabase 연결 정보가 비어 있을 때만 쓰는 샘플 데이터입니다. (원본: 프로젝트 폴더의 data/brands.json) 실제 데이터는 Supabase의 brands 테이블입니다.`n" +
      "window.SAMPLE_BRANDS = " + $jsonText.TrimEnd() + ";`n"
[System.IO.File]::WriteAllText((Join-Path $site "data\sample-brands.js"), $js.Replace("`r`n", "`n"), $enc)

Write-Host "완료: 브랜드 $($brands.Count)개 → sql/seed.sql, sql/setup.sql, site/data/sample-brands.js" -ForegroundColor Green

# ---------- brand/<slug>/index.html (공유용 페이지) ----------
function Esc([string]$t) { if ($null -eq $t) { return "" }; return $t.Replace("&", "&amp;").Replace('"', "&quot;").Replace("<", "&lt;").Replace(">", "&gt;") }
$brandDir = Join-Path $site "brand"
if (Test-Path $brandDir) { Remove-Item -Recurse -Force $brandDir }
foreach ($b in $brands) {
  $dir = Join-Path $brandDir $b.slug
  New-Item -ItemType Directory -Force $dir | Out-Null
  $title = Esc "$($b.name) 디자인 분석 | $SiteName"
  $desc = Esc "$($b.name) 웹사이트의 컬러, 타이포그래피, 레이아웃, UI 특징. $($b.description)"
  $image = if ($b.preview_image -match '^https?://') { $b.preview_image } elseif ($b.preview_image) { "$SiteUrl/$($b.preview_image)" } else { "$SiteUrl/assets/og-image.jpg" }
  $target = "../../#/brand/$($b.slug)"
  $html = @"
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<!-- 자동 생성 파일 (tools/build-seed.ps1). 공유 미리보기용이며, 열면 상세 화면으로 바로 이동한다. -->
<title>$title</title>
<meta name="description" content="$desc" />
<link rel="canonical" href="$SiteUrl/brand/$($b.slug)/" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="$SiteName" />
<meta property="og:locale" content="ko_KR" />
<meta property="og:title" content="$title" />
<meta property="og:description" content="$desc" />
<meta property="og:url" content="$SiteUrl/brand/$($b.slug)/" />
<meta property="og:image" content="$image" />
<meta name="twitter:card" content="summary_large_image" />
<meta http-equiv="refresh" content="0; url=$target" />
<script>location.replace("$target");</script>
</head>
<body>
<p><a href="$target">$(Esc $b.name) 디자인 분석 보기</a></p>
</body>
</html>
"@
  [System.IO.File]::WriteAllText((Join-Path $dir "index.html"), $html.Replace("`r`n", "`n"), $enc)
}

# ---------- sitemap.xml / robots.txt ----------
$today = (Get-Date).ToString("yyyy-MM-dd")
$urls = @("  <url><loc>$SiteUrl/</loc><lastmod>$today</lastmod></url>") + ($brands | ForEach-Object { "  <url><loc>$SiteUrl/brand/$($_.slug)/</loc><lastmod>$today</lastmod></url>" })
$sitemap = "<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n<urlset xmlns=`"http://www.sitemaps.org/schemas/sitemap/0.9`">`n" + ($urls -join "`n") + "`n</urlset>`n"
[System.IO.File]::WriteAllText((Join-Path $site "sitemap.xml"), $sitemap, $enc)
[System.IO.File]::WriteAllText((Join-Path $site "robots.txt"), "User-agent: *`nAllow: /`n`nSitemap: $SiteUrl/sitemap.xml`n", $enc)

Write-Host "완료: 공유 페이지 $($brands.Count)개 → site/brand/, site/sitemap.xml, site/robots.txt (배포 주소: $SiteUrl)" -ForegroundColor Green