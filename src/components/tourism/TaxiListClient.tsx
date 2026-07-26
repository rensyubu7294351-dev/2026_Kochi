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
    <ul className="grid gap-3">
      {companies.map((t) => (
        <li
          key={t.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <div>
            <h3 className="font-bold">{t.name}</h3>
            {t.note && <p className="text-xs text-gray-500">{t.note}</p>}
          </div>
          <a
            href={`tel:${t.tel}`}
            className="shrink-0 rounded-full bg-yosakoi px-4 py-2 text-sm font-bold text-white"
          >
            📞 発信
          </a>
        </li>
      ))}
    </ul>
  );
}
