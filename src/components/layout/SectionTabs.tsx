"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** ユーザー側の大分類タブ（管理画面のセクション切替と同じ並び） */
const SECTIONS = [
  { label: "演舞会場", href: "/venues", emoji: "🗾" },
  { label: "銭湯", href: "/tourism/sento", emoji: "♨️" },
  { label: "コインランドリー", href: "/tourism/laundry", emoji: "🧺" },
  { label: "タクシー", href: "/tourism/taxi", emoji: "🚕" },
];

/**
 * 演舞会場 / 銭湯 / コインランドリー / タクシー を横断で切り替えるタブ。
 * 各ページ上部に置き、どのページからでも他ページへ移動できる。
 */
export function SectionTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="ページ切り替え"
      className="border-b border-gray-100 bg-white"
    >
      <ul className="flex gap-2 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((s) => {
          const active = pathname === s.href;
          return (
            <li key={s.href} className="shrink-0">
              <Link
                href={s.href}
                aria-current={active ? "page" : undefined}
                className={
                  "flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition " +
                  (active
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 active:scale-95")
                }
              >
                <span aria-hidden>{s.emoji}</span>
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
