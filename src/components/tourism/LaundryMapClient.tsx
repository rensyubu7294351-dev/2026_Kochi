"use client";

import { useEffect, useState } from "react";
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import type { Laundry, LatLng } from "@/types";
import { fetchLaundry } from "@/lib/tourism";
import { buildDirectionsUrl, buildPlaceUrl } from "@/lib/maps";
import { KOCHI_CENTER, GOOGLE_MAPS_MAP_ID } from "@/lib/constants";
import { GoogleMapProvider } from "@/components/map/GoogleMapProvider";

/** 営業時間の表示用テキスト（曜日別は未使用で note に自由記述を入れている） */
function hoursText(spot: Laundry): string {
  if (spot.hours.note) return spot.hours.note;
  if (spot.is24h) return "24時間営業";
  return "不明";
}

/** 全ピンが収まるように地図を移動。選択中はそのピンへ寄る。 */
function MapController({
  spots,
  focus,
}: {
  spots: Laundry[];
  focus: LatLng | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (focus) {
      map.panTo(focus);
      map.setZoom(17);
      return;
    }
    if (spots.length === 0) return;
    const lats = spots.map((s) => s.position.lat);
    const lngs = spots.map((s) => s.position.lng);
    map.fitBounds(
      {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs),
      },
      48,
    );
  }, [map, spots, focus]);
  return null;
}

/**
 * コインランドリーのピン地図＋一覧。
 * Supabaseの laundry テーブルを読み込み、🧺アイコン付きピンで表示する。
 * ピン/一覧をタップすると詳細カード（住所・営業時間・メモ・リンク）を表示。
 */
export function LaundryMapClient() {
  const [spots, setSpots] = useState<Laundry[] | null>(null);
  const [selected, setSelected] = useState<Laundry | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLaundry().then((list) => {
      if (!cancelled) setSpots(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (spots === null) {
    return <p className="text-sm text-gray-400">読み込み中...</p>;
  }
  if (spots.length === 0) {
    return (
      <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-400">
        コインランドリーは準備中です（管理画面から登録できます）。
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <GoogleMapProvider>
        <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
          <div className="aspect-square w-full sm:aspect-[16/10]">
            <Map
              defaultCenter={KOCHI_CENTER}
              defaultZoom={14}
              mapId={GOOGLE_MAPS_MAP_ID || undefined}
              gestureHandling="greedy"
              clickableIcons={false}
            >
              <MapController
                spots={spots}
                focus={selected ? selected.position : null}
              />
              {spots.map((s) => {
                const active = selected?.id === s.id;
                return (
                  <AdvancedMarker
                    key={s.id}
                    position={s.position}
                    title={s.name}
                    zIndex={active ? 20 : undefined}
                    onClick={() => setSelected(s)}
                  >
                    <div
                      className={
                        "relative flex flex-col items-center transition " +
                        (active ? "scale-125" : "")
                      }
                    >
                      <span
                        className={
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white text-xl shadow-md " +
                          (active ? "border-yosakoi" : "border-sky-400")
                        }
                        aria-hidden
                      >
                        🧺
                      </span>
                      {s.is24h && (
                        <span className="absolute -right-2 -top-1 rounded-full bg-yosakoi px-1 py-[1px] text-[9px] font-bold leading-tight text-white shadow">
                          24h
                        </span>
                      )}
                      <span className="pointer-events-none mt-0.5 max-w-[9rem] truncate whitespace-nowrap rounded-full border border-gray-200 bg-white/95 px-1.5 py-[1px] text-[10px] font-bold leading-tight text-gray-800 shadow-sm">
                        {s.name}
                      </span>
                    </div>
                  </AdvancedMarker>
                );
              })}
            </Map>
          </div>
        </div>
      </GoogleMapProvider>

      {/* 選択中の詳細カード */}
      {selected && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-bold">
              🧺 {selected.name}
              {selected.is24h && (
                <span className="ml-2 rounded-full bg-yosakoi px-2 py-[2px] text-[10px] font-bold text-white">
                  24時間営業
                </span>
              )}
            </h2>
            <button
              onClick={() => setSelected(null)}
              className="shrink-0 rounded-full border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500"
            >
              閉じる
            </button>
          </div>
          <dl className="mt-2 space-y-1 text-sm text-gray-700">
            {selected.address && (
              <div className="flex gap-2">
                <dt className="shrink-0 text-gray-400">住所</dt>
                <dd>{selected.address}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="shrink-0 text-gray-400">営業時間</dt>
              <dd>{hoursText(selected)}</dd>
            </div>
            {selected.note && (
              <div className="flex gap-2">
                <dt className="shrink-0 text-gray-400">メモ</dt>
                <dd className="whitespace-pre-wrap">{selected.note}</dd>
              </div>
            )}
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={selected.url || buildPlaceUrl(selected.position, selected.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-sky-600 shadow-sm ring-1 ring-sky-200"
            >
              Googleマップで開く
            </a>
            <a
              href={buildDirectionsUrl(selected.position)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-yosakoi px-4 py-2 text-sm font-bold text-white shadow-sm"
            >
              ここへのルート案内
            </a>
          </div>
        </div>
      )}

      {/* 一覧 */}
      <section>
        <h2 className="mb-2 text-sm font-bold text-gray-600">
          コインランドリー一覧（{spots.length}件）
        </h2>
        <ul className="grid gap-2">
          {spots.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setSelected(s)}
                className={
                  "w-full rounded-xl border bg-white p-3 text-left shadow-sm transition active:scale-[0.99] " +
                  (selected?.id === s.id
                    ? "border-yosakoi"
                    : "border-gray-100")
                }
              >
                <p className="text-sm font-bold">
                  🧺 {s.name}
                  {s.is24h && (
                    <span className="ml-2 rounded-full bg-yosakoi px-2 py-[2px] text-[10px] font-bold text-white">
                      24h
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {s.address}
                  {s.address ? " ／ " : ""}
                  {hoursText(s)}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
