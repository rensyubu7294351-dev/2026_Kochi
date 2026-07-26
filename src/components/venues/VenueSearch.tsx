"use client";

import type { Facility, FacilityType } from "@/types";
import { VENUES } from "@/data/venues";
import { FACILITY_META, FACILITY_ORDER } from "@/config/facilities";

/** 検索結果1件（どの会場のどの施設か） */
export type SearchResult = {
  venueSlug: string;
  venueName: string;
  venueId: number;
  facility: Facility;
};

/**
 * 施設の検索パネル。
 * ・演舞場プルダウン（全会場 or 特定の会場）
 * ・施設アイコンプルダウン（すべて or 種類）
 * ・キーワード（部分一致）
 * 演舞場を選べばその会場内、全会場なら全体から検索する。
 */
export function VenueSearch({
  venueFilter,
  typeFilter,
  keyword,
  onVenueFilter,
  onTypeFilter,
  onKeyword,
  onReset,
  onLocate,
  locating,
  results,
  onResultClick,
}: {
  venueFilter: string;
  typeFilter: string;
  keyword: string;
  onVenueFilter: (v: string) => void;
  onTypeFilter: (v: string) => void;
  onKeyword: (v: string) => void;
  onReset: () => void;
  onLocate: () => void;
  locating: boolean;
  results: SearchResult[] | null;
  onResultClick: (r: SearchResult) => void;
}) {
  const isSearching =
    typeFilter !== "all" || keyword.trim() !== "" || venueFilter !== "all";

  return (
    <div className="px-4 pt-3">
      <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold">施設をさがす</span>
          <button
            onClick={onLocate}
            disabled={locating}
            className="rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            {locating ? "取得中..." : "📍 現在地"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* 演舞場プルダウン */}
          <select
            value={venueFilter}
            onChange={(e) => onVenueFilter(e.target.value)}
            aria-label="演舞場でしぼる"
            className="rounded-lg border border-gray-300 px-2 py-2 text-sm"
          >
            <option value="all">全会場</option>
            {VENUES.map((v) => (
              <option key={v.slug} value={v.slug}>
                {v.id}. {v.name}
              </option>
            ))}
          </select>

          {/* 施設アイコンプルダウン */}
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilter(e.target.value)}
            aria-label="施設でしぼる"
            className="rounded-lg border border-gray-300 px-2 py-2 text-sm"
          >
            <option value="all">すべての施設</option>
            {FACILITY_ORDER.map((t) => (
              <option key={t} value={t}>
                {FACILITY_META[t as FacilityType].label}
              </option>
            ))}
          </select>
        </div>

        {/* キーワード（部分一致） */}
        <div className="mt-2 flex gap-2">
          <input
            value={keyword}
            onChange={(e) => onKeyword(e.target.value)}
            placeholder="キーワード（名前・メモ・施設名で部分一致）"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          {isSearching && (
            <button
              onClick={onReset}
              className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500"
            >
              クリア
            </button>
          )}
        </div>

        {/* 検索結果リスト */}
        {results !== null && (
          <div className="mt-3">
            <p className="mb-1 text-xs text-gray-500">
              検索結果 {results.length} 件
            </p>
            {results.length === 0 ? (
              <p className="text-xs text-gray-400">
                該当する施設がありません。
              </p>
            ) : (
              <ul className="grid max-h-64 gap-1 overflow-y-auto">
                {results.map((r) => {
                  const meta = FACILITY_META[r.facility.type];
                  return (
                    <li key={r.facility.id}>
                      <button
                        onClick={() => onResultClick(r)}
                        className="flex w-full items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2 text-left text-sm active:scale-[0.99]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/images/icons/${meta.icon}`}
                          alt=""
                          width={22}
                          height={28}
                        />
                        <span className="flex-1">
                          <span className="font-medium">
                            {r.facility.label || meta.label}
                          </span>
                          {r.facility.note && (
                            <span className="block text-xs text-gray-500">
                              {r.facility.note}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs text-gray-500">
                          {r.venueId}.{r.venueName}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
