import type {
  Laundry,
  LaundryRow,
  OpeningHours,
  Sento,
  SentoRow,
  TaxiCompany,
  TaxiRow,
} from "@/types";
import { supabase, isSupabaseConfigured } from "./supabase";

/** 空の営業時間（未設定時のフォールバック） */
export const EMPTY_HOURS: OpeningHours = {
  mon: null,
  tue: null,
  wed: null,
  thu: null,
  fri: null,
  sat: null,
  sun: null,
};

// ---- DB行 → アプリ型 ----

export function rowToSento(r: SentoRow): Sento {
  return {
    id: r.id,
    name: r.name,
    address: r.address ?? "",
    position: { lat: r.lat, lng: r.lng },
    hours: r.hours ?? EMPTY_HOURS,
    tel: r.tel ?? undefined,
    url: r.url ?? undefined,
    note: r.note ?? undefined,
    price: r.price ?? undefined,
    hasSauna: r.has_sauna,
  };
}

export function rowToLaundry(r: LaundryRow): Laundry {
  return {
    id: r.id,
    name: r.name,
    address: r.address ?? "",
    position: { lat: r.lat, lng: r.lng },
    hours: r.hours ?? EMPTY_HOURS,
    tel: r.tel ?? undefined,
    url: r.url ?? undefined,
    note: r.note ?? undefined,
    is24h: r.is_24h,
  };
}

export function rowToTaxi(r: TaxiRow): TaxiCompany {
  return {
    id: r.id,
    name: r.name,
    tel: r.tel,
    note: r.note ?? undefined,
    url: r.url ?? undefined,
  };
}

// ---- 取得（ユーザー・管理画面 共通の読み取り） ----

export async function fetchSento(): Promise<Sento[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("sento")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("銭湯の取得に失敗:", error.message);
    return [];
  }
  return ((data ?? []) as SentoRow[]).map(rowToSento);
}

export async function fetchLaundry(): Promise<Laundry[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("laundry")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("コインランドリーの取得に失敗:", error.message);
    return [];
  }
  return ((data ?? []) as LaundryRow[]).map(rowToLaundry);
}

export async function fetchTaxi(): Promise<TaxiCompany[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("taxi")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("タクシーの取得に失敗:", error.message);
    return [];
  }
  return ((data ?? []) as TaxiRow[]).map(rowToTaxi);
}
