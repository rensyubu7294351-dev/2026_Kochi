"use client";

import { useEffect, useState } from "react";
import { fetchSettings } from "@/lib/settings";

/**
 * 「まとめGoogleマップ＋説明」ページ（銭湯 / コインランドリー共通）。
 * 管理画面で設定した埋め込みURLと説明文をSupabaseから読み込んで表示する。
 */
export function MapPageClient({ kind }: { kind: "sento" | "laundry" }) {
  const [data, setData] = useState<{ url: string; desc: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSettings().then((s) => {
      if (cancelled) return;
      setData({
        url: s[`${kind}_map_url`] ?? "",
        desc: s[`${kind}_desc`] ?? "",
      });
    });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  if (data === null) {
    return <p className="text-sm text-gray-400">読み込み中...</p>;
  }

  const isEmbeddable = data.url.startsWith("https://");

  return (
    <div className="space-y-4">
      {isEmbeddable ? (
        <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
          <iframe
            src={data.url}
            title="まとめマップ"
            className="h-[60vh] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-400">
          地図は準備中です（管理画面から設定できます）。
        </p>
      )}

      {isEmbeddable && (
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full bg-yosakoi px-4 py-2 text-sm font-bold text-white"
        >
          Googleマップで開く
        </a>
      )}

      {data.desc && (
        <div className="whitespace-pre-wrap rounded-xl border border-gray-100 bg-white p-4 text-sm leading-relaxed text-gray-700 shadow-sm">
          {data.desc}
        </div>
      )}
    </div>
  );
}
