-- =============================================================
-- 高知観光編テーブル（銭湯 / コインランドリー / タクシー）
-- Supabase → SQL Editor に貼り付けて実行してください。
-- 営業時間(hours)は jsonb で {mon,tue,...,sun,note} の形で保存します。
-- =============================================================

-- 銭湯
create table if not exists public.sento (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  hours jsonb,
  tel text,
  url text,
  note text,
  price integer,
  has_sauna boolean not null default false,
  created_at timestamptz not null default now()
);

-- コインランドリー
create table if not exists public.laundry (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  hours jsonb,
  tel text,
  url text,
  note text,
  is_24h boolean not null default false,
  created_at timestamptz not null default now()
);

-- タクシー会社（地図・営業時間なし）
create table if not exists public.taxi (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tel text not null,
  note text,
  url text,
  created_at timestamptz not null default now()
);

-- 行レベルセキュリティ有効化
alter table public.sento enable row level security;
alter table public.laundry enable row level security;
alter table public.taxi enable row level security;

-- 誰でも「読み取り」だけ許可（書き込みはservice_role経由の管理APIのみ）
drop policy if exists "public read sento" on public.sento;
create policy "public read sento" on public.sento for select using (true);

drop policy if exists "public read laundry" on public.laundry;
create policy "public read laundry" on public.laundry for select using (true);

drop policy if exists "public read taxi" on public.taxi;
create policy "public read taxi" on public.taxi for select using (true);
