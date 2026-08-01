"use client";

import { useEffect, useState } from "react";
import type { TaxiCompany } from "@/types";
import { fetchTaxi } from "@/lib/tourism";

/** タクシー会社一覧（Supabaseから取得）。 */
export function TaxiListClient() {
  const [companies, setCompanies] = useState<TaxiCompany[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTaxi().then((data) => {
      if (!cancelled) setCompanies(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (companies === null) {
    return <p className="text-sm text-gray-400">読み込み中...</p>;
  }
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
        {companies.map((t) => (
          <li
            key={t.id}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <h3 className="font-bold">{t.name}</h3>
            {t.note && <p className="mt-0.5 text-xs text-gray-500">{t.note}</p>}
            <a
              href={`tel:${t.tel}`}
              className="mt-3 flex items-center justify-center gap-2 rounded-full bg-yosakoi py-3 text-lg font-bold tracking-wide text-white active:scale-[0.99]"
            >
              📞 {t.tel}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
