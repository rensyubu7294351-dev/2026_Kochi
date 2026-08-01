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
 * 置くページは本文最下部が隠れないよう main に pb-24 程度の余白を取ること。
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="ページ切り替え"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[var(--max-content-width)] border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
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
