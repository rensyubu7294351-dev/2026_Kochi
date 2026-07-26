import type { Facility, FacilityRow } from "@/types";
import { supabase, isSupabaseConfigured } from "./supabase";

/** DBの行(snake_case) → アプリ内のFacility型 に変換 */
export function rowToFacility(row: FacilityRow): Facility {
  return {
    id: row.id,
    type: row.type,
    label: row.label ?? undefined,
    position: { lat: row.lat, lng: row.lng },
    note: row.note ?? undefined,
  };
}

/**
 * 全施設ピンを取得し、会場スラッグごとにまとめて返す。
 * Supabase未設定時は空を返す（画面は壊さない）。
 */
export async function fetchFacilitiesByVenue(): Promise<
  Record<string, Facility[]>
> {
  if (!isSupabaseConfigured) return {};

  const { data, error } = await supabase
    .from("facilities")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("施設ピンの取得に失敗:", error.message);
    return {};
  }

  const grouped: Record<string, Facility[]> = {};
  for (const row of (data ?? []) as FacilityRow[]) {
    (grouped[row.venue_slug] ??= []).push(rowToFacility(row));
  }
  return grouped;
}

/** 指定会場の施設ピンだけ取得（管理画面のリスト表示用に元の行も返す） */
export async function fetchVenueFacilityRows(
  venueSlug: string,
): Promise<FacilityRow[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("facilities")
    .select("*")
    .eq("venue_slug", venueSlug)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("施設ピンの取得に失敗:", error.message);
    return [];
  }
  return (data ?? []) as FacilityRow[];
}
