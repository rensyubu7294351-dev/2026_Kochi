-- =============================================================
-- 施設ピン テーブル定義（Supabase）
-- Supabase ダッシュボード → SQL Editor に貼り付けて実行してください。
-- =============================================================

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  venue_slug text not null,          -- 会場スラッグ（kamimachi 等）
  type text not null,                -- 施設タイプ（first-aid 等）
  label text,                        -- 表示名（任意）
  lat double precision not null,     -- 緯度
  lng double precision not null,     -- 経度
  note text,                         -- メモ（任意）
  created_at timestamptz not null default now()
);

-- 会場ごとの取得を速くするインデックス
create index if not exists facilities_venue_slug_idx
  on public.facilities (venue_slug);

-- 行レベルセキュリティを有効化
alter table public.facilities enable row level security;

-- 誰でも「読み取り」だけ許可（ユーザーの地図表示用）
drop policy if exists "public read facilities" on public.facilities;
create policy "public read facilities"
  on public.facilities
  for select
  using (true);

-- 書き込み（insert/update/delete）のポリシーは作らない。
-- → 匿名キーでは書き込み不可。書き込みはサーバーの service_role キー
--   （RLSをバイパス）経由でのみ行う = 管理者APIのみ。
