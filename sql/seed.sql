-- Supabase SQL Editor에서 그대로 실행하세요.
-- 1) 테이블 생성
create table if not exists public.sites (
  id text primary key,
  name text not null,
  url text not null,
  region text not null check (region in ('kr', 'asia', 'europe', 'us')),
  theme text not null check (theme in ('light', 'dark')),
  color_tone text not null check (color_tone in ('warm', 'cool', 'grayish', 'multi')),
  main_colors jsonb not null default '[]',
  font_name text not null,
  font_category text not null check (font_category in ('serif', 'sans', 'display', 'custom')),
  industry text not null,
  description text not null,
  tags jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- 2) 누구나 읽을 수 있도록 RLS 설정 (읽기 전용 공개 데이터)
alter table public.sites enable row level security;

drop policy if exists "sites are publicly readable" on public.sites;
create policy "sites are publicly readable"
  on public.sites for select
  using (true);

-- 3) 샘플 데이터 30건
insert into public.sites (id, name, url, region, theme, color_tone, main_colors, font_name, font_category, industry, description, tags)
values
  ('apple', 'Apple', 'https://www.apple.com', 'us', 'light', 'grayish', '["#000000","#f5f5f7","#1d1d1f"]', 'SF Pro', 'sans', '테크/전자기기', '절제된 여백과 큼직한 타이포로 제품 자체에 시선을 집중시키는 미니멀 디자인', '["미니멀","프리미엄","여백"]'),
  ('nike', 'Nike', 'https://www.nike.com', 'us', 'light', 'grayish', '["#111111","#ffffff","#fa5400"]', 'Nike Futura (custom)', 'custom', '쇼핑', '흑백 대비와 다이내믹한 이미지 크롭으로 스포츠의 에너지를 표현', '["다이내믹","스포츠","대비"]'),
  ('airbnb', 'Airbnb', 'https://www.airbnb.com', 'us', 'light', 'warm', '["#ff5a5f","#ffffff","#484848"]', 'Airbnb Cereal (custom)', 'custom', '여행/숙박', '따뜻한 코랄톤과 둥근 일러스트로 신뢰감 있는 여행 경험을 전달', '["따뜻함","친근함","일러스트"]'),
  ('spotify', 'Spotify', 'https://www.spotify.com', 'europe', 'dark', 'cool', '["#191414","#1db954","#ffffff"]', 'Spotify Circular (custom)', 'custom', '음악', '짙은 다크 배경 위 시그니처 그린으로 몰입감 있는 음악 경험을 강조', '["다크모드","생동감","몰입감"]'),
  ('netflix', 'Netflix', 'https://www.netflix.com', 'us', 'dark', 'warm', '["#141414","#e50914","#ffffff"]', 'Netflix Sans (custom)', 'custom', '미디어/엔터', '블랙 배경과 강렬한 레드 포인트로 몰입형 스트리밍 무드를 연출', '["임팩트","몰입감","엔터테인먼트"]'),
  ('notion', 'Notion', 'https://www.notion.so', 'us', 'light', 'grayish', '["#ffffff","#191919","#f7f6f3"]', 'Inter', 'sans', '생산성', '군더더기 없는 흑백 톤과 명확한 위계로 생산성에 집중한 구성', '["미니멀","명료함","툴"]'),
  ('linear', 'Linear', 'https://linear.app', 'us', 'dark', 'cool', '["#0c0c14","#5e6ad2","#ffffff"]', 'Inter', 'sans', '생산성', '딥퍼플 그라데이션과 정교한 인터랙션으로 세련된 개발자 경험을 구현', '["세련됨","그라데이션","디테일"]'),
  ('figma', 'Figma', 'https://www.figma.com', 'us', 'light', 'multi', '["#0acf83","#a259ff","#f24e1e","#1abcfe"]', 'Inter', 'sans', '디자인', '다채로운 브랜드 컬러와 명료한 그리드로 창의적인 협업 무드를 표현', '["컬러풀","협업","그리드"]'),
  ('stripe', 'Stripe', 'https://stripe.com', 'us', 'light', 'cool', '["#635bff","#0a2540","#ffffff"]', 'system sans', 'sans', '금융', '인디고 그라데이션과 정교한 모션으로 신뢰감 있는 개발자 경험을 전달', '["그라데이션","신뢰감","테크"]'),
  ('behance', 'Behance', 'https://www.behance.net', 'us', 'light', 'cool', '["#0057ff","#ffffff","#191919"]', 'system sans', 'sans', '포트폴리오', '강렬한 블루 포인트와 카드형 그리드로 작업물을 돋보이게 배치', '["갤러리","그리드","포트폴리오"]'),
  ('dribbble', 'Dribbble', 'https://dribbble.com', 'us', 'light', 'warm', '["#ea4c89","#ffffff","#333333"]', 'system sans', 'sans', '포트폴리오', '핑크 포인트 컬러와 밀도 높은 카드 그리드로 생동감 있는 커뮤니티를 표현', '["생동감","커뮤니티","카드형"]'),
  ('awwwards', 'Awwwards', 'https://www.awwwards.com', 'europe', 'dark', 'warm', '["#0d0d0d","#ffd200","#ffffff"]', 'system sans', 'sans', '디자인', '다크 배경과 옐로우 포인트로 실험적이고 도전적인 웹디자인을 큐레이션', '["실험적","큐레이션","포인트컬러"]'),
  ('naver', '네이버', 'https://www.naver.com', 'kr', 'light', 'cool', '["#03c75a","#ffffff","#191919"]', 'Pretendard', 'sans', '포털', '시그니처 그린과 정보 밀도 높은 레이아웃으로 실용적인 포털 경험을 제공', '["정보형","실용성","포털"]'),
  ('kakao', '카카오', 'https://www.kakaocorp.com', 'kr', 'light', 'warm', '["#fee500","#391b1b","#ffffff"]', 'Pretendard', 'sans', '메신저/SNS', '카카오 옐로우와 둥근 캐릭터 그래픽으로 친근한 브랜드 경험을 연출', '["친근함","캐릭터","브랜드"]'),
  ('toss', '토스', 'https://toss.im', 'kr', 'light', 'cool', '["#0064ff","#ffffff","#191f28"]', 'Toss Product Sans (custom)', 'custom', '금융', '선명한 블루톤과 큼직한 타이포로 직관적인 금융 경험을 설계', '["직관성","블루톤","핀테크"]'),
  ('coupang', '쿠팡', 'https://www.coupang.com', 'kr', 'light', 'cool', '["#0073e6","#ffffff","#333333"]', 'Pretendard', 'sans', '쇼핑', '로켓배송을 상징하는 블루 포인트와 밀도 높은 정보구조로 빠른 쇼핑을 지원', '["정보형","빠른탐색","쇼핑"]'),
  ('musinsa', '무신사', 'https://www.musinsa.com', 'kr', 'dark', 'grayish', '["#000000","#ffffff","#c4c4c4"]', 'Pretendard', 'sans', '쇼핑', '블랙앤화이트 기반의 스트리트 무드로 트렌디한 패션 감성을 연출', '["스트리트","트렌디","패션"]'),
  ('baemin', '배달의민족', 'https://www.baemin.com', 'kr', 'light', 'cool', '["#2ac1bc","#ffffff","#333333"]', '한나체 (custom)', 'display', '푸드딜리버리', '민트톤과 위트있는 한나체 타이포로 유쾌한 브랜드 개성을 표현', '["위트","브랜드개성","타이포"]'),
  ('line', 'LINE', 'https://line.me', 'asia', 'light', 'cool', '["#06c755","#ffffff","#000000"]', 'system sans', 'sans', '메신저/SNS', '라인 그린과 캐릭터 일러스트로 친근한 커뮤니케이션 경험을 제공', '["친근함","캐릭터","커뮤니케이션"]'),
  ('muji', 'MUJI', 'https://www.muji.com', 'asia', 'light', 'grayish', '["#f7f5f0","#3a3a3a","#c9a97e"]', 'system sans', 'sans', '리빙/라이프스타일', '무채색과 넉넉한 여백을 활용한 절제된 미니멀리즘으로 브랜드 철학을 전달', '["절제미","여백","라이프스타일"]'),
  ('uniqlo', '유니클로', 'https://www.uniqlo.com', 'asia', 'light', 'warm', '["#ff0000","#ffffff","#111111"]', 'system sans', 'sans', '쇼핑', '강렬한 레드 로고와 그리드형 상품 나열로 실용적인 쇼핑 경험을 구성', '["그리드","실용성","쇼핑"]'),
  ('sony', 'Sony', 'https://www.sony.com', 'asia', 'dark', 'grayish', '["#000000","#ffffff","#8c8c8c"]', 'system sans', 'sans', '테크/전자기기', '블랙 기반의 하이테크 무드와 절제된 타이포로 프리미엄 감성을 강조', '["하이테크","프리미엄","절제미"]'),
  ('nintendo', 'Nintendo', 'https://www.nintendo.com', 'asia', 'light', 'warm', '["#e60012","#ffffff","#1a1a1a"]', 'Nintendo Display (custom)', 'display', '게임', '경쾌한 레드 포인트와 둥근 그래픽으로 즐거운 게임 경험을 전달', '["경쾌함","그래픽","게임"]'),
  ('ikea', 'IKEA', 'https://www.ikea.com', 'europe', 'light', 'multi', '["#0058a3","#ffda1a","#ffffff"]', 'Noto Sans', 'sans', '리빙/라이프스타일', '블루와 옐로우의 선명한 대비로 친근하고 실용적인 라이프스타일을 제안', '["대비","실용성","친근함"]'),
  ('bmw', 'BMW', 'https://www.bmw.com', 'europe', 'dark', 'cool', '["#0c0c0c","#1c69d4","#c6c6c6"]', 'BMW Type Next (custom)', 'custom', '자동차', '딥블루와 메탈릭 그레이 톤으로 정교한 엔지니어링 감성을 표현', '["엔지니어링","메탈릭","정교함"]'),
  ('louisvuitton', 'Louis Vuitton', 'https://www.louisvuitton.com', 'europe', 'dark', 'grayish', '["#000000","#c9a86a","#ffffff"]', 'LV Serif (custom)', 'serif', '명품/뷰티', '블랙과 골드의 대비, 클래식한 세리프 타이포로 럭셔리한 헤리티지를 강조', '["럭셔리","헤리티지","클래식"]'),
  ('chanel', 'Chanel', 'https://www.chanel.com', 'europe', 'light', 'grayish', '["#000000","#ffffff","#d0d0d0"]', 'Chanel Serif (custom)', 'serif', '명품/뷰티', '블랙앤화이트의 절제된 대비와 세리프 타이포로 시대를 초월한 우아함을 표현', '["우아함","절제미","클래식"]'),
  ('riotgames', 'Riot Games', 'https://www.riotgames.com', 'us', 'dark', 'multi', '["#0a0e14","#d13639","#eb0029","#005a82"]', 'Riot Display (custom)', 'display', '게임', '다크 배경 위 강렬한 그래픽과 커스텀 타이포로 몰입감 있는 게임 세계관을 구현', '["몰입감","세계관","그래픽"]'),
  ('steam', 'Steam', 'https://store.steampowered.com', 'us', 'dark', 'cool', '["#1b2838","#66c0f4","#ffffff"]', 'system sans', 'sans', '게임', '짙은 블루그레이 톤과 밀도 높은 레이아웃으로 방대한 게임 라이브러리를 탐색하게 함', '["정보형","밀도","게임플랫폼"]'),
  ('playstation', 'PlayStation', 'https://www.playstation.com', 'us', 'dark', 'cool', '["#003791","#ffffff","#000000"]', 'system sans', 'sans', '게임', '딥블루와 화이트의 강한 대비로 강력한 콘솔 브랜드 이미지를 전달', '["강렬함","브랜드","콘솔"]')
on conflict (id) do update set
  name = excluded.name,
  url = excluded.url,
  region = excluded.region,
  theme = excluded.theme,
  color_tone = excluded.color_tone,
  main_colors = excluded.main_colors,
  font_name = excluded.font_name,
  font_category = excluded.font_category,
  industry = excluded.industry,
  description = excluded.description,
  tags = excluded.tags;
