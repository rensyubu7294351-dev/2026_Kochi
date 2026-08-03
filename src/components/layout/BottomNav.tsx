"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV } from "@/config/navigation";

/** タブの中身（アイコン＋ラベル＋選択インジケータ）。リンク種別によらず共通 */
function TabInner({ emoji, label, active }: { emoji: string; label: string; active: boolean }) {
  return (
    <>
      {/* 選択中は絵文字がふわっと持ち上がり少し大きくなる */}
      <span
        className={
          "text-xl leading-none transition-all duration-300 ease-spring " +
          (active ? "-translate-y-0.5 scale-110" : "grayscale opacity-60")
        }
        aria-hidden
      >
        {emoji}
      </span>
      {label}
      {/* 選択インジケータ（下の小さな点） */}
      <span
        className={
          "h-1 w-1 rounded-full bg-yosakoi transition-all duration-300 ease-spring " +
          (active ? "scale-100 opacity-100" : "scale-0 opacity-0")
        }
        aria-hidden
      />
    </>
  );
}

/**
 * 画面下部の固定タブバー（ネイティブアプリ風）。
 * トップページを廃止したため、ここがページ移動の唯一の入口。
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
      <ul className="grid grid-cols-5">
        {MAIN_NAV.map((item) => {
          const active = !item.external && pathname === item.href;
          const className =
            "tap flex flex-col items-center gap-0.5 px-0.5 py-2 text-[10px] font-bold " +
            (active ? "text-yosakoi" : "text-gray-400");
          return (
            <li key={item.href}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  <TabInner
                    emoji={item.emoji}
                    label={item.label}
                    active={false}
                  />
                </a>
              ) : (
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={className}
                >
                  <TabInner
                    emoji={item.emoji}
                    label={item.label}
                    active={active}
                  />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
