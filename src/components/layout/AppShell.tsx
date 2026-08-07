"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { audienceFromPath, isKnownRoute } from "@/config/navigation";

const FRAME = "mx-auto max-w-[var(--max-content-width)] bg-white shadow-sm";

/**
 * 全ページ共通の外枠。
 *
 * 下部タブバーはここ（＝レイアウト側）に置く。以前は各ページの中に
 * 置いていたため、タブを切り替えるたびにバー自体が作り直され、
 *   ・押した時のフィードバックが遷移の瞬間に消える
 *   ・選択タブの移動がアニメーションせず、一瞬ちらつく
 * という状態だった。レイアウトに置くと React が同じ要素として保つので、
 * ページの中身だけが差し替わり、バーは触った通りに動き続ける。
 *
 * タブのあるページだけ画面全体を固定（h-dvh）して本文だけをスクロールさせ、
 * トップの転送画面や管理画面はこれまで通り普通に伸びる箱に入れる。
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const audience = audienceFromPath(pathname);
  const hasTabs = isKnownRoute(pathname, audience);
  const scroller = useRef<HTMLElement>(null);

  // ページを移ったら本文を先頭に戻す（スクロール位置の持ち越しを防ぐ）。
  // 会場タブの ?v= 切り替えは pathname が変わらないので影響しない。
  useEffect(() => {
    scroller.current?.scrollTo(0, 0);
  }, [pathname]);

  if (!hasTabs) return <div className={`min-h-dvh ${FRAME}`}>{children}</div>;

  return (
    <div className={`flex h-dvh flex-col ${FRAME}`}>
      <main ref={scroller} className="flex-1 overflow-y-auto">
        {children}
      </main>
      <BottomNav audience={audience} />
    </div>
  );
}
