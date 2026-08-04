"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomSheet } from "@/components/layout/BottomSheet";
import { InAppBrowserNotice } from "@/components/layout/InAppBrowserNotice";
import { LocationErrorNotice } from "@/components/layout/LocationErrorNotice";
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import type { Sento, LatLng } from "@/types";
import { fetchSento } from "@/lib/tourism";
import { buildPlaceUrl } from "@/lib/maps";
import { KOCHI_CENTER, GOOGLE_MAPS_MAP_ID } from "@/lib/constants";
import { GoogleMapProvider } from "@/components/map/GoogleMapProvider";
import { RouteLayer, type RouteSummary } from "@/components/map/RouteLayer";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { Audience } from "@/config/navigation";

/** 営業時間の表示用テキスト（曜日別は未使用で note に自由記述を入れている） */
function hoursText(spot: Sento): string {
  return spot.hours.note ?? "不明";
}

/**
 * 地図の表示範囲を制御。ルート表示中は DirectionsRenderer に任せる
 * （コインランドリーマップの MapController と同じ方針）。
 */
function MapController({
  spots,
  currentLocation,
  fitWithCurrent,
  fitToken,
  routeActive,
}: {
  spots: Sento[];
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
 * 銭湯のピン地図＋一覧。
 * Supabaseの sento テーブルを読み込み、♨️アイコン付きピンで表示する。
 * 移動は基本タクシー前提のため、ルートは車モードで計算し、
 * タクシー会社一覧への導線を随所に置く。
 */
export function SentoMapClient({
  initialSpots,
  audience,
}: {
  initialSpots: Sento[];
  audience: Audience;
}) {
  // サーバーで焼き込んだ初期データで即描画し、裏で最新を取り直す
  const [spots, setSpots] = useState<Sento[]>(initialSpots);

  // 現在地・全体表示の制御（コインランドリーと同じ）
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [fitWithCurrent, setFitWithCurrent] = useState(false);
  const [fitToken, setFitToken] = useState(0);
  const geo = useGeolocation();

  // タクシー（車）ルート案内
  const [routeDest, setRouteDest] = useState<Sento | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteSummary | null>(null);
  const [routeError, setRouteError] = useState(false);
  // 詳細ボトムシートの開閉。スワイプで閉じてもルートは地図に残す
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchSento(audience).then((list) => {
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
  }, [audience]);

  function clearRoute() {
    setRouteDest(null);
    setRouteInfo(null);
    setRouteError(false);
    setSheetOpen(false);
  }

  // ピンのタップ → 目的地を選択。現在地があれば即ルート描画、無ければカードの
  // 「現在地を取得」ボタン（ネイティブ操作）で取得する。
  // ※ 地図ピンのタップは iOS Safari では位置情報取得の起点にならないため、
  //   ここでは getCurrentPosition を直接呼ばずボタン操作に委ねる。
  function handlePinClick(s: Sento) {
    setRouteError(false);
    setRouteInfo(null);
    // 別のピンに切り替えた時は現在地表示も自動OFF（同じピンの再タップは維持）
    if (routeDest && routeDest.id !== s.id) {
      setCurrentLocation(null);
      setFitWithCurrent(false);
    }
    setRouteDest(s);
    setSheetOpen(true);
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
        銭湯は準備中です（管理画面から登録できます）。
      </p>
    );
  }

  const routeActive = Boolean(currentLocation && routeDest);

  return (
    <div className="space-y-3">
      {/* タクシー移動の案内（銭湯は基本タクシーで向かう） */}
      <div className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm leading-relaxed text-orange-900">
        <p className="font-bold">🚕 銭湯へは基本タクシーで移動してください</p>
        <p className="mt-0.5 text-xs">
          配車の電話番号は
          <Link
            href="/tourism/taxi"
            className="mx-0.5 font-bold text-orange-700 underline"
          >
            タクシー会社一覧
          </Link>
          からどうぞ。
        </p>
      </div>

      {/* 最終受付の注意（全店共通） */}
      <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold leading-relaxed text-red-700">
        ⚠️ 最終入場は閉店の30分〜1時間前のことが多いです。<br />
        ⚠️ 「高知」ぽかぽか温泉は今年は事前予約制です。<br />8/10-12は事前予約してない人は入れません<br />
        深夜に向かう場合は公式サイトで最終受付を確認してから出発するのが確実です
      </p>

      {/* 全体表示（現在地はピンのシートから取得する運用） */}
      <div className="flex gap-2">
        <button
          onClick={handleShowAll}
          className="tap rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-600"
        >
          🗺 全体表示
        </button>
      </div>

      {/* アプリ内ブラウザ（LINE等）の検知と外部ブラウザへの誘導 */}
      <InAppBrowserNotice />

      {/* 操作ガイド */}
      <div className="rounded-lg border border-yosakoi/30 bg-yosakoi/5 px-3 py-2 text-sm font-medium text-yosakoi">
        👇　Googleマップ上のピンをタップすると、  <br />現在地からの徒歩ルート、詳細情報が表示されます
      </div>

      {/* 選択中のピン情報とルート案内はボトムシートで表示。
          スワイプで閉じてもルートは地図に残る（✕ で完全クリア） */}
      <BottomSheet
        open={sheetOpen && routeDest != null}
        onClose={() => setSheetOpen(false)}
      >
        {routeDest && (
        <div className="space-y-2 pb-1">
          {/* ① ピン情報カード（白＋注意事項は赤で強調） */}
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-gray-900">
                ♨️ {routeDest.name}
                {routeDest.hasSauna && (
                  <span className="ml-2 rounded-full bg-yosakoi px-2 py-[2px] text-[10px] font-bold text-white">
                    サウナ
                  </span>
                )}
              </p>
              <button
                onClick={clearRoute}
                className="tap shrink-0 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600"
              >
                ✕ 閉じる
              </button>
            </div>

            {/* 注意事項（最優先で目立たせる） */}
            {routeDest.note && (
              <p className="mt-2 rounded-md border-2 border-red-400 bg-red-50 px-2.5 py-2 text-sm font-bold leading-relaxed text-red-700">
                {routeDest.note}
              </p>
            )}

            <dl className="mt-2 space-y-0.5 text-sm text-gray-700">
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
              {routeDest.price != null && (
                <div className="flex gap-2">
                  <dt className="shrink-0 text-gray-400">料金</dt>
                  <dd>{routeDest.price}円</dd>
                </div>
              )}
              {routeDest.access && (
                <div className="flex gap-2">
                  <dt className="shrink-0 text-gray-400">アクセス</dt>
                  <dd>🚕 {routeDest.access}</dd>
                </div>
              )}
              {routeDest.tel && (
                <div className="flex gap-2">
                  <dt className="shrink-0 text-gray-400">電話</dt>
                  <dd>
                    <a
                      href={`tel:${routeDest.tel.replace(/-/g, "")}`}
                      className="font-medium text-sky-600 underline"
                    >
                      {routeDest.tel}
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-2 flex flex-wrap gap-3">
              {routeDest.url && (
                <a
                  href={routeDest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-sky-600 underline"
                >
                  🌐 公式サイト
                </a>
              )}
              <a
                href={
                  routeDest.mapUrl ||
                  buildPlaceUrl(routeDest.position, routeDest.name)
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-sky-600 underline"
              >
                🗺 Googleマップで開く
              </a>
            </div>
          </div>

          {/* ② ルート／現在地カード（青・別物）。所要時間は車＝タクシーの目安 */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
            {routeInfo ? (
              <>
                <p className="text-sm font-medium text-blue-700">
                  🚕 現在地から タクシー（車）で 約{routeInfo.duration}・
                  {routeInfo.distance}
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  配車は
                  <Link
                    href="/tourism/taxi"
                    className="mx-0.5 font-bold underline"
                  >
                    タクシー会社一覧
                  </Link>
                  から電話してください。
                </p>

              </>
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
                  className="tap w-full rounded-lg bg-blue-500 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {geo.loading
                    ? "現在地を取得中…"
                    : "📍 現在地を取得してルートを表示"}
                </button>
                {geo.error && <LocationErrorNotice />}
              </>
            )}
          </div>
        </div>
        )}
      </BottomSheet>

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

              {/* 現在地→ピンの車（タクシー）ルート（青） */}
              {currentLocation && routeDest && (
                <RouteLayer
                  origin={currentLocation}
                  destination={routeDest.position}
                  color="#2563eb"
                  travelMode="DRIVING"
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
                  <span className="block h-4 w-4 animate-location-pulse rounded-full border-2 border-white bg-blue-500" />
                </AdvancedMarker>
              )}

              {/* 銭湯のピン */}
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
                        "relative flex animate-pin-pop flex-col items-center transition-all duration-300 ease-spring " +
                        (isDest ? "scale-125" : "")
                      }
                    >
                      <span
                        className={
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white text-xl shadow-md " +
                          (isDest ? "border-blue-500" : "border-orange-400")
                        }
                        style={
                          isDest
                            ? { filter: "drop-shadow(0 0 6px #2563eb)" }
                            : undefined
                        }
                        aria-hidden
                      >
                        ♨️
                      </span>
                      {s.note && (
                        <span className="absolute -right-2 -top-1 rounded-full bg-red-500 px-1 py-[1px] text-[9px] font-bold leading-tight text-white shadow">
                          ⚠️
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
          銭湯一覧（{spots.length}件）
        </h2>
        <ul className="grid gap-2">
          {spots.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => handlePinClick(s)}
                className={
                  "tap w-full rounded-xl border bg-white p-3 text-left shadow-sm " +
                  (routeDest?.id === s.id ? "border-yosakoi" : "border-gray-100")
                }
              >
                <p className="text-sm font-bold">
                  ♨️ {s.name}
                  {s.note && (
                    <span className="ml-2 rounded-full bg-red-500 px-2 py-[2px] text-[10px] font-bold text-white">
                      ⚠️ 注意あり
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {s.address}
                  {s.address ? " ／ " : ""}
                  {hoursText(s)}
                  {s.access ? ` ／ 🚕 ${s.access}` : ""}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
