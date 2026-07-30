/**
 * Supabaseの公開用環境変数（クライアント安全）。
 * supabase-js を読み込まないので、クライアントバンドルを軽く保てる。
 *
 * 値に誤って改行や重複貼り付けが混じっても壊れないよう、
 * 空白区切りの先頭トークンだけを採用する（JWT・URLに空白は無いため安全）。
 */
function clean(v: string | undefined): string {
  return (v ?? "").trim().split(/\s+/)[0] ?? "";
}

export const SUPABASE_URL = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const SUPABASE_ANON_KEY = clean(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
