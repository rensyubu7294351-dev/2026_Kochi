"use client";

import { useEffect, useState } from "react";
import type { Laundry, Sento } from "@/types";
import { fetchLaundry, fetchSento } from "@/lib/tourism";
import { SpotCard } from "./SpotCard";

/**
 * 銭湯・コインランドリーの一覧（Supabaseから取得して表示）。
 * 管理画面で入力した内容がここに反映される。
 */
export function SpotListClient({ kind }: { kind: "sento" | "laundry" }) {
  const [spots, setSpots] = useState<(Sento | Laundry)[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = kind === "sento" ? fetchSento() : fetchLaundry();
    load.then((data) => {
      if (!cancelled) setSpots(data);
    });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  if (spots === null) {
    return <p className="text-sm text-gray-400">読み込み中...</p>;
  }
  if (spots.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        まだ登録がありません（管理画面から追加できます）。
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {spots.map((s) => (
        <SpotCard
          key={s.id}
          spot={s}
          extra={
            kind === "sento" ? (
              <>
                {"price" in s && s.price != null && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                    ¥{s.price}
                  </span>
                )}
                {"hasSauna" in s && s.hasSauna && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                    サウナ
                  </span>
                )}
              </>
            ) : "is24h" in s && s.is24h ? (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                24h
              </span>
            ) : null
          }
        />
      ))}
    </ul>
  );
}
