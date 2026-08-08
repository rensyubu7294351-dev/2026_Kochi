"use client";

import { useEffect, useRef } from "react";
import { VENUES, LODGING_VENUE } from "@/data/venues";

/**
 * 全14会場を横スクロールのタブで切り替えるバー。
 * ページ遷移せず、onSelect で親の表示会場を切り替える（地図がその場で変わる）。
 * - 並びは「宿」→「全体」→ 各会場
 * - 現在の会場をハイライト
 * - 現在のタブを自動的に画面内へスクロール
 * - メダル会場には小さなメダル印を表示
 */
export function VenueTabs({
  activeSlug,
  onSelect,
  showAll = true,
}: {
  activeSlug: string;
  onSelect: (slug: string) => void;
  /**
   * 「全体」タブを出すか。管理画面ではピンの置き場所にならないので隠す
   * （選んだまま保存すると、どこにも表示されないピンができてしまうため）。
   */
  showAll?: boolean;
}) {
  const activeRef = useRef<HTMLButtonElement>(null);

  // 選択中の会場タブを中央付近へスクロール
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [activeSlug]);

  return (
    <nav
      aria-label="会場切り替え"
      className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur"
    >
      <ul className="flex gap-2 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* 宿タブ（一番左）。会場ではないが同じ地図でピンを表示する */}
        <li className="shrink-0">
          <button
            ref={activeSlug === LODGING_VENUE.slug ? activeRef : undefined}
            type="button"
            onClick={() => onSelect(LODGING_VENUE.slug)}
            aria-current={
              activeSlug === LODGING_VENUE.slug ? "true" : undefined
            }
            className={
              "tap flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium " +
              (activeSlug === LODGING_VENUE.slug
                ? "bg-yosakoi text-white shadow"
                : "bg-gray-100 text-gray-600")
            }
          >
            🛏️ {LODGING_VENUE.name}
          </button>
        </li>
        {/* 全会場を一望する「全体」タブ */}
        {showAll && (
          <li className="shrink-0">
            <button
              ref={activeSlug === "all" ? activeRef : undefined}
              type="button"
              onClick={() => onSelect("all")}
              aria-current={activeSlug === "all" ? "true" : undefined}
              className={
                "tap flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium " +
                (activeSlug === "all"
                  ? "bg-yosakoi text-white shadow"
                  : "bg-gray-100 text-gray-600")
              }
            >
              🗾 全体
            </button>
          </li>
        )}
        {VENUES.map((v) => {
          const active = v.slug === activeSlug;
          return (
            <li key={v.slug} className="shrink-0">
              <button
                ref={active ? activeRef : undefined}
                type="button"
                onClick={() => onSelect(v.slug)}
                aria-current={active ? "true" : undefined}
                className={
                  "tap flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium " +
                  (active
                    ? "bg-yosakoi text-white shadow"
                    : "bg-gray-100 text-gray-600")
                }
              >
                {v.name}
                {v.hasMedal && <span aria-hidden>🥇</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
