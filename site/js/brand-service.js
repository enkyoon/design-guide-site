// 브랜드 데이터 접근은 모두 이 파일에서만 한다. 화면 코드(app.js, detail.js)는 Supabase를 직접 부르지 않는다.
//
// 데이터 출처
//   supabase 모드: js/supabase-config.js에 연결 정보가 있으면 Supabase brands 테이블에서 읽는다 (실제 데이터)
//   sample 모드  : 연결 정보가 비어 있으면 data/sample-brands.js(= 프로젝트 폴더의 data/brands.json에서 자동 생성)를 읽는다 (개발·미리보기용)
//
// 제공 함수
//   getBrands()               전체 브랜드 (한 번 불러오면 기억해 두고 다시 요청하지 않음)
//   getBrandBySlug(slug)      slug로 한 개

const SUPABASE_JS_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
const SAMPLE_DATA_URL = "data/sample-brands.js";
const FETCH_TIMEOUT_MS = 10000;
const MAX_BRANDS = 1000; // 한 번에 불러올 최대 개수. 이보다 많아지면 나눠 불러오기를 검토한다.

const BRAND_COLUMNS = [
  "slug", "name", "website_url", "region", "country", "industry", "industry_detail", "theme", "color_tone",
  "description", "analysis", "preview_image", "preview_captured_on", "design_keywords", "mood", "tags", "colors", "typography", "layout", "ui_style",
  "visual", "design_characteristics", "best_for", "things_to_avoid", "sources", "review_status", "updated_at"
].join(",");

const DATA_MODE =
  typeof SUPABASE_URL === "string" && SUPABASE_URL && typeof SUPABASE_ANON_KEY === "string" && SUPABASE_ANON_KEY
    ? "supabase"
    : "sample";

// <script>를 그때그때 불러온다 (샘플 모드에서는 Supabase 라이브러리를, Supabase 모드에서는 샘플 파일을 받지 않도록)
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`스크립트를 불러오지 못했습니다: ${src}`));
    document.head.appendChild(s);
  });
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`응답 시간 초과 (${ms / 1000}초)`)), ms))
  ]);
}

// ---------- DB 행 → 화면에서 쓰는 브랜드 객체 ----------
// 변환은 이 함수 한 곳에서만 한다. 필드 설명은 MD/DATA_GUIDE.md, 화면 쪽 이름은 js/schema.js 참고.
function fromRow(row) {
  const colors = row.colors || {};
  const groupColors = (key) => (colors[key] || []).map((c) => ({ hex: c.hex, role: c.role || c.name || "", group: key }));
  const palette = [...groupColors("primary"), ...groupColors("secondary"), ...groupColors("neutral")];
  const t = row.typography || {};
  const l = row.layout || {};
  const ui = row.ui_style || {};
  const v = row.visual || {};

  return normalizeSite({
    id: row.slug,
    slug: row.slug,
    name: row.name,
    url: row.website_url,
    region: row.region,
    country: row.country || "",
    industryGroup: row.industry,
    industry: row.industry_detail || (INDUSTRY_GROUPS[row.industry] || {}).label || row.industry,
    theme: row.theme,
    colorTone: row.color_tone || "",
    description: row.description || "",
    analysis: row.analysis || "",
    previewImage: row.preview_image || "",
    previewCapturedOn: row.preview_captured_on ? String(row.preview_captured_on).slice(0, 10) : "",
    moods: row.design_keywords || [],
    feel: row.mood || [],
    keywords: row.tags || [],
    tags: row.tags || [],
    palette,
    mainColors: palette.slice(0, 4).map((c) => c.hex),
    colorNote: colors.note || "",
    font: { name: t.family || "", category: t.category || "" },
    typography: {
      family: t.family,
      heading: t.heading,
      body: t.body,
      weight: (t.weights || []).join(" · "),
      traits: t.description,
      sample: t.sample
    },
    layout: {
      type: l.type,
      density: l.density,
      whitespace: l.whitespace,
      width: l.content_width,
      alignment: l.alignment,
      grid: l.grid,
      blocks: l.blocks
    },
    ui: {
      radius: ui.radius,
      shadow: ui.shadow,
      depth: ui.depth,
      imageStyle: v.image_style || [],
      components: { buttons: ui.button, cards: ui.card, inputs: ui.input, navigation: ui.navigation }
    },
    visual: { notes: v.characteristics, iconography: v.icon_style, graphics: v.graphics },
    characteristics: row.design_characteristics || [],
    bestFor: row.best_for || [],
    avoid: row.things_to_avoid || [],
    sources: row.sources || [],
    reviewStatus: row.review_status || "draft",
    updatedAt: row.updated_at ? String(row.updated_at).slice(0, 10) : ""
  });
}

// ---------- 불러오기 ----------

let supabaseClient = null;

async function fetchFromSupabase() {
  if (!supabaseClient) {
    if (!window.supabase) await loadScript(SUPABASE_JS_URL);
    // 로그인 기능이 없으므로 세션 저장을 끈다 (브라우저 저장소에 접근하지 않아 추적 방지 경고도 생기지 않음)
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
  }
  const { data, error } = await withTimeout(
    supabaseClient.from("brands").select(BRAND_COLUMNS).order("name").range(0, MAX_BRANDS - 1),
    FETCH_TIMEOUT_MS
  );
  if (error) throw error;
  return data || [];
}

async function fetchFromSample() {
  if (!window.SAMPLE_BRANDS) await loadScript(SAMPLE_DATA_URL);
  return window.SAMPLE_BRANDS || [];
}

const BRAND_NAME_ORDER = new Intl.Collator(["en", "ko"], { sensitivity: "base" });
let brandsPromise = null;

function getBrands() {
  if (!brandsPromise) {
    brandsPromise = (DATA_MODE === "supabase" ? fetchFromSupabase() : fetchFromSample())
      // 어디서 불러오든 같은 순서(이름순)가 되도록 여기서 한 번 정렬한다
      .then((rows) => rows.map(fromRow).sort((a, b) => BRAND_NAME_ORDER.compare(a.name, b.name)))
      .catch((err) => {
        brandsPromise = null; // 실패하면 기억하지 않아서 "다시 시도"가 새로 요청하게 함
        console.error(`[brand-service] 브랜드 데이터를 불러오지 못했습니다 (${DATA_MODE} 모드).`, err);
        throw err;
      });
  }
  return brandsPromise;
}

async function getBrandBySlug(slug) {
  const brands = await getBrands();
  return brands.find((b) => b.slug === slug) || null;
}
