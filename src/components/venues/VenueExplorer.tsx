"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BottomSheet } from "@/components/layout/BottomSheet";
import { InAppBrowserNotice } from "@/components/layout/InAppBrowserNotice";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { Facility, FacilityType, LatLng } from "@/types";
import { VENUES, getVenueBySlug } from "@/data/venues";
import { fetchFacilitiesByVenue } from "@/lib/facilities";
import { FACILITY_META } from "@/config/facilities";
import { useGeolocation } from "@/hooks/useGeolocation";
import { VenueTabs } from "./VenueTabs";
import { VenueMap, type RouteSummary } from "./VenueMap";
import { AllVenuesMap } from "./AllVenuesMap";
import { FacilityChips } from "./FacilityChips";

/** 「全体」タブを含めた有効なタブ判定 */
function isValidSlug(v: string | null): v is string {
  return Boolean(v && (v === "all" || getVenueBySlug(v)));
}

/**
 * 演舞会場マップの全体ページ本体。
 *   ① パンくず ② 会場タブ ③ 会場情報 ④ 現在地/全体表示
 *   ⑤ 施設チップ（タップで地図強調） ⑥ ルート案内 ⑦ Googleマップ
 */
export function VenueExplorer({
  initialFacilities,
}: {
  initialFacilities: Record<string, Facility[]>;
}) {
  // ?v=slug（共有リンク・旧URL）から初期会場を決める。既定は上町（先頭）
  const searchParams = useSearchParams();
  const [activeSlug, setActiveSlug] = useState(() => {
    const v = searchParams.get("v");
    return isValidSlug(v) ? v : VENUES[0].slug;
  });
  const isAll = activeSlug === "all";
  const active = getVenueBySlug(activeSlug) ?? VENUES[0];

  // URLで会場指定が無ければ、前回最後に開いていたタブを復元
  useEffect(() => {
    if (searchParams.get("v")) return;
    try {
      const saved = localStorage.getItem("lastVenueSlug");
      if (isValidSlug(saved)) setActiveSlug(saved);
    } catch {}
    // 初回マウント時のみ復元する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 最後に開いていたタブを保存（次回起動時の復元用）
  useEffect(() => {
    try {
      localStorage.setItem("lastVenueSlug", activeSlug);
    } catch {}
  }, [activeSlug]);

  // 施設ピンはサーバーで焼き込んだ初期データで即描画し、裏で最新を取り直す
  const [facilitiesByVenue, setFacilitiesByVenue] =
    useState<Record<string, Facility[]>>(initialFacilities);
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
  // 詳細ボトムシートの開閉。スワイプで閉じてもルートは地図に残す
  const [sheetOpen, setSheetOpen] = useState(false);

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

  // 選択中のタブ（会場 or 全体）を URL に反映
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("v", activeSlug);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, [activeSlug]);

  function clearRoute() {
    setRouteDest(null);
    setRouteInfo(null);
    setRouteError(false);
    setSheetOpen(false);
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
    clearRoute(); // メモ・ルートを消す
  }

  // 施設チップのタップ → その施設タイプを強調表示（もう一度で解除）
  function handleSelectType(t: FacilityType | null) {
    setHighlightType(t);
    setShowCourse(false); // パレードと排他
    setCourseError(false);
    setFocusPosition(null);
    setFitWithCurrent(false);
    setFitToken((n) => n + 1); // 強調タイプにズームし直す
    clearRoute(); // 直前に開いていたピンのメモ・ルートを消す
  }

  // パレード中は開始/終了ピンだけを地図に出す（他アイコンは非表示）
  const mapFacilities = useMemo(() => {
    if (!showCourse) return activeFacilities;
    return activeFacilities.filter(
      (f) => f.type === "dance-start" || f.type === "dance-end",
    );
  }, [showCourse, activeFacilities]);

  // ピンのタップ → 目的地を選択。現在地があれば即ルート描画、無ければパネルの
  // 「現在地を取得」ボタン（ネイティブ操作）で取得する。
  // ※ 地図ピンのタップは iOS Safari では位置情報取得の起点にならないため、
  //   ここでは getCurrentPosition を直接呼ばずボタン操作に委ねる。
  const handlePinClick = useCallback((f: Facility) => {
    setRouteError(false);
    setRouteInfo(null);
    setRouteDest(f);
    setSheetOpen(true);
  }, []);

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
          <span className="font-medium text-gray-900">
            {isAll ? "全体" : active.name}
          </span>
        </nav>
      </header>

      {/* ② 会場切り替えタブ（先頭に「全体」） */}
      <VenueTabs activeSlug={activeSlug} onSelect={selectVenue} />

      {/* ③ 選択中の会場情報（会場切替でふわっと入れ替わる）。全体表示では会場名の代わりに案内 */}
      <div key={activeSlug} className="animate-fade-in-up px-4 pt-3">
        {isAll ? (
          <h1 className="text-xl font-bold">全演舞会場マップ</h1>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
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
            {active.courseLength !== undefined && (
              <p className="mt-0.5 text-sm font-medium text-kochi-sea">
                {active.courseLength === "stage"
                  ? "競演場：ステージ会場"
                  : `競演場の長さ：約${active.courseLength}m`}
              </p>
            )}
          </>
        )}
      </div>

      {/* ④ 現在地／全体表示 ＋ ⑤ 施設チップ */}
      <div className="mt-3 space-y-3 px-4">
        <div className="flex gap-2">
          <button
            onClick={handleLocate}
            disabled={geo.loading}
            className="tap rounded-full bg-blue-500 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {geo.loading ? "取得中..." : "📍 現在地"}
          </button>
        </div>

        {/* アプリ内ブラウザ（LINE等）の検知と外部ブラウザへの誘導 */}
        <InAppBrowserNotice />

        {/* パレードの案内 */}
        {!isAll && showCourse && (
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

        {/* 施設アイコン（現在地の下・タップで強調）。全体表示では非表示 */}
        {!isAll && (
          <FacilityChips
            types={presentTypes}
            selected={highlightType}
            onSelect={handleSelectType}
            paradeAvailable={canShowCourse}
            paradeActive={showCourse}
            onToggleParade={toggleCourse}
          />
        )}
      </div>

      {/* ⑥ 操作ガイド（目立つ案内） */}
      <div className="mt-3 px-4">
        <div className="rounded-lg border border-yosakoi/30 bg-yosakoi/5 px-3 py-2 text-sm font-medium text-yosakoi">
          {isAll
            ? "👇　会場のピンをタップすると、その会場のページに移動します"
            : "👇　Googleマップ上のピンをタップすると、現在地からの徒歩ルートが表示されます"}
        </div>

        {/* 選択中のピン情報とルート案内は、地図を押し下げないボトムシートで表示。
            スワイプダウン or ✕ で閉じる */}
        <BottomSheet
          open={sheetOpen && routeDest != null}
          onClose={() => setSheetOpen(false)}
        >
        {routeDest && (
          <div className="space-y-2 pb-1">
            {/* ① ピン情報カード（白＋メモは黄色） */}
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-gray-900">
                  📍 {routeDest.label ?? FACILITY_META[routeDest.type].label}
                </p>
                <button
                  onClick={clearRoute}
                  className="tap shrink-0 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600"
                >
                  ✕ 閉じる
                </button>
              </div>
              {routeDest.note && (
                <p className="mt-2 rounded-md border border-yellow-300 bg-yellow-100 px-2.5 py-2 text-sm font-bold leading-relaxed text-yellow-900">
                  📝 {routeDest.note}
                </p>
              )}
            </div>

            {/* ② ルート／現在地カード（青・別物） */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
              {routeInfo ? (
                <>
                  <p className="text-sm font-medium text-blue-700">
                    🚶 現在地から 徒歩 約{routeInfo.duration}・
                    {routeInfo.distance}
                  </p>
                  <p className="mt-1 text-xs text-blue-600">
                    シートを下にスワイプすると、地図上のルート全体を確認できます
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
        </BottomSheet>
      </div>

      {/* ⑦ Googleマップ本体（全体表示は全会場ピンの概観マップ） */}
      <div className="mt-3">
        {isAll ? (
          <AllVenuesMap
            currentLocation={currentLocation}
            fitWithCurrent={fitWithCurrent}
            fitToken={fitToken}
            onSelect={selectVenue}
          />
        ) : (
        <VenueMap
          venue={active}
          facilities={mapFacilities}
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
        )}
      </div>
    </>
  );
}
