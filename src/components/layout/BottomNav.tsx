"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { label: "演舞会場", href: "/venues", emoji: "🗾" },
  { label: "銭湯", href: "/tourism/sento", emoji: "♨️" },
  { label: "ランドリー", href: "/tourism/laundry", emoji: "🧺" },
  { label: "タクシー", href: "/tourism/taxi", emoji: "🚕" },
];

/**
 * 画面下部の固定タブバー（ネイティブアプリ風）。
 * 演舞会場 / 銭湯 / コインランドリー / タクシー をどのページからでも
 * 親指1本で切り替えられる。
 *
 * position:fixed はモバイルのアドレスバー伸縮で動いて見えるため使わない。
 * 置くページ側を <main className="flex h-dvh flex-col"> にし、本文を
 * flex-1 + overflow-y-auto のコンテナでスクロールさせ、このバーを
 * 最後の子として通常フローで置く（＝バーは絶対に動かない）。
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="ページ切り替え"
      className="relative z-30 shrink-0 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  "tap flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold " +
                  (active ? "text-yosakoi" : "text-gray-400")
                }
              >
                {/* 選択中は絵文字がふわっと持ち上がり少し大きくなる */}
                <span
                  className={
                    "text-xl leading-none transition-all duration-300 ease-spring " +
                    (active
                      ? "-translate-y-0.5 scale-110"
                      : "grayscale opacity-60")
                  }
                  aria-hidden
                >
                  {item.emoji}
                </span>
                {item.label}
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
