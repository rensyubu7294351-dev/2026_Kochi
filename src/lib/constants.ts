/** 地図・アプリ共通の定数 */

/** 高知市中心部のおおよその中心（会場一覧の初期表示用） */
export const KOCHI_CENTER = { lat: 33.5597, lng: 133.5311 };

/** 会場個別マップの既定ズーム */
export const DEFAULT_VENUE_ZOOM = 17;

/** 環境変数（クライアント公開） */
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
export const GOOGLE_MAPS_MAP_ID =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "";
// 既存のライフハックアプリのURL（環境変数が未設定・空でも既定URLで開けるように || を使用）
export const LIFEHACK_APP_URL =
  process.env.NEXT_PUBLIC_LIFEHACK_APP_URL ||
  "https://729summerlifehacks.vercel.app/api/auth/line";
