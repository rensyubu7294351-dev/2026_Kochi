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
    if (url.searchParams.get("openExternalBrowser") === "1") return;
    url.searchParams.set("openExternalBrowser", "1");

    const isLine = /Line\//i.test(navigator.userAgent || "");
    if (isLine) {
      // LINE内ブラウザ: 実ナビゲーションさせるとLINEが外部ブラウザを起動する。
      // 遷移後はパラメータが付いているため再実行されず、ループしない。
      window.location.replace(url.toString());
    } else {
      window.history.replaceState(null, "", url.toString());
    }
  }, [pathname, searchParams]);

  return null;
}
