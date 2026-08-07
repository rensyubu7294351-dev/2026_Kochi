import { AUDIENCES, type Audience } from "@/config/navigation";

/**
 * 管理画面で「どこを編集するか」。
 * "both" は、ユーザー用とサポーター用の両方へ同じ内容を反映する指定。
 */
export type EditTarget = Audience | "both";

export const EDIT_TARGETS: EditTarget[] = [...AUDIENCES, "both"];

/** 管理画面での表示名 */
export const EDIT_TARGET_LABEL: Record<EditTarget, string> = {
  user: "ユーザー用",
  supporter: "サポーター用",
  both: "両方",
};

/** リクエストで渡ってきた値を編集対象として読む（不正値は従来どおりユーザー用） */
export function parseEditTarget(value: unknown): EditTarget {
  if (value === "both") return "both";
  return AUDIENCES.includes(value as Audience) ? (value as Audience) : "user";
}

/** その編集対象で実際に書き込む系統（両方なら2つ） */
export function writeAudiences(target: EditTarget): Audience[] {
  return target === "both" ? [...AUDIENCES] : [target];
}

/**
 * 一覧表示や取得に使う系統。
 * 両方モードでは、ユーザー用を基準（見本）として表示する。
 */
export function readAudience(target: EditTarget): Audience {
  return target === "both" ? "user" : target;
}
