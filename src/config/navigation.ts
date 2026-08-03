import { LIFEHACK_APP_URL } from "@/lib/constants";

/** 下部タブバーに並べる項目 */
export type NavItem = {
  /** タブの表示名（5つ横に並ぶため短く） */
  label: string;
  href: string;
  /** 外部リンク（別タブで開く）か */
  external?: boolean;
  emoji: string;
};

/**
 * アプリの主要ナビゲーション（下部タブバーの内容）。
 * トップページは廃止したため、ここがページ移動の唯一の入口。
 */
export const MAIN_NAV: NavItem[] = [
  { label: "演舞会場", href: "/venues", emoji: "🗾" },
  { label: "銭湯", href: "/tourism/sento", emoji: "♨️" },
  { label: "ランドリー", href: "/tourism/laundry", emoji: "🧺" },
  { label: "タクシー", href: "/tourism/taxi", emoji: "🚕" },
  { label: "ライフハック", href: LIFEHACK_APP_URL, external: true, emoji: "💡" },
];

/** アプリ内ページのパス一覧 */
export const APP_ROUTES: string[] = MAIN_NAV.filter((i) => !i.external).map(
  (i) => i.href,
);

/** "/" にアクセスされた時の既定の転送先 */
export const DEFAULT_ROUTE = "/venues";

/**
 * アプリ内の既知ページか判定する（クエリ・末尾スラッシュは無視）。
 * 保存済みの「最後に開いたページ」が古くなっていた場合に、
 * 存在しないURLへ転送するのを防ぐ。
 */
export function isKnownRoute(path: string | null | undefined): boolean {
  if (!path || !path.startsWith("/")) return false;
  const pathname = path.split(/[?#]/)[0].replace(/\/+$/, "");
  return APP_ROUTES.includes(pathname);
}
