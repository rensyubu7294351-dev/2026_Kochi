// =============================================================
// アプリ全体で使う型定義
// =============================================================

/** 緯度経度 */
export type LatLng = {
  lat: number;
  lng: number;
};

// -------------------------------------------------------------
// 演舞会場編
// -------------------------------------------------------------

/**
 * 施設の種類。
 * 会場マップにピン留めするアイコンの種類と1:1で対応する。
 * 新しい施設を増やす場合はここに追加し、src/config/facilities.ts の
 * FACILITY_META にも表示情報（ラベル・色・アイコン）を追加する。
 */
export type FacilityType =
  | "first-aid" // 救護所
  | "rest-area" // 休憩所
  | "toilet-public" // 公衆トイレ
  | "toilet-temporary" // 仮設トイレ
  | "bus-waiting" // バス待機場所
  | "dance-start" // 踊り開始位置
  | "dance-end" // 踊り終了位置
  | "reception" // 受付
  | "drugstore" // ドラッグストア
  | "convenience" // コンビニ
  | "shop" // お店
  | "judging" // 審査会場
  | "water-station" // 給水所
  | "cheer-point"; // 頑張りポイント（あと少し！の目印）

/** 1つの施設ピン（アプリ内での扱い） */
export type Facility = {
  id: string;
  type: FacilityType;
  /** ピンの表示名（例: 「北側 仮設トイレ」）。省略時は施設タイプの既定ラベルを使う */
  label?: string;
  position: LatLng;
  /** 補足メモ（営業時間・注意事項など） */
  note?: string;
};

/**
 * Supabase の facilities テーブル1行（DBのカラム名 = snake_case）。
 * 管理者画面で入力し、ユーザーの地図に表示するピンの永続データ。
 */
export type FacilityRow = {
  id: string;
  venue_slug: string;
  type: FacilityType;
  label: string | null;
  lat: number;
  lng: number;
  note: string | null;
  created_at: string;
};

/** 演舞会場 */
export type Venue = {
  /** 公式の会場番号 1〜14 */
  id: number;
  /** URL用スラッグ（例: "kamimachi"） */
  slug: string;
  /** 会場名（例: 「上町」） */
  name: string;
  /** 所在地（例: 「上町4・5丁目」） */
  address: string;
  /** 地図の初期中心座標 */
  center: LatLng;
  /** 地図の初期ズーム。省略時は共通デフォルト */
  zoom?: number;
  /**
   * 競演場の長さ（踊り開始位置を基準としたメートル）。
   * ステージ形式の会場は "stage"。未設定なら表示しない。
   */
  courseLength?: number | "stage";
  /** メダルがもらえる会場か */
  hasMedal: boolean;
  /** 会場イメージ画像パス（public/images/venues 配下） */
  image: string;
  /** この会場に存在する施設ピン（会場ごとに有無が異なる） */
  facilities: Facility[];
};

// -------------------------------------------------------------
// 高知観光編
// -------------------------------------------------------------

/** 曜日ごとの営業時間。休業日は null */
export type OpeningHours = {
  mon: string | null;
  tue: string | null;
  wed: string | null;
  thu: string | null;
  fri: string | null;
  sat: string | null;
  sun: string | null;
  /** 補足（不定休・最終受付など） */
  note?: string;
};

/** 観光スポット共通の基底型（銭湯・コインランドリー等） */
export type TourismSpot = {
  id: string;
  name: string;
  address: string;
  position: LatLng;
  hours: OpeningHours;
  tel?: string;
  url?: string;
  note?: string;
};

/** 銭湯 */
export type Sento = TourismSpot & {
  /** 入浴料（円） */
  price?: number;
  /** サウナ有無 */
  hasSauna?: boolean;
  /** アクセスの目安（例: 「タクシー10〜15分」） */
  access?: string;
  /** Googleマップの共有リンク（無ければ座標から自動生成） */
  mapUrl?: string;
};

/** コインランドリー */
export type Laundry = TourismSpot & {
  /** 24時間営業か */
  is24h?: boolean;
};

/** タクシー会社（配車用の一覧。地図ピンは必須ではない） */
export type TaxiCompany = {
  id: string;
  name: string;
  tel: string;
  /** 対応エリア・特徴のメモ */
  note?: string;
  url?: string;
};

// -------------------------------------------------------------
// Supabase の各テーブル1行（DBカラム = snake_case）
// -------------------------------------------------------------

export type SentoRow = {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  hours: OpeningHours | null;
  tel: string | null;
  url: string | null;
  note: string | null;
  price: number | null;
  has_sauna: boolean;
  access: string | null;
  map_url: string | null;
  created_at: string;
};

export type LaundryRow = {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  hours: OpeningHours | null;
  tel: string | null;
  url: string | null;
  note: string | null;
  is_24h: boolean;
  created_at: string;
};

export type TaxiRow = {
  id: string;
  name: string;
  tel: string;
  note: string | null;
  url: string | null;
  created_at: string;
};

/** 観光編の管理対象の種類 */
export type TourismKind = "sento" | "laundry" | "taxi";
