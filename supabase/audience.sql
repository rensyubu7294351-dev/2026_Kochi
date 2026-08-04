-- =============================================================
-- ユーザー用 / サポーター用 の2系統に分けるためのマイグレーション
-- Supabase → SQL Editor に貼り付けて実行してください（1回だけでOK）。
--
-- ・各テーブルに audience 列を追加（既存データはすべて 'user' 扱い）
-- ・既存データを 'supporter' としてコピーし、初期状態を同じにする
--   （すでにサポーター用の行がある場合はコピーしないので、
--     誤って2回実行しても重複しません）
-- =============================================================

-- ---- 1. audience 列の追加 ----
alter table public.facilities add column if not exists audience text not null default 'user';
alter table public.sento      add column if not exists audience text not null default 'user';
alter table public.laundry    add column if not exists audience text not null default 'user';
alter table public.taxi       add column if not exists audience text not null default 'user';

-- 想定外の値が入らないようにする
alter table public.facilities drop constraint if exists facilities_audience_check;
alter table public.facilities add constraint facilities_audience_check
  check (audience in ('user', 'supporter'));
alter table public.sento drop constraint if exists sento_audience_check;
alter table public.sento add constraint sento_audience_check
  check (audience in ('user', 'supporter'));
alter table public.laundry drop constraint if exists laundry_audience_check;
alter table public.laundry add constraint laundry_audience_check
  check (audience in ('user', 'supporter'));
alter table public.taxi drop constraint if exists taxi_audience_check;
alter table public.taxi add constraint taxi_audience_check
  check (audience in ('user', 'supporter'));

-- ---- 2. 絞り込みを速くするインデックス ----
create index if not exists facilities_audience_idx on public.facilities (audience);
create index if not exists sento_audience_idx      on public.sento (audience);
create index if not exists laundry_audience_idx    on public.laundry (audience);
create index if not exists taxi_audience_idx       on public.taxi (audience);

-- ---- 3. 既存データをサポーター用にコピー（初期状態を同じにする）----
insert into public.facilities (venue_slug, type, label, lat, lng, note, audience)
select venue_slug, type, label, lat, lng, note, 'supporter'
from public.facilities
where audience = 'user'
  and not exists (select 1 from public.facilities where audience = 'supporter');

insert into public.sento (name, address, lat, lng, hours, tel, url, map_url, note, price, has_sauna, access, audience)
select name, address, lat, lng, hours, tel, url, map_url, note, price, has_sauna, access, 'supporter'
from public.sento
where audience = 'user'
  and not exists (select 1 from public.sento where audience = 'supporter');

insert into public.laundry (name, address, lat, lng, hours, tel, url, note, is_24h, audience)
select name, address, lat, lng, hours, tel, url, note, is_24h, 'supporter'
from public.laundry
where audience = 'user'
  and not exists (select 1 from public.laundry where audience = 'supporter');

insert into public.taxi (name, tel, note, url, audience)
select name, tel, note, url, 'supporter'
from public.taxi
where audience = 'user'
  and not exists (select 1 from public.taxi where audience = 'supporter');

-- ---- 確認用 ----
-- select 'facilities' as t, audience, count(*) from public.facilities group by 1,2
-- union all select 'sento', audience, count(*) from public.sento group by 1,2
-- union all select 'laundry', audience, count(*) from public.laundry group by 1,2
-- union all select 'taxi', audience, count(*) from public.taxi group by 1,2
-- order by 1,2;
