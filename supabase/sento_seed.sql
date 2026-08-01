-- =============================================================
-- 銭湯テーブルの列追加＋初期データ（5施設）
-- Supabase → SQL Editor に貼り付けて実行してください。
-- 営業時間は hours.note に自由記述で保存する運用（ランドリーと同じ）。
-- access  : タクシー・徒歩の目安（ピン詳細カードに表示）
-- map_url : Googleマップの共有リンク（cid付き。無ければ座標から自動生成）
-- =============================================================

alter table public.sento add column if not exists access text;
alter table public.sento add column if not exists map_url text;

insert into public.sento (name, address, lat, lng, hours, tel, url, map_url, note, price, has_sauna, access) values
  ('高知ぽかぽか温泉', '高知市北川添8-20', 33.57476, 133.55878,
   '{"mon":null,"tue":null,"wed":null,"thu":null,"fri":null,"sat":null,"sun":null,"note":"8:00〜24:00・年中無休"}',
   '088-861-1126',
   'https://www.souyu.co.jp/shisetsu/kouchi_pokapoka',
   'https://maps.google.com/?cid=12540426611826982880',
   '⚠️最終受付 23:30 ⚠️今年は事前予約制！チーム単位で予約しているはずなので、自分が該当しているか高知担当に問い合わせてください。',
   null, false, 'タクシー10〜15分'),

  ('土佐望月温泉 姫若子の湯', '高知市蛯ノ丸12-2', 33.56409, 133.56812,
   '{"mon":null,"tue":null,"wed":null,"thu":null,"fri":null,"sat":null,"sun":null,"note":"8:00〜翌1:00"}',
   '088-855-4126',
   'https://himewako.jp/',
   'https://maps.google.com/?cid=3764919306981165664',
   '⚠️最終受付 0:30',
   null, false, 'タクシー10〜15分'),

  ('土佐ぽかぽか温泉', '高知市神田1197-1', 33.54104, 133.51210,
   '{"mon":null,"tue":null,"wed":null,"thu":null,"fri":null,"sat":null,"sun":null,"note":"9:00〜翌1:00"}',
   '088-834-1126',
   'https://pokaon-tosa.com/',
   'https://maps.google.com/?cid=10726953621752714746',
   '⚠️最終受付 24:30',
   null, false, 'タクシー20分'),

  ('高砂湯', '高知市新本町2-7-15', 33.569319, 133.548356,
   '{"mon":null,"tue":null,"wed":null,"thu":null,"fri":null,"sat":null,"sun":null,"note":"13:30〜22:30・火曜定休"}',
   '088-875-0621',
   null,
   'https://maps.google.com/?cid=14130282426001517548',
   null,
   450, false, '高知駅から徒歩約900m');

 