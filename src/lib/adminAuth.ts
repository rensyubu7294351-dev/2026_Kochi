import "server-only";

/** 管理者パスワードの照合（サーバー側でのみ実行） */
export function isValidAdminPassword(password: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return typeof password === "string" && password === expected;
}

/** リクエストヘッダー or ボディからパスワードを取り出して照合 */
export function checkAdminHeader(req: Request): boolean {
  return isValidAdminPassword(req.headers.get("x-admin-password"));
}
