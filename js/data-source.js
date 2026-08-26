// 사이트 데이터 소스: Supabase 연동 정보가 채워져 있으면 DB에서, 아니면 js/data.js의 로컬 샘플에서 읽어온다.
const IS_SUPABASE_CONFIGURED =
  typeof SUPABASE_URL === "string" &&
  typeof SUPABASE_ANON_KEY === "string" &&
  !SUPABASE_URL.startsWith("YOUR_") &&
  !SUPABASE_ANON_KEY.startsWith("YOUR_");

let supabaseClient = null;
if (IS_SUPABASE_CONFIGURED && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function normalizeRow(row) {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    region: row.region,
    theme: row.theme,
    colorTone: row.color_tone,
    mainColors: row.main_colors || [],
    font: { name: row.font_name, category: row.font_category },
    industry: row.industry,
    description: row.description,
    tags: row.tags || []
  };
}

let cachedSites = null;

async function loadSites() {
  if (cachedSites) return cachedSites;

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("sites").select("*").order("name");
      if (!error && data && data.length > 0) {
        cachedSites = data.map(normalizeRow);
        return cachedSites;
      }
      if (error) console.warn("Supabase 조회 실패, 로컬 데이터로 대체합니다.", error.message);
    } catch (e) {
      console.warn("Supabase 연결 실패, 로컬 데이터로 대체합니다.", e);
    }
  }

  cachedSites = SITES;
  return cachedSites;
}

async function loadSiteById(id) {
  const sites = await loadSites();
  return sites.find((s) => s.id === id) || null;
}
