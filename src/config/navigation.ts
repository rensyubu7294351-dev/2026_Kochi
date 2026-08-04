/**
 * アプリは同じ機能を2系統で提供する。
 * - user      : これまでのユーザー用（URLは "/" 直下）
 * - supporter : サポーター用（URLは "/supporter" 配下）
 * 表示・機能は同じで、中のデータ（施設ピン・銭湯など）だけ別々に持つ。
 */
export type Audience = "user" | "supporter";

export const AUDIENCES: Audience[] = ["user", "supporter"];

/** 系統ごとのURLの接頭辞 */
export const AUDIENCE_PREFIX: Record<Audience, string> = {
  user: "",
  supporter: "/supporter",
};

/** 管理画面などで出す系統の表示名 */
export const AUDIENCE_LABEL: Record<Audience, string> = {
  user: "ユーザー用",
  supporter: "サポーター用",
};

/** 下部タブバーに並べる項目 */
export type NavItem = {
  /** タブの表示名（横に並ぶため短く） */
  label: string;
  href: string;
  emoji: string;
};

/** 系統によらない共通のページ構成（パスは接頭辞なし） */
const PAGES: { label: string; path: string; emoji: string }[] = [
  { label: "演舞会場", path: "/venues", emoji: "🗾" },
  { label: "銭湯", path: "/tourism/sento", emoji: "♨️" },
  { label: "ランドリー", path: "/tourism/laundry", emoji: "🧺" },
  { label: "タクシー", path: "/tourism/taxi", emoji: "🚕" },
  { label: "MER", path: "/mer", emoji: "🏥" },
];

/** URLのパスから系統を判定する */
export function audienceFromPath(pathname: string): Audience {
  return pathname === "/supporter" || pathname.startsWith("/supporter/")
    ? "supporter"
    : "user";
}

/** 指定した系統の下部タブ項目 */
export function navFor(audience: Audience): NavItem[] {
  const prefix = AUDIENCE_PREFIX[audience];
  return PAGES.map((p) => ({
    label: p.label,
    emoji: p.emoji,
    href: `${prefix}${p.path}`,
  }));
}

/** 指定した系統のページのパス一覧 */
export function routesFor(audience: Audience): string[] {
  return navFor(audience).map((i) => i.href);
}

/** 指定した系統のトップ（"/" や "/supporter"）を開いた時の既定の転送先 */
export function defaultRouteFor(audience: Audience): string {
  return `${AUDIENCE_PREFIX[audience]}/venues`;
}

/** 「最後に開いたページ」を系統ごとに保存するためのキー */
export function lastPathKey(audience: Audience): string {
  return `lastPath:${audience}`;
}

/**
 * その系統の既知ページか判定する（クエリ・末尾スラッシュは無視）。
 * 保存済みの「最後に開いたページ」が古くなっていた場合に、
 * 存在しないURLへ転送するのを防ぐ。
 */
export function isKnownRoute(
  path: string | null | undefined,
  audience: Audience,
): boolean {
  if (!path || !path.startsWith("/")) return false;
  const pathname = path.split(/[?#]/)[0].replace(/\/+$/, "");
  return routesFor(audience).includes(pathname);
}
