"use client";

import { useEffect, useRef } from "react";
import { VENUES } from "@/data/venues";

/**
 * 全14会場を横スクロールのタブで切り替えるバー。
 * ページ遷移せず、onSelect で親の表示会場を切り替える（地図がその場で変わる）。
 * - 現在の会場をハイライト
 * - 現在のタブを自動的に画面内へスクロール
 * - メダル会場には小さなメダル印を表示
 */
export function VenueTabs({
  activeSlug,
  onSelect,
}: {
  activeSlug: string;
  onSelect: (slug: string) => void;
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
                  "flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition " +
                  (active
                    ? "bg-yosakoi text-white shadow"
                    : "bg-gray-100 text-gray-600 active:scale-95")
                }
              >
                <span className="text-xs opacity-70">{v.id}</span>
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
