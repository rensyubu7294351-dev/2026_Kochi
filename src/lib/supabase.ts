import { createClient } from "@supabase/supabase-js";

/**
 * 公開用（ブラウザ）Supabaseクライアント。
 * 匿名キーを使い、施設ピンの「読み取り」のみ行う。
 * 書き込みは RLS で禁止し、サーバーのAPIルート経由（秘密鍵）でのみ許可する。
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** URL/キーが未設定でもインポート時にクラッシュしないようにする */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "placeholder-anon-key",
);
