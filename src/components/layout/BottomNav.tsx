"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navFor, type Audience } from "@/config/navigation";

/**
 * 画面下部の固定タブバー（ネイティブアプリ風）。
 * トップページを廃止したため、ここがページ移動の唯一の入口。
 *
 * position:fixed はモバイルのアドレスバー伸縮で動いて見えるため使わない。
 * AppShell 側を flex h-dvh flex-col にし、本文を flex-1 + overflow-y-auto の
 * コンテナでスクロールさせ、このバーを最後の子として通常フローで置く
 * （＝バーは絶対に動かない）。
 */
export function BottomNav({ audience }: { audience: Audience }) {
  const pathname = usePathname();
  const items = navFor(audience);

  // タップしたタブをすぐ選択済みとして描く。usePathname は遷移が確定して
  // から変わるので、それを待つと押してから選択が移るまで一拍空いてしまう。
  // 先に見た目だけ動かすことで、押した瞬間にそのページへ切り替わったように見える。
  const [tapped, setTapped] = useState<string | null>(null);
  useEffect(() => setTapped(null), [pathname]);
  const selected = tapped ?? pathname;

  return (
    <nav
      aria-label="ページ切り替え"
      className="relative z-30 shrink-0 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      {/* 項目数に合わせて等幅に割る（Tailwindの動的クラスは効かないため style で指定） */}
      <ul
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        }}
      >
        {items.map((item) => {
          const active = selected === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch
                onClick={() => setTapped(item.href)}
                // 読み上げには「実際に今いるページ」を伝える（先読みの見た目とは分ける）
                aria-current={pathname === item.href ? "page" : undefined}
                className={
                  "tap group relative flex flex-col items-center gap-0.5 px-0.5 py-2 text-[10px] font-bold " +
                  (active ? "text-yosakoi" : "text-gray-400")
                }
              >
                {/* 押した瞬間だけパッと浮かぶ丸いハイライト。指を離すとすぐ消える */}
                <span
                  aria-hidden
                  className="absolute inset-x-1 inset-y-0.5 -z-10 scale-75 rounded-xl bg-yosakoi/10 opacity-0 transition-all duration-150 ease-spring group-active:scale-100 group-active:opacity-100"
                />
                {/* 選択中は絵文字がふわっと持ち上がり少し大きくなる／押した瞬間はキュッと縮んで反応を伝える */}
                <span
                  className={
                    "text-xl leading-none transition-all duration-300 ease-spring group-active:scale-75 " +
                    (active
                      ? "-translate-y-0.5 scale-110"
                      : "grayscale opacity-60")
                  }
                  aria-hidden
                >
                  {item.emoji}
                </span>
                <span className="w-full truncate px-0.5 text-center">
                  {item.label}
                </span>
                {/* 選択インジケータ（下の小さな点） */}
                <span
                  className={
                    "h-1 w-1 rounded-full bg-yosakoi transition-all duration-300 ease-spring " +
                    (active ? "scale-100 opacity-100" : "scale-0 opacity-0")
                  }
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
