-- =============================================================
-- コインランドリー初期データ（8店舗）
-- すでに投入済み（2026-08-01）。作り直す場合のみ
-- Supabase → SQL Editor に貼り付けて実行してください。
-- 営業時間は hours.note に自由記述で保存する運用。
-- =============================================================

insert into public.laundry (name, address, lat, lng, hours, note, url, is_24h) values
  ('コインランドリー大高 梅の辻店', '高知市梅の辻21-8', 33.55485, 133.54142,
   '{"mon":null,"tue":null,"wed":null,"thu":null,"fri":null,"sat":null,"sun":null,"note":"不明"}',
   '2019年にできたみたい、穴場かも',
   'https://maps.app.goo.gl/GZXnSqpkZUqxSYCp7', false),

  ('スーパーランドリーbB イオンモール高知店', '高知市秦南町1-4-8（イオンモール高知内）', 33.57503, 133.54222,
   '{"mon":null,"tue":null,"wed":null,"thu":null,"fri":null,"sat":null,"sun":null,"note":"7:00〜24:00"}',
   '皆行きそう…',
   'https://maps.app.goo.gl/8qqPJnFmzBvvASZ27', false),

  ('コインランドリーぱる', '高知県高知市宝永町3-26', 33.56036, 133.55464,
   '{"mon":null,"tue":null,"wed":null,"thu":null,"fri":null,"sat":null,"sun":null,"note":"6:00〜23:00"}',
   '住宅街の中で場所がちょっとわかりにくいらしい',
   'https://maps.app.goo.gl/VLXjp67RNpevG8wQ7', false),

  ('コインランドリーbB 百石町店', '高知市百石町4丁目25-11', 33.54502, 133.5436,
   '{"mon":null,"tue":null,"wed":null,"thu":null,"fri":null,"sat":null,"sun":null,"note":"24時間営業"}',
   '割と台数もある🙆‍♀️何より24時間営業',
   null, true),

  ('スマイルウォッシュ 桜井店', '高知市宝永町6-10', 33.561462, 133.554199,
   '{"mon":null,"tue":null,"wed":null,"thu":null,"fri":null,"sat":null,"sun":null,"note":"24時間営業"}',
   'コインランドリーぱるのすぐ近く',
   'https://www.google.com/maps/place/?q=place_id:ChIJH8dj3coZTjURgqcyEExf3E0', true),

  ('ランドリーK', '高知市北御座11-12', 33.568043, 133.561493,
   '{"mon":null,"tue":null,"wed":null,"thu":null,"fri":null,"sat":null,"sun":null,"note":"24時間営業"}',
   'とさのさと・サニーマート隣',
   'https://www.google.com/maps/place/?q=place_id:ChIJeXc2ogkdTjURD--WSynZ0cs', true),

  ('コインランドリー（コーポすずき3）', '高知市二十代町9-2', 33.563534, 133.539917,
   '{"mon":null,"tue":null,"wed":null,"thu":null,"fri":null,"sat":null,"sun":null,"note":"24時間営業"}',
   '洗濯300円・乾燥100円/10分と安い。駐車場脇の階段裏で少し分かりにくい',
   'https://www.google.com/maps/place/?q=place_id:ChIJL5ycIu4ZTjURLbK_2g35TXc', true),

  ('コインランドリー HA', '高知市堺町10-25', 33.558342, 133.540268,
   '{"mon":null,"tue":null,"wed":null,"thu":null,"fri":null,"sat":null,"sun":null,"note":"24時間営業"}',
   '両替機が故障中との口コミが複数。⚠️100円玉持参推奨。屋台安兵衛の近く',
   'https://www.google.com/maps/place/?q=place_id:ChIJ86bI_hwZTjUR2COAjhAmfXs', true);
