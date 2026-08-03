"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_ROUTE, isKnownRoute } from "@/config/navigation";

/**
 * "/" 用のランチャー。
 * トップ画面は廃止したが、LINEのリッチメニュー等が "/" を入口に
 * している可能性があるため 404 にはせず、ここから実ページへ転送する。
 * 転送先は「前回最後に開いていたページ」、無ければ演舞会場ページ。
 */
export function HomeLauncher() {
  const router = useRouter();

  useEffect(() => {
    let last: string | null = null;
    try {
      last = localStorage.getItem("lastPath");
    } catch {
      // ストレージが使えない環境では既定ページへ
    }
    router.replace(isKnownRoute(last) ? (last as string) : DEFAULT_ROUTE);
  }, [router]);

  return (
    <main className="flex h-dvh items-center justify-center">
      <p className="text-sm text-gray-400">読み込み中...</p>
    </main>
  );
}
