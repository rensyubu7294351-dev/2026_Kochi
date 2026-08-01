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
      className="shrink-0 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]"
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
                  "flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition " +
                  (active ? "text-yosakoi" : "text-gray-400 active:scale-95")
                }
              >
                <span
                  className={
                    "text-xl leading-none " +
                    (active ? "" : "grayscale opacity-60")
                  }
                  aria-hidden
                >
                  {item.emoji}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
