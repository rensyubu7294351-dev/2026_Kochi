"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * アプリを閉じて再度開いた時（＝新しいセッションでホームに着地した時）に、
 * 前回最後に見ていたページへ自動で移動する。
 * 同じセッション内で「ホームへ戻る」操作をした場合は何もしない
 * （セッション中かどうかは sessionStorage の app_session フラグで判定。
 *   フラグは KeepExternalBrowserParam が全ページで立てる）。
 */
export function RestoreLastPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      if (sessionStorage.getItem("app_session")) return;
      sessionStorage.setItem("app_session", "1");
      const last = localStorage.getItem("lastPath");
      if (last && last.startsWith("/") && last !== "/") {
        router.replace(last);
      }
    } catch {
      // プライベートモード等でストレージが使えない場合は何もしない
    }
  }, [router]);

  return null;
}
