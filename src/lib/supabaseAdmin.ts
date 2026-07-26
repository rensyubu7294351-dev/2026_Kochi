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

export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabaseの環境変数が未設定です（NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY）",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
