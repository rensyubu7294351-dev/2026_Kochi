"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Facility, FacilityType, LatLng } from "@/types";
import { VENUES, getVenueBySlug } from "@/data/venues";
import { fetchFacilitiesByVenue } from "@/lib/facilities";
import { FACILITY_META } from "@/config/facilities";
import { useGeolocation } from "@/hooks/useGeolocation";
import { VenueTabs } from "./VenueTabs";
import { VenueMap, type RouteSummary } from "./VenueMap";
import { FacilityChips } from "./FacilityChips";

/**
 * 演舞会場マップの全体ページ本体。
 *   ① パンくず ② 会場タブ ③ 会場情報 ④ 現在地/全体表示
 *   ⑤ 施設チップ（タップで地図強調） ⑥ ルート案内 ⑦ Googleマップ
 */
export function VenueExplorer({ initialSlug }: { initialSlug?: string }) {
  const [activeSlug, setActiveSlug] = useState(() =>
    initialSlug && getVenueBySlug(initialSlug) ? initialSlug : VENUES[0].slug,
  );
  const active = getVenueBySlug(activeSlug) ?? VENUES[0];

  // Supabaseから全会場の施設ピンを取得（管理者が入力した内容）
  const [facilitiesByVenue, setFacilitiesByVenue] = useState<
    Record<string, Facility[]>
  >({});
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchFacilitiesByVenue().then((data) => {
        if (!cancelled) setFacilitiesByVenue(data);
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

  const activeFacilities = useMemo(
    () => facilitiesByVenue[active.slug] ?? [],
    [facilitiesByVenue, active.slug],
  );
  const presentTypes = useMemo(
    () => Array.from(new Set(activeFacilities.map((f) => f.type))),
    [activeFacilities],
  );

  // 施設タイプの強調表示
  const [highlightType, setHighlightType] = useState<FacilityType | null>(null);

  // 現在地・フォーカス・全体表示の制御
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [focusPosition, setFocusPosition] = useState<LatLng | null>(null);
  const [fitWithCurrent, setFitWithCurrent] = useState(false);
  const [fitToken, setFitToken] = useState(0);
  const geo = useGeolocation();

  // 徒歩ルート案内
  const [routeDest, setRouteDest] = useState<Facility | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteSummary | null>(null);
  const [routeError, setRouteError] = useState(false);

  // パレード（踊り開始位置→終了位置）
  const [showCourse, setShowCourse] = useState(false);
  const [courseError, setCourseError] = useState(false);
  const danceStart = useMemo(
    () => activeFacilities.find((f) => f.type === "dance-start") ?? null,
    [activeFacilities],
  );
  const danceEnd = useMemo(
    () => activeFacilities.find((f) => f.type === "dance-end") ?? null,
    [activeFacilities],
  );
  const canShowCourse = Boolean(danceStart && danceEnd);

  // 選択中の会場を URL に反映
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("v", active.slug);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, [active.slug]);

  function clearRoute() {
    setRouteDest(null);
    setRouteInfo(null);
    setRouteError(false);
  }

  function selectVenue(slug: string) {
    setActiveSlug(slug);
    setFocusPosition(null);
    setFitWithCurrent(false);
    setHighlightType(null);
    setShowCourse(false);
    clearRoute();
  }

  function toggleCourse() {
    setShowCourse((v) => !v);
    setCourseError(false);
    setHighlightType(null);
    setFocusPosition(null);
  }

  // 施設チップのタップ → その施設タイプを強調表示（もう一度で解除）
  function handleSelectType(t: FacilityType | null) {
    setHighlightType(t);
    setFocusPosition(null);
    setFitWithCurrent(false);
    setFitToken((n) => n + 1); // 強調タイプにズームし直す
  }

  // ピンのタップ → 現在地からの徒歩ルートを地図に表示（アプリ内で完結）
  async function handlePinClick(f: Facility) {
    setRouteError(false);
    setRouteInfo(null);
    setRouteDest(f);
    if (!currentLocation) {
      const pos = await geo.request();
      if (pos) setCurrentLocation(pos);
    }
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
      setFocusPosition(null);
      setFitWithCurrent(true);
      setFitToken((t) => t + 1);
    }
  }

  // 全ピン（＋取得済みなら現在地）を1画面に収める
  function handleShowAll() {
    setHighlightType(null);
    setFocusPosition(null);
    setFitWithCurrent(currentLocation != null);
    setFitToken((t) => t + 1);
  }

  return (
    <>
      {/* ① パンくずリスト */}
      <header className="border-b border-gray-100 px-4 py-3">
        <nav
          aria-label="パンくずリスト"
          className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500"
        >
          <Link href="/" className="hover:text-yosakoi">
            ホーム
          </Link>
          <span aria-hidden>›</span>
          <span>演舞会場</span>
          <span aria-hidden>›</span>
          <span className="font-medium text-gray-900">{active.name}</span>
        </nav>
      </header>

      {/* ② 会場切り替えタブ */}
      <VenueTabs activeSlug={active.slug} onSelect={selectVenue} />

      {/* ③ 選択中の会場情報 */}
      <div className="px-4 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400">会場 {active.id}</span>
          <h1 className="text-xl font-bold">{active.name}</h1>
          {active.hasMedal && (
            <span className="flex items-center gap-1 rounded-full bg-yellow-50 py-0.5 pl-1 pr-2.5 text-xs font-bold text-yellow-700">
              <Image
                src="/images/icons/medal.svg"
                alt=""
                width={18}
                height={18}
              />
              メダル会場
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{active.address}</p>
        {active.courseLength !== undefined && (
          <p className="mt-0.5 text-sm font-medium text-kochi-sea">
            {active.courseLength === "stage"
              ? "競演場：ステージ会場"
              : `競演場の長さ：約${active.courseLength}m`}
          </p>
        )}
      </div>

      {/* ④ 現在地／全体表示 ＋ ⑤ 施設チップ */}
      <div className="mt-3 space-y-3 px-4">
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
          {canShowCourse && (
            <button
              onClick={toggleCourse}
              className={
                "rounded-full px-4 py-1.5 text-sm font-bold transition " +
                (showCourse
                  ? "bg-yosakoi text-white"
                  : "border border-yosakoi text-yosakoi")
              }
            >
              🏁 パレード
            </button>
          )}
        </div>

        {/* パレードの案内 */}
        {showCourse && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-yosakoi/30 bg-yosakoi/5 px-3 py-2">
            <p className="text-sm font-bold text-yosakoi">
              {courseError
                ? "🏁 パレードのルートを取得できませんでした（Directions APIの設定をご確認ください）"
                : "🏁 パレード"}
            </p>
            <button
              onClick={toggleCourse}
              className="shrink-0 rounded-full bg-yosakoi px-3 py-1 text-xs font-medium text-white"
            >
              非表示
            </button>
          </div>
        )}

        {/* 施設アイコン（現在地の下・タップで強調） */}
        <FacilityChips
          types={presentTypes}
          selected={highlightType}
          onSelect={handleSelectType}
        />
      </div>

      {/* ⑥ 操作ガイド（目立つ案内） */}
      <div className="mt-3 px-4">
        <div className="rounded-lg border border-yosakoi/30 bg-yosakoi/5 px-3 py-2 text-sm font-medium text-yosakoi">
          👆 地図のピンをタップすると、現在地からの徒歩ルートが表示されます
        </div>

        {/* 選択中のピン情報（名前・メモを強調表示）＋ルート状態 */}
        {routeDest && (
          <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-blue-800">
                📍 {routeDest.label ?? FACILITY_META[routeDest.type].label}
              </p>
              <button
                onClick={clearRoute}
                className="shrink-0 rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white"
              >
                ✕ 閉じる
              </button>
            </div>

            {/* メモ（あれば強調表示） */}
            {routeDest.note && (
              <p className="mt-1.5 rounded-md bg-yellow-100 px-2.5 py-1.5 text-sm font-bold text-yellow-900 shadow-sm">
                📝 {routeDest.note}
              </p>
            )}

            {/* ルート状態 */}
            <p className="mt-1.5 text-sm font-medium text-blue-700">
              {routeInfo
                ? `🚶 徒歩 約${routeInfo.duration}・${routeInfo.distance}`
                : routeError
                  ? "ルートを表示できませんでした（位置情報の許可 / Directions API をご確認ください）"
                  : !currentLocation
                    ? "現在地を取得しています…「📍 現在地」で位置情報を許可してください"
                    : "ルートを計算中…"}
            </p>
          </div>
        )}
      </div>

      {/* ⑦ Googleマップ本体 */}
      <div className="mt-3">
        <VenueMap
          venue={active}
          facilities={activeFacilities}
          highlightType={highlightType}
          currentLocation={currentLocation}
          focusPosition={focusPosition}
          fitWithCurrent={fitWithCurrent}
          fitToken={fitToken}
          routeDest={routeDest}
          courseFrom={showCourse ? (danceStart?.position ?? null) : null}
          courseTo={showCourse ? (danceEnd?.position ?? null) : null}
          onPinClick={handlePinClick}
          onRouteInfo={setRouteInfo}
          onRouteError={handleRouteError}
          onCourseInfo={() => setCourseError(false)}
          onCourseError={() => setCourseError(true)}
        />
      </div>
    </>
  );
}
