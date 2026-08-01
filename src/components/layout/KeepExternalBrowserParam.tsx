"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * LINE対策のURL管理（全ページ共通・レイアウトに設置）。
 *
 * 1. すべてのページのURLに ?openExternalBrowser=1 を常に付けておく。
 *    このパラメータ付きURLをLINEのトーク・リッチメニューでタップすると、
 *    LINEが自動で外部ブラウザ（Safari / Chrome）を起動する。
 * 2. パラメータ無しのURLをLINE内ブラウザで開かれた場合は、パラメータ付き
 *    URLへ実際に遷移し直すことで、LINEに外部ブラウザを自動起動させる
 *    （ユーザー操作なしでLINE内ブラウザから脱出できる）。
 *
 * 通常のブラウザでは replaceState でURL表記を変えるだけで、
 * 表示・履歴・データ取得には影響しない。
 */
export function KeepExternalBrowserParam() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = new URL(window.location.href);
    const isLine = /Line\//i.test(navigator.userAgent || "");

    // LINE内ブラウザで開かれたら、openExternalBrowser=1 付きURLへ
    // 実ナビゲーションし、LINEに外部ブラウザ（ユーザーの既定ブラウザ）を
    // 自動起動させる。試行はタイムスタンプ方式で「前回から7分経過」したら
    // 再試行を許可する。LINEがWebViewを再利用してフラグが残っても自然に
    // 復帰でき、外部起動が効かない環境でも7分に1回のリロードで済むため
    // 無限ループにならない（失敗時は InAppBrowserNotice のボタンが保険）。
    if (isLine) {
      const RETRY_MS = 7 * 60 * 1000;
      let canTry = false;
      try {
        const last = Number(sessionStorage.getItem("extBrowserTriedAt") ?? 0);
        if (!last || Date.now() - last > RETRY_MS) {
          sessionStorage.setItem("extBrowserTriedAt", String(Date.now()));
          // 書き込みが成功した時だけ試行（失敗時のループを防ぐ）
          canTry = sessionStorage.getItem("extBrowserTriedAt") !== null;
        }
      } catch {}
      if (canTry) {
        url.searchParams.set("openExternalBrowser", "1");
        window.location.replace(url.toString());
        return;
      }
    }

    // 通常ブラウザ: 共有用にURLへパラメータを常時付与（表示・履歴に影響しない）
    if (url.searchParams.get("openExternalBrowser") !== "1") {
      url.searchParams.set("openExternalBrowser", "1");
      window.history.replaceState(null, "", url.toString());
    }

    // 次回起動時の「最後に開いていたページ」復元用に現在地を記録。
    // app_session はセッション継続の目印（RestoreLastPage が参照）。
    try {
      sessionStorage.setItem("app_session", "1");
      if (pathname !== "/" && !pathname.startsWith("/admin")) {
        localStorage.setItem(
          "lastPath",
          window.location.pathname + window.location.search,
        );
      }
    } catch {
      // ストレージが使えない環境では復元機能だけ無効になる
    }
  }, [pathname, searchParams]);

  return null;
}
