"use client";

import { useEffect, useState } from "react";

type BrowserKind = "line" | "other" | null;

/**
 * LINE / Instagram などアプリ内ブラウザの検知と案内。
 * アプリ内ブラウザでは位置情報（現在地）が使えないことが多いため、
 * - LINE: ?openExternalBrowser=1 を付けて自身を開き直すと、LINEが
 *   自動で外部ブラウザ（Safari / Chrome）を起動する → ワンタップで解決
 * - その他（Instagram等）: 手動で開き直す手順を案内
 */
export function InAppBrowserNotice() {
  const [kind, setKind] = useState<BrowserKind>(null);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    if (/Line\//i.test(ua)) setKind("line");
    else if (/FBAN|FBAV|Instagram/i.test(ua)) setKind("other");
  }, []);

  if (kind === null) return null;

  if (kind === "line") {
    const openExternal = () => {
      const url = new URL(window.location.href);
      url.searchParams.set("openExternalBrowser", "1");
      window.location.href = url.toString();
    };
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2">
        <p className="text-xs font-medium text-amber-800">
          ⚠️ LINE内のブラウザでは現在地（位置情報）が使えません。
        </p>
        <button
          type="button"
          onClick={openExternal}
          className="tap mt-2 w-full rounded-lg bg-amber-500 py-2 text-sm font-bold text-white"
        >
          🌐 Safari / Chrome で開き直す（タップするだけ）
        </button>
      </div>
    );
  }

  return (
    <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
      ⚠️ 現在地が取得できない場合は「…」メニューから
      <span className="font-bold">「Safari / Chrome で開く」</span>
      を選んでください。
    </p>
  );
}
