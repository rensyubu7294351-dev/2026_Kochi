-- =============================================================
-- アプリ設定（キー・バリュー）テーブル
-- 銭湯・コインランドリーの「まとめGoogleマップURL」と「説明文」を保存する。
-- Supabase → SQL Editor に貼り付けて実行してください。
-- =============================================================

create table if not exists public.app_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- 誰でも読み取り可（書き込みはservice_role経由の管理APIのみ）
drop policy if exists "public read app_settings" on public.app_settings;
create policy "public read app_settings"
  on public.app_settings
  for select
  using (true);

-- 使用するキー:
--   sento_map_url     : 銭湯まとめマップの埋め込みURL
--   sento_desc        : 銭湯ページの説明文
--   laundry_map_url   : コインランドリーまとめマップの埋め込みURL
--   laundry_desc      : コインランドリーページの説明文
