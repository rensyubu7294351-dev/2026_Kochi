"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Map,
  AdvancedMarker,
  useMap,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import type { FacilityRow, FacilityType, LatLng, Venue } from "@/types";
import { VENUES, getVenueBySlug } from "@/data/venues";
import { FACILITY_META, FACILITY_ORDER } from "@/config/facilities";
import { DEFAULT_VENUE_ZOOM, GOOGLE_MAPS_MAP_ID } from "@/lib/constants";
import { fetchVenueFacilityRows } from "@/lib/facilities";
import { GoogleMapProvider } from "@/components/map/GoogleMapProvider";
import { VenueTabs } from "@/components/venues/VenueTabs";

/** 会場が変わったら地図を移動 */
function MapController({ venue }: { venue: Venue }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.panTo(venue.center);
    map.setZoom(venue.zoom ?? DEFAULT_VENUE_ZOOM);
  }, [map, venue]);
  return null;
}

/**
 * 管理者用の施設ピン編集画面。
 * 使い方: 会場タブ選択 → 地図をタップして位置指定 → 種類/名前を入れて保存。
 * 保存内容はSupabaseに書き込まれ、ユーザーの地図に反映される。
 */
export function AdminVenueEditor({ password }: { password: string }) {
  const [activeSlug, setActiveSlug] = useState(VENUES[0].slug);
  const venue = getVenueBySlug(activeSlug) ?? VENUES[0];

  const [rows, setRows] = useState<FacilityRow[]>([]);
  const [loading, setLoading] = useState(false);

  // 入力中の下書き
  const [draft, setDraft] = useState<LatLng | null>(null);
  const [type, setType] = useState<FacilityType>(FACILITY_ORDER[0]);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setRows(await fetchVenueFacilityRows(activeSlug));
    setLoading(false);
  }, [activeSlug]);

  useEffect(() => {
    reload();
    setDraft(null);
  }, [reload]);

  function handleMapClick(e: MapMouseEvent) {
    const ll = e.detail.latLng;
    if (ll) setDraft({ lat: ll.lat, lng: ll.lng });
  }

  async function handleSave() {
    if (!draft) {
      setMessage("先に地図をタップして位置を指定してください");
      return;
    }
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/facilities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({
        venueSlug: activeSlug,
        type,
        label,
        note,
        lat: draft.lat,
        lng: draft.lng,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setDraft(null);
      setLabel("");
      setNote("");
      setMessage("保存しました");
      reload();
    } else {
      const j = await res.json().catch(() => ({}));
      setMessage(`保存に失敗: ${j.error ?? res.status}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("このピンを削除しますか？")) return;
    const res = await fetch(`/api/facilities?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (res.ok) reload();
    else setMessage("削除に失敗しました");
  }

  return (
    <div className="pb-10">
      <VenueTabs activeSlug={activeSlug} onSelect={setActiveSlug} />

      {/* 地図（タップで位置指定） */}
      <div className="px-4 pt-3">
        <p className="mb-2 text-sm text-gray-600">
          地図をタップして位置を指定 → 下で種類を選んで「保存」
        </p>
      </div>
      <GoogleMapProvider>
        <div className="aspect-square w-full sm:aspect-[16/10]">
          <Map
            defaultCenter={venue.center}
            defaultZoom={venue.zoom ?? DEFAULT_VENUE_ZOOM}
            mapId={GOOGLE_MAPS_MAP_ID || undefined}
            gestureHandling="greedy"
            onClick={handleMapClick}
          >
            <MapController venue={venue} />
            {/* 既存ピン */}
            {rows.map((r) => {
              const meta = FACILITY_META[r.type];
              return (
                <AdvancedMarker
                  key={r.id}
                  position={{ lat: r.lat, lng: r.lng }}
                  title={r.label ?? meta.label}
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/icons/${meta.icon}`}
                      alt={meta.label}
                      width={40}
                      height={51}
                    />
                    <span className="pointer-events-none absolute left-1/2 top-[47px] -translate-x-1/2 whitespace-nowrap rounded-full border border-gray-200 bg-white/95 px-1.5 py-[1px] text-[10px] font-bold leading-tight text-gray-800 shadow-sm">
                      {r.label ?? meta.label}
                    </span>
                  </div>
                </AdvancedMarker>
              );
            })}
            {/* 下書きピン（未保存） */}
            {draft && (
              <AdvancedMarker position={draft} title="ここに追加">
                <span className="flex h-7 w-7 animate-pulse items-center justify-center rounded-full border-2 border-white bg-black text-white shadow">
                  ＋
                </span>
              </AdvancedMarker>
            )}
          </Map>
        </div>
      </GoogleMapProvider>

      {/* 入力フォーム */}
      <div className="mt-4 px-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold">ピンを追加</h2>

          <label className="mb-1 block text-xs text-gray-500">種類</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as FacilityType)}
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {FACILITY_ORDER.map((t) => (
              <option key={t} value={t}>
                {FACILITY_META[t].label}
              </option>
            ))}
          </select>

          <label className="mb-1 block text-xs text-gray-500">
            名前（任意・例: 北側 仮設トイレ）
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />

          <label className="mb-1 block text-xs text-gray-500">
            メモ（任意・例: 22時まで）
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />

          <p className="mb-3 text-xs text-gray-400">
            位置:{" "}
            {draft
              ? `${draft.lat.toFixed(6)}, ${draft.lng.toFixed(6)}`
              : "未指定（地図をタップ）"}
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !draft}
              className="flex-1 rounded-lg bg-yosakoi py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              onClick={() => setDraft(null)}
              disabled={!draft}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm disabled:opacity-50"
            >
              クリア
            </button>
          </div>
          {message && (
            <p className="mt-2 text-xs text-gray-600">{message}</p>
          )}
        </div>
      </div>

      {/* 既存ピン一覧 */}
      <div className="mt-4 px-4">
        <h2 className="mb-2 text-sm font-bold">
          {venue.name} のピン（{rows.length}件）
        </h2>
        {loading ? (
          <p className="text-xs text-gray-400">読み込み中...</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-gray-400">まだピンがありません。</p>
        ) : (
          <ul className="grid gap-2">
            {rows.map((r) => {
              const meta = FACILITY_META[r.type];
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white p-2 text-sm shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/icons/${meta.icon}`}
                    alt=""
                    width={22}
                    height={28}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{r.label || meta.label}</p>
                    {r.note && (
                      <p className="text-xs text-gray-500">{r.note}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-500"
                  >
                    削除
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
