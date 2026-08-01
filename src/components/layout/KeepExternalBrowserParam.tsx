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

    // LINE内ブラウザで開かれたら、パラメータの有無に関係なく1回だけ
    // openExternalBrowser=1 付きURLへ実ナビゲーションし、LINEに
    // 外部ブラウザ（ユーザーの既定ブラウザ）を自動起動させる。
    // 「1回だけ」にするのは、外部起動に失敗する環境で無限リロードに
    // ならないため（失敗時は InAppBrowserNotice のボタンが保険になる）。
    if (isLine) {
      let canTry = false;
      try {
        if (sessionStorage.getItem("extBrowserTried") !== "1") {
          sessionStorage.setItem("extBrowserTried", "1");
          canTry = sessionStorage.getItem("extBrowserTried") === "1";
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
