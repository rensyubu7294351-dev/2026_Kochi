# 高知よさこい チームマップ

高知よさこい祭りに参加する自チーム向けの、非公式マップ／情報アプリ。
公式運営が出す会場マップとは別に、チームに特化した情報をまとめる。

## 技術スタック

- **Next.js (App Router) + TypeScript + React**
- **Tailwind CSS**（スマホ前提のレスポンシブ）
- **地図: Google Maps** — `@vis.gl/react-google-maps`（Google公式のReactラッパー）
- **デプロイ: Vercel**
- **データ管理**: APIやDBは使わず、`src/data/*.ts` に手書きで持つ静的データ方式。
  会場は毎年更新される程度なので、これが一番シンプルで壊れにくい。

## フォルダ構成

```
.
├── public/
│   └── images/
│       ├── venues/     # 14会場の写真（01-kamimachi.jpg …）
│       ├── icons/      # 施設ピンのアイコン（first-aid.svg …）
│       └── common/     # ロゴなど共通画像
├── src/
│   ├── app/                      # ルーティング（App Router）
│   │   ├── layout.tsx            # 全体レイアウト・フォント
│   │   ├── page.tsx              # ① ホーム画面（各ページへのハブ）
│   │   ├── venues/
│   │   │   ├── page.tsx          # 演舞会場 一覧（画像/名前タップで個別へ）
│   │   │   └── [venueSlug]/
│   │   │       └── page.tsx      # 会場個別マップページ
│   │   └── tourism/              # 高知観光編
│   │       ├── page.tsx          # 観光編トップ
│   │       ├── sento/page.tsx    # 銭湯マップ
│   │       ├── laundry/page.tsx  # コインランドリーマップ
│   │       └── taxi/page.tsx     # タクシー会社一覧
│   ├── components/
│   │   ├── layout/               # ヘッダー等（今後）
│   │   ├── map/                  # 地図の共通部品（Provider）
│   │   ├── venues/               # 会場マップ・凡例
│   │   ├── tourism/              # 観光スポットカード
│   │   └── ui/                   # 汎用UI（今後）
│   ├── config/
│   │   ├── facilities.ts         # 施設タイプの表示メタ（色・ラベル・アイコン）
│   │   └── navigation.ts         # ホーム／観光編のメニュー定義
│   ├── data/
│   │   ├── venues.ts             # ★14会場データ（座標・施設・メダル）
│   │   ├── sento.ts              # 銭湯データ
│   │   ├── laundry.ts            # コインランドリーデータ
│   │   └── taxi.ts               # タクシー会社データ
│   ├── hooks/
│   │   └── useGeolocation.ts     # 現在地取得（ルート検索用）
│   ├── lib/
│   │   ├── constants.ts          # 環境変数・中心座標などの定数
│   │   └── maps.ts               # Googleマップのルート/場所URL生成
│   └── types/
│       └── index.ts              # 全型定義
└── .env.example                  # 必要な環境変数のひな形
```

## 要件と実装場所の対応

| 要件 | 実装場所 |
| ---- | -------- |
| ① 14会場の個別Googleマップ／タブ・ボタン切替 | `app/venues/[venueSlug]`, `components/venues/VenueMap.tsx` |
| ② 施設ピン（救護所・休憩所・トイレ等、会場ごとに有無） | `data/venues.ts` の `facilities`, `config/facilities.ts` |
| ③ メダル会場のアイコン表示 | `data/venues.ts` の `hasMedal` → 一覧/詳細でバッジ表示 |
| ④ 現在地からのルート検索 | `hooks/useGeolocation.ts` + `lib/maps.ts` |
| ⑤ ホーム→演舞場／観光／ライフハック切替 | `app/page.tsx`, `config/navigation.ts` |
| 高知観光編（銭湯・コインランドリー・タクシー） | `app/tourism/*`, `data/{sento,laundry,taxi}.ts` |

## セットアップ

```bash
npm install
cp .env.example .env.local   # Google Maps APIキー等を記入
npm run dev
```

Google Maps は [Google Cloud Console](https://console.cloud.google.com/) で
「Maps JavaScript API」を有効化し、APIキーに**HTTPリファラー制限**をかけること。

## データの更新手順（公式マップ公開後）

1. **座標**: `src/data/venues.ts` の各 `center` を正確な値に修正。
2. **施設ピン**: 各会場の `facilities` 配列に、実在する施設だけを追加。
   全会場に全施設が揃うわけではない点に注意（休憩所が無い会場もある）。
3. **メダル**: メダルがもらえる会場は `hasMedal: true` に。
4. **画像**: `public/images/venues/` に会場写真を配置。
5. **観光データ**: `src/data/{sento,laundry,taxi}.ts` を実データで埋める。

型定義（`src/types/index.ts`）に沿って書けば、エディタの補完と型チェックが効く。
