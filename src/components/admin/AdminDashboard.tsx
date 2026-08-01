"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminVenueEditor } from "./AdminVenueEditor";
import { AdminSentoEditor } from "./AdminSentoEditor";
import { AdminLaundryEditor } from "./AdminLaundryEditor";
import { AdminTaxiEditor } from "./AdminTaxiEditor";

type Section = "venues" | "sento" | "laundry" | "taxi";

const SECTIONS: { key: Section; label: string }[] = [
  { key: "venues", label: "演舞会場" },
  { key: "sento", label: "銭湯" },
  { key: "laundry", label: "コインランドリー" },
  { key: "taxi", label: "タクシー" },
];

/**
 * 管理画面のトップ。上部でセクション（演舞会場 / 観光編）を切り替え、
 * 対応するエディタを表示する。
 */
export function AdminDashboard({
  password,
  onLock,
}: {
  password: string;
  onLock: () => void;
}) {
  const [section, setSection] = useState<Section>("venues");

  return (
    <main className="pb-8">
      {/* ヘッダー */}
      <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h1 className="font-bold">管理者ページ</h1>
          <nav className="text-xs text-gray-400">
            <Link href="/" className="hover:text-yosakoi">
              ホーム
            </Link>{" "}
            › 管理者
          </nav>
        </div>
        <button
          onClick={onLock}
          className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500"
        >
          ロック
        </button>
      </header>

      {/* セクション切り替え */}
      <div className="border-b border-gray-100 bg-white">
        <ul className="flex gap-2 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SECTIONS.map((s) => {
            const active = s.key === section;
            return (
              <li key={s.key} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setSection(s.key)}
                  className={
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition " +
                    (active
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600")
                  }
                >
                  {s.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 選択中のエディタ */}
      {section === "venues" && <AdminVenueEditor password={password} />}
      {section === "sento" && <AdminSentoEditor password={password} />}
      {section === "laundry" && <AdminLaundryEditor password={password} />}
      {section === "taxi" && <AdminTaxiEditor password={password} />}
    </main>
  );
}
