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
