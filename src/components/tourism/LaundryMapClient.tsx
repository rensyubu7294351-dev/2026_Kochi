"use client";

import { useEffect, useState } from "react";
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import type { Laundry, LatLng } from "@/types";
import { fetchLaundry } from "@/lib/tourism";
import { buildPlaceUrl } from "@/lib/maps";
import { KOCHI_CENTER, GOOGLE_MAPS_MAP_ID } from "@/lib/constants";
import { GoogleMapProvider } from "@/components/map/GoogleMapProvider";
import { RouteLayer, type RouteSummary } from "@/components/map/RouteLayer";
import { useGeolocation } from "@/hooks/useGeolocation";

/** 営業時間の表示用テキスト（曜日別は未使用で note に自由記述を入れている） */
function hoursText(spot: Laundry): string {
  if (spot.hours.note) return spot.hours.note;
  if (spot.is24h) return "24時間営業";
  return "不明";
}

/**
 * 地図の表示範囲を制御。ルート表示中は DirectionsRenderer に任せる
 * （演舞会場マップの MapController と同じ方針）。
 */
function MapController({
  spots,
  currentLocation,
  fitWithCurrent,
  fitToken,
  routeActive,
}: {
  spots: Laundry[];
  currentLocation: LatLng | null;
  fitWithCurrent: boolean;
  fitToken: number;
  routeActive: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (routeActive) return; // 現在地→ピンのルートに任せる

    const pts = spots.map((s) => s.position);
    if (fitWithCurrent && currentLocation) pts.push(currentLocation);
    if (pts.length === 0) {
      map.panTo(KOCHI_CENTER);
      map.setZoom(14);
      return;
    }
    const lats = pts.map((p) => p.lat);
    const lngs = pts.map((p) => p.lng);
    map.fitBounds(
      {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs),
      },
      48,
    );
  }, [map, spots, currentLocation, fitWithCurrent, fitToken, routeActive]);
  return null;
}

/**
 * コインランドリーのピン地図＋一覧。
 * Supabaseの laundry テーブルを読み込み、🧺アイコン付きピンで表示する。
 * 現在地取得〜徒歩ルート案内は演舞会場マップと同じ操作フロー。
 */
export function LaundryMapClient({
  initialSpots,
}: {
  initialSpots: Laundry[];
}) {
  // サーバーで焼き込んだ初期データで即描画し、裏で最新を取り直す
  const [spots, setSpots] = useState<Laundry[]>(initialSpots);

  // 現在地・全体表示の制御（演舞会場と同じ）
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [fitWithCurrent, setFitWithCurrent] = useState(false);
  const [fitToken, setFitToken] = useState(0);
  const geo = useGeolocation();

  // 徒歩ルート案内
  const [routeDest, setRouteDest] = useState<Laundry | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteSummary | null>(null);
  const [routeError, setRouteError] = useState(false);

  // LINE / Instagram などアプリ内ブラウザ検知（現在地が使えないため案内する）
  const [inAppBrowser, setInAppBrowser] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent || "";
    setInAppBrowser(/Line|FBAN|FBAV|Instagram/i.test(ua));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchLaundry().then((list) => {
        if (!cancelled) setSpots(list);
      });
    load();
    // 画面に戻ってきた時に最新を取り直す（管理画面での更新を素早く反映）
    const onFocus = () => load();
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  function clearRoute() {
    setRouteDest(null);
    setRouteInfo(null);
    setRouteError(false);
  }

  // ピンのタップ → 目的地を選択。現在地があれば即ルート描画、無ければカードの
  // 「現在地を取得」ボタン（ネイティブ操作）で取得する。
  // ※ 地図ピンのタップは iOS Safari では位置情報取得の起点にならないため、
  //   ここでは getCurrentPosition を直接呼ばずボタン操作に委ねる。
  function handlePinClick(s: Laundry) {
    setRouteError(false);
    setRouteInfo(null);
    setRouteDest(s);
  }

  function handleRouteError() {
    setRouteError(true);
    setRouteInfo(null);
  }

  // 現在地を取得し、全ピン＋現在地をまとめて表示
  async function handleLocate() {
    const pos = await geo.request();
    if (pos) {
      setCurrentLocation(pos);
      setFitWithCurrent(true);
      setFitToken((t) => t + 1);
    }
  }

  // 全ピン（＋取得済みなら現在地）を1画面に収める
  function handleShowAll() {
    setFitWithCurrent(currentLocation != null);
    setFitToken((t) => t + 1);
    clearRoute();
  }

  if (spots.length === 0) {
    return (
      <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-400">
        コインランドリーは準備中です（管理画面から登録できます）。
      </p>
    );
  }

  const routeActive = Boolean(currentLocation && routeDest);

  return (
    <div className="space-y-3">
      {/* 現在地／全体表示 */}
      <div className="flex gap-2">
        <button
          onClick={handleLocate}
          disabled={geo.loading}
          className="rounded-full bg-blue-500 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {geo.loading ? "取得中..." : "📍 現在地"}
        </button>
        <button
          onClick={handleShowAll}
          className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-600"
        >
          🗺 全体表示
        </button>
      </div>

      {/* アプリ内ブラウザ（LINE等）は現在地が使えない案内 */}
      {inAppBrowser && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          ⚠️ 現在地が取得できない場合は「…」メニューから
          <span className="font-bold">「Safari / Chrome で開く」</span>
          を選んでください。
        </p>
      )}

      {/* 操作ガイド */}
      <div className="rounded-lg border border-yosakoi/30 bg-yosakoi/5 px-3 py-2 text-sm font-medium text-yosakoi">
        👇Googleマップ上のピンをタップすると、現在地からの徒歩ルートが表示されます
      </div>

      {/* 選択中のピン情報とルート案内は「別々のカード」で分離（演舞会場と同じ） */}
      {routeDest && (
        <div className="space-y-2">
          {/* ① ピン情報カード（白＋メモは黄色） */}
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-gray-900">
                🧺 {routeDest.name}
                {routeDest.is24h && (
                  <span className="ml-2 rounded-full bg-yosakoi px-2 py-[2px] text-[10px] font-bold text-white">
                    24時間営業
                  </span>
                )}
              </p>
              <button
                onClick={clearRoute}
                className="shrink-0 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600"
              >
                ✕ 閉じる
              </button>
            </div>
            <dl className="mt-1 space-y-0.5 text-sm text-gray-700">
              {routeDest.address && (
                <div className="flex gap-2">
                  <dt className="shrink-0 text-gray-400">住所</dt>
                  <dd>{routeDest.address}</dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="shrink-0 text-gray-400">営業時間</dt>
                <dd>{hoursText(routeDest)}</dd>
              </div>
            </dl>
            {routeDest.note && (
              <p className="mt-2 rounded-md border border-yellow-300 bg-yellow-100 px-2.5 py-2 text-sm font-bold leading-relaxed text-yellow-900">
                📝 {routeDest.note}
              </p>
            )}
            <a
              href={
                routeDest.url || buildPlaceUrl(routeDest.position, routeDest.name)
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-medium text-sky-600 underline"
            >
              Googleマップで開く
            </a>
          </div>

          {/* ② ルート／現在地カード（青・別物） */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
            {routeInfo ? (
              <p className="text-sm font-medium text-blue-700">
                🚶 現在地から 徒歩 約{routeInfo.duration}・{routeInfo.distance}
              </p>
            ) : routeError ? (
              <p className="text-xs font-medium text-red-500">
                ルートを表示できませんでした（位置情報の許可 / Directions API
                をご確認ください）
              </p>
            ) : currentLocation ? (
              <p className="text-sm font-medium text-blue-700">
                ルートを計算中…
              </p>
            ) : (
              <>
                <button
                  onClick={handleLocate}
                  disabled={geo.loading}
                  className="w-full rounded-lg bg-blue-500 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {geo.loading
                    ? "現在地を取得中…"
                    : "📍 現在地を取得してルートを表示"}
                </button>
                {geo.error && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    現在地を取得できませんでした。LINE等のアプリ内ブラウザでは使えないことがあります。右上メニューから
                    Safari / Chrome で開き直し、位置情報を「許可」してください。
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Googleマップ本体 */}
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
                currentLocation={currentLocation}
                fitWithCurrent={fitWithCurrent}
                fitToken={fitToken}
                routeActive={routeActive}
              />

              {/* 現在地→ピンの徒歩ルート（青） */}
              {currentLocation && routeDest && (
                <RouteLayer
                  origin={currentLocation}
                  destination={routeDest.position}
                  color="#2563eb"
                  onSummary={setRouteInfo}
                  onError={handleRouteError}
                />
              )}

              {/* 現在地（青ドット） */}
              {currentLocation && (
                <AdvancedMarker
                  position={currentLocation}
                  title="現在地"
                  zIndex={30}
                >
                  <span className="block h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.3)]" />
                </AdvancedMarker>
              )}

              {/* コインランドリーのピン */}
              {spots.map((s) => {
                const isDest = routeDest?.id === s.id;
                return (
                  <AdvancedMarker
                    key={s.id}
                    position={s.position}
                    title={s.name}
                    zIndex={isDest ? 25 : undefined}
                    onClick={() => handlePinClick(s)}
                  >
                    <div
                      className={
                        "relative flex flex-col items-center transition " +
                        (isDest ? "scale-125" : "")
                      }
                    >
                      <span
                        className={
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white text-xl shadow-md " +
                          (isDest ? "border-blue-500" : "border-sky-400")
                        }
                        style={
                          isDest
                            ? { filter: "drop-shadow(0 0 6px #2563eb)" }
                            : undefined
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

      {/* 一覧 */}
      <section className="pt-1">
        <h2 className="mb-2 text-sm font-bold text-gray-600">
          コインランドリー一覧（{spots.length}件）
        </h2>
        <ul className="grid gap-2">
          {spots.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => handlePinClick(s)}
                className={
                  "w-full rounded-xl border bg-white p-3 text-left shadow-sm transition active:scale-[0.99] " +
                  (routeDest?.id === s.id ? "border-yosakoi" : "border-gray-100")
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
