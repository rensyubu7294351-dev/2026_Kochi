"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Facility, LatLng } from "@/types";
import { VENUES, getVenueBySlug } from "@/data/venues";
import { fetchFacilitiesByVenue } from "@/lib/facilities";
import { FACILITY_META } from "@/config/facilities";
import { useGeolocation } from "@/hooks/useGeolocation";
import { VenueTabs } from "./VenueTabs";
import { VenueMap } from "./VenueMap";
import { VenueSearch, type SearchResult } from "./VenueSearch";

/** キーワードが施設にマッチするか（部分一致・大文字小文字無視） */
function matchesKeyword(f: Facility, venueName: string, kw: string): boolean {
  if (!kw) return true;
  const q = kw.trim().toLowerCase();
  const hay = [
    f.label ?? "",
    f.note ?? "",
    FACILITY_META[f.type].label,
    venueName,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

/**
 * 演舞会場マップの全体ページ本体。
 *   ① パンくず ② 会場タブ ③ 検索パネル ④ 会場情報 ⑤ Googleマップ
 * タブ切り替え・施設検索・現在地表示に対応する。
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
    fetchFacilitiesByVenue().then((data) => {
      if (!cancelled) setFacilitiesByVenue(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 検索状態
  const [venueFilter, setVenueFilter] = useState("all"); // "all" or slug
  const [typeFilter, setTypeFilter] = useState("all"); // "all" or FacilityType
  const [keyword, setKeyword] = useState("");
  const hasQuery = typeFilter !== "all" || keyword.trim() !== "";

  // 現在地・フォーカス・全体表示の制御
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [focusPosition, setFocusPosition] = useState<LatLng | null>(null);
  const [fitWithCurrent, setFitWithCurrent] = useState(false); // 全体表示に現在地を含めるか
  const [fitToken, setFitToken] = useState(0); // 全体表示の再実行トリガー
  const geo = useGeolocation();

  // 検索結果（全会場 or 特定会場を対象に、種類・キーワードでしぼる）
  const results = useMemo<SearchResult[] | null>(() => {
    if (!hasQuery) return null;
    const out: SearchResult[] = [];
    for (const v of VENUES) {
      if (venueFilter !== "all" && v.slug !== venueFilter) continue;
      for (const f of facilitiesByVenue[v.slug] ?? []) {
        if (typeFilter !== "all" && f.type !== typeFilter) continue;
        if (!matchesKeyword(f, v.name, keyword)) continue;
        out.push({
          venueSlug: v.slug,
          venueName: v.name,
          venueId: v.id,
          facility: f,
        });
      }
    }
    return out;
  }, [hasQuery, venueFilter, typeFilter, keyword, facilitiesByVenue]);

  // 地図に表示する（今の会場の）ピン。検索中はしぼり込む。
  const activeFacilities = useMemo(() => {
    const list = facilitiesByVenue[active.slug] ?? [];
    if (!hasQuery) return list;
    return list.filter(
      (f) =>
        (typeFilter === "all" || f.type === typeFilter) &&
        matchesKeyword(f, active.name, keyword),
    );
  }, [facilitiesByVenue, active.slug, active.name, hasQuery, typeFilter, keyword]);

  // 選択中の会場を URL に反映
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("v", active.slug);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, [active.slug]);

  function selectVenue(slug: string) {
    setActiveSlug(slug);
    setVenueFilter(slug);
    setFocusPosition(null);
    setFitWithCurrent(false); // 会場切替時はその会場の全ピンを表示
  }

  function handleVenueFilter(v: string) {
    setVenueFilter(v);
    if (v !== "all") {
      setActiveSlug(v);
      setFocusPosition(null);
      setFitWithCurrent(false);
    }
  }

  function handleReset() {
    setVenueFilter("all");
    setTypeFilter("all");
    setKeyword("");
    setFocusPosition(null);
  }

  function handleResultClick(r: SearchResult) {
    setActiveSlug(r.venueSlug);
    setFocusPosition(r.facility.position);
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

      {/* ③ 検索パネル（演舞場・施設・キーワード）＋現在地 */}
      <VenueSearch
        venueFilter={venueFilter}
        typeFilter={typeFilter}
        keyword={keyword}
        onVenueFilter={handleVenueFilter}
        onTypeFilter={setTypeFilter}
        onKeyword={setKeyword}
        onReset={handleReset}
        onLocate={handleLocate}
        onShowAll={handleShowAll}
        locating={geo.loading}
        results={results}
        onResultClick={handleResultClick}
      />

      {/* ④ 選択中の会場情報 */}
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

      {/* ⑤ Googleマップ本体 */}
      <div className="mt-3">
        <VenueMap
          venue={active}
          facilities={activeFacilities}
          currentLocation={currentLocation}
          focusPosition={focusPosition}
          fitWithCurrent={fitWithCurrent}
          fitToken={fitToken}
        />
      </div>
    </>
  );
}
