import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  isSupabaseConfigured,
} from "./supabaseEnv";

/**
 * Supabase の REST API から読み取り（supabase-js を使わず軽量に fetch）。
 * 読み取りは RLS で公開許可済みなので anon キーだけでOK。
 * @param query 例: "facilities?select=*&order=created_at.asc"
 */
export async function sbSelect<T>(query: string): Promise<T[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) {
      console.error("Supabase read failed:", res.status);
      return [];
    }
    return (await res.json()) as T[];
  } catch (e) {
    console.error("Supabase read error:", e);
    return [];
  }
}
