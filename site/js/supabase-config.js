// Supabase 연결 정보 (Supabase 대시보드 → Project Settings → API에서 복사)
//
// - 두 값이 비어 있으면 샘플 데이터 모드로 동작한다 (data/sample-brands.js).
// - 이 파일은 빌드 도구 없는 정적 사이트라서 환경변수(.env) 대신 쓰는 설정 파일이다.
//   브라우저에 그대로 공개되므로 publishable(anon) key만 넣는다. 이 키는 공개를 전제로 만든 키이고,
//   brands 테이블은 RLS로 "읽기만" 허용되어 있어 이 키로는 데이터를 바꿀 수 없다 (sql/schema.sql).
// - secret / service_role key는 절대 넣지 않는다 (RLS를 무시하는 관리자 키).
const SUPABASE_URL = "https://gezfjegkpawzogkgeoqy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_jpjs2nhIIJfQHhEW98ptXA_hkwwfntU";
