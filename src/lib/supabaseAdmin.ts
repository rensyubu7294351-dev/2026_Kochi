import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * サーバー専用のSupabaseクライアント（service_roleキー）。
 * RLSをバイパスして書き込みができる。
 * このモジュールは "server-only" 指定により、誤ってクライアントに
 * バンドルされるとビルドエラーになる（秘密鍵の漏洩防止）。
 */
/** service_role キーとURLが設定済みか */
export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/**
 * 環境変数のキー値を安全化する。
 * 誤って改行や値の重複貼り付けが混入しても、最初の有効なトークン（JWT）だけを使う。
 * （JWT には空白が含まれないので、空白区切りの先頭を取れば正しい値になる）
 */
function sanitizeKey(v: string | undefined): string {
  return (v ?? "").trim().split(/\s+/)[0] ?? "";
}

export function getAdminClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const serviceKey = sanitizeKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !serviceKey) {
    throw new Error(
      "Supabaseの環境変数が未設定です（NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY）",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
