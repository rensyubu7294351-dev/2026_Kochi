import { sbSelect } from "./supabaseRest";

type SettingRow = { key: string; value: string | null };

/**
 * アプリ設定をまとめて取得し、key→value のマップで返す。
 * （銭湯・コインランドリーの地図URL・説明文など）
 */
export async function fetchSettings(): Promise<Record<string, string>> {
  const rows = await sbSelect<SettingRow>("app_settings?select=key,value");
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value ?? "";
  return map;
}
