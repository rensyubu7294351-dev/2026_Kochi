import type {
  Laundry,
  LaundryRow,
  OpeningHours,
  Sento,
  SentoRow,
  TaxiCompany,
  TaxiRow,
} from "@/types";
import { sbSelect } from "./supabaseRest";

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
  const rows = await sbSelect<SentoRow>("sento?select=*&order=created_at.asc");
  return rows.map(rowToSento);
}

export async function fetchLaundry(): Promise<Laundry[]> {
  const rows = await sbSelect<LaundryRow>(
    "laundry?select=*&order=created_at.asc",
  );
  return rows.map(rowToLaundry);
}

export async function fetchTaxi(): Promise<TaxiCompany[]> {
  const rows = await sbSelect<TaxiRow>("taxi?select=*&order=created_at.asc");
  return rows.map(rowToTaxi);
}
