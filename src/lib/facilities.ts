import type { Facility, FacilityRow } from "@/types";
import type { Audience } from "@/config/navigation";
import { sbSelect } from "./supabaseRest";

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
export async function fetchFacilitiesByVenue(
  audience: Audience,
): Promise<Record<string, Facility[]>> {
  const rows = await sbSelect<FacilityRow>(
    `facilities?select=*&audience=eq.${audience}&order=created_at.asc`,
  );
  const grouped: Record<string, Facility[]> = {};
  for (const row of rows) {
    (grouped[row.venue_slug] ??= []).push(rowToFacility(row));
  }
  return grouped;
}

/** 指定会場の施設ピンだけ取得（管理画面のリスト表示用に元の行も返す） */
export async function fetchVenueFacilityRows(
  venueSlug: string,
  audience: Audience,
): Promise<FacilityRow[]> {
  return sbSelect<FacilityRow>(
    `facilities?select=*&audience=eq.${audience}&venue_slug=eq.${encodeURIComponent(
      venueSlug,
    )}&order=created_at.asc`,
  );
}
