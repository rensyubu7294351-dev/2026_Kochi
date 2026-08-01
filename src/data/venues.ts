import type { Venue } from "@/types";

/**
 * 演舞会場データ（全14会場）。
 *
 * ⚠️ 注意 ⚠️
 * - center の座標は「概算」です。公式会場マップ公開後に正確な値へ差し替えてください。
 * - facilities（施設ピン）は現時点では空です。公式情報が出たら、各会場に
 *   実在する施設だけを追加してください。全会場に全施設が揃うわけではありません。
 * - hasMedal（メダル会場か）も公式発表に合わせて true / false を設定してください。
 * - image は public/images/venues/ 配下に置いた画像ファイル名を指します。
 *   画像未用意でもビルドは通り、コンポーネント側でプレースホルダ表示にします。
 *
 * facilities の書き方例:
 *   facilities: [
 *     { id: "kamimachi-start", type: "dance-start", position: { lat: 33.5, lng: 133.5 } },
 *     { id: "kamimachi-wc1", type: "toilet-temporary", label: "北側 仮設トイレ",
 *       position: { lat: 33.5, lng: 133.5 }, note: "22時まで" },
 *   ]
 */
export const VENUES: Venue[] = [
  {
    id: 1,
    slug: "kamimachi",
    name: "上町",
    address: "上町4・5丁目",
    // 上町5丁目周辺を初期表示
    center: { lat: 33.556934, lng: 133.518023 },
    zoom: 17,
    courseLength: 240,
    hasMedal: true,
    image: "/images/venues/01-kamimachi.jpg",
    facilities: [],
  },
  {
    id: 2,
    slug: "manma",
    name: "万々",
    address: "万々商店街",
    // 円行寺口駅〜万々整骨院付近を含む範囲を初期表示
    center: { lat: 33.5679, lng: 133.52 },
    zoom: 16,
    courseLength: 400,
    hasMedal: false,
    image: "/images/venues/02-manma.jpg",
    facilities: [],
  },
  {
    id: 3,
    slug: "masugata",
    name: "枡形",
    address: "升形商店街",
    // 枡形駅〜大膳町公園を含む範囲を初期表示
    center: { lat: 33.5578, lng: 133.5268 },
    zoom: 16,
    courseLength: 100,
    hasMedal: true,
    image: "/images/venues/03-masugata.jpg",
    facilities: [],
  },
  {
    id: 4,
    slug: "atago",
    name: "愛宕",
    address: "愛宕商店街",
    // 愛宕病院〜あたご幼稚園を含む範囲を初期表示
    center: { lat: 33.5679, lng: 133.5368 },
    zoom: 16,
    courseLength: 500,
    hasMedal: true,
    image: "/images/venues/04-atago.jpg",
    facilities: [],
  },
  {
    id: 5,
    slug: "otesuji",
    name: "追手筋",
    address: "追手筋1・2丁目",
    // 追手前公園〜藤並公園を含む範囲を初期表示
    center: { lat: 33.5614, lng: 133.5379 },
    zoom: 16,
    courseLength: 350,
    hasMedal: true,
    image: "/images/venues/05-otesuji.jpg",
    facilities: [],
  },
  {
    id: 6,
    slug: "obiyamachi",
    name: "帯屋町",
    address: "帯屋町アーケード",
    // 帯屋町2丁目商店街全域を初期表示
    center: { lat: 33.5602, lng: 133.5358 },
    zoom: 17,
    courseLength: 550,
    hasMedal: false,
    image: "/images/venues/06-obiyamachi.jpg",
    facilities: [],
  },
  {
    id: 7,
    slug: "kyomachi",
    name: "京町",
    address: "京町商店街",
    // 京町商店街全域を初期表示
    center: { lat: 33.5603, lng: 133.5423 },
    zoom: 17,
    courseLength: 100,
    hasMedal: false,
    image: "/images/venues/07-kyomachi.jpg",
    facilities: [],
  },
  {
    id: 8,
    slug: "chuo-park",
    name: "東洋電化中央公園",
    address: "東洋電化中央公園",
    // 東洋電化中央公園（高知市中央公園）全域を初期表示
    center: { lat: 33.5602, lng: 133.5407 },
    zoom: 17,
    courseLength: "stage",
    hasMedal: false,
    image: "/images/venues/08-chuo-park.jpg",
    facilities: [],
  },
  {
    id: 9,
    slug: "kochi-castle",
    name: "高知城",
    address: "高知城",
    center: { lat: 33.5606, lng: 133.5311 },
    courseLength: "stage",
    hasMedal: false,
    image: "/images/venues/09-kochi-castle.jpg",
    facilities: [],
  },
  {
    id: 10,
    slug: "harimayabashi",
    name: "はりまや橋",
    address: "はりまや橋商店街",
    // よさこい情報交流館〜はりまや橋商店街を初期表示
    center: { lat: 33.5600, lng: 133.5443 },
    zoom: 17,
    courseLength: 130,
    hasMedal: true,
    image: "/images/venues/10-harimayabashi.jpg",
    facilities: [],
  },
  {
    id: 11,
    slug: "saibaba",
    name: "菜園場",
    address: "菜園場商店街",
    center: { lat: 33.5605, lng: 133.549 },
    courseLength: 300,
    hasMedal: true,
    image: "/images/venues/11-saibaba.jpg",
    facilities: [],
  },
  {
    id: 12,
    slug: "umenotsuji",
    name: "梅ノ辻",
    address: "梅ノ辻町内会",
    // 高知市立潮江中学校〜梅ノ辻交番を含む範囲を初期表示
    center: { lat: 33.554, lng: 133.5422 },
    zoom: 17,
    courseLength: 200,
    hasMedal: true,
    image: "/images/venues/12-umenotsuji.jpg",
    facilities: [],
  },
  {
    id: 13,
    slug: "kochi-station",
    name: "高知駅前",
    address: "高知駅前",
    center: { lat: 33.567, lng: 133.5445 },
    courseLength: "stage",
    hasMedal: false,
    image: "/images/venues/13-kochi-station.jpg",
    facilities: [],
  },
  {
    id: 14,
    slug: "hata",
    name: "秦",
    address: "イオンモール高知",
    // イオンモール高知を初期表示
    center: { lat: 33.5761, lng: 133.5424 },
    zoom: 16,
    courseLength: 200,
    hasMedal: true,
    image: "/images/venues/14-hata.jpg",
    facilities: [],
  },
];

/** slug から会場を引く（個別ページ用） */
export function getVenueBySlug(slug: string): Venue | undefined {
  return VENUES.find((v) => v.slug === slug);
}
