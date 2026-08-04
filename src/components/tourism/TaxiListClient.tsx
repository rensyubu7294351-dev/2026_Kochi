"use client";

import { useEffect, useState } from "react";
import type { TaxiCompany } from "@/types";
import { fetchTaxi } from "@/lib/tourism";
import type { Audience } from "@/config/navigation";

/** タクシー会社一覧（Supabaseから取得）。 */
export function TaxiListClient({
  initialCompanies,
  audience,
}: {
  initialCompanies: TaxiCompany[];
  audience: Audience;
}) {
  // サーバーで焼き込んだ初期データで即描画し、裏で最新を取り直す
  const [companies, setCompanies] = useState<TaxiCompany[]>(initialCompanies);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchTaxi(audience).then((data) => {
        if (!cancelled) setCompanies(data);
      });
    load();
    // 画面に戻ってきた時に最新を取り直す（管理画面での更新を素早く反映）
    const onFocus = () => load();
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [audience]);

  if (companies.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        まだ登録がありません（管理画面から追加できます）。
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="rounded-lg border border-yosakoi/30 bg-yosakoi/5 px-3 py-2 text-sm font-medium text-yosakoi">
        📞 電話番号をタップするとそのまま発信できます
      </p>
      <ul className="grid gap-3">
        {companies.map((t, i) => (
          <li
            key={t.id}
            className="animate-fade-in-up rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <h3 className="font-bold">{t.name}</h3>
            {t.note && <p className="mt-0.5 text-xs text-gray-500">{t.note}</p>}
            <a
              href={`tel:${t.tel}`}
              className="tap mt-3 flex items-center justify-center gap-2 rounded-full bg-yosakoi py-3 text-lg font-bold tracking-wide text-white"
            >
              📞 {t.tel}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
