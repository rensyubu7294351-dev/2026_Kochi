"use client";

import { useState } from "react";
import Link from "next/link";
import { AUDIENCE_PREFIX } from "@/config/navigation";
import {
  EDIT_TARGETS,
  EDIT_TARGET_LABEL,
  readAudience,
  type EditTarget,
} from "@/lib/adminAudience";
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
 * 管理画面のトップ。
 * 上部で「どこを編集するか（ユーザー用 / サポーター用 / 両方）」を選び、
 * その下でセクション（演舞会場 / 観光編）を切り替える。
 * 2つのサイトはデータが別々なので、選んだ対象だけが編集される。
 * 「両方」を選ぶと、追加・変更・削除が2つのサイトへ同時に反映される。
 */
export function AdminDashboard({
  password,
  onLock,
}: {
  password: string;
  onLock: () => void;
}) {
  const [audience, setAudience] = useState<EditTarget>("both");
  const [section, setSection] = useState<Section>("venues");
  const isSupporter = audience === "supporter";
  const isBoth = audience === "both";

  return (
    <main className="pb-8">
      {/* ヘッダー */}
      <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h1 className="font-bold">管理者ページ</h1>
          <nav className="text-xs text-gray-400">
            <Link
              href={`${AUDIENCE_PREFIX[readAudience(audience)]}/venues`}
              className="hover:text-yosakoi"
            >
              アプリ（{EDIT_TARGET_LABEL[readAudience(audience)]}）
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

      {/* 編集対象のサイト切り替え。取り違え防止のため色でも区別する */}
      <div
        className={
          "border-b-4 px-3 py-3 " +
          (isBoth
            ? "border-emerald-500 bg-emerald-50"
            : isSupporter
              ? "border-indigo-500 bg-indigo-50"
              : "border-yosakoi bg-yosakoi/5")
        }
      >
        <p className="mb-1.5 text-xs font-bold text-gray-500">
          編集するサイトを選んでください
        </p>
        <div className="flex gap-2">
          {EDIT_TARGETS.map((a) => {
            const active = a === audience;
            const activeColor =
              a === "both"
                ? "bg-emerald-600"
                : a === "supporter"
                  ? "bg-indigo-600"
                  : "bg-yosakoi";
            return (
              <button
                key={a}
                type="button"
                onClick={() => setAudience(a)}
                aria-pressed={active}
                className={
                  "flex-1 rounded-lg px-2 py-2 text-sm font-bold transition " +
                  (active
                    ? `${activeColor} text-white shadow`
                    : "border border-gray-300 bg-white text-gray-500")
                }
              >
                {EDIT_TARGET_LABEL[a]}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs font-medium text-gray-600">
          いま編集中：
          <span
            className={
              isBoth
                ? "text-emerald-700"
                : isSupporter
                  ? "text-indigo-700"
                  : "text-yosakoi"
            }
          >
            {EDIT_TARGET_LABEL[audience]}
          </span>
          {isBoth
            ? "（追加・変更・削除がユーザー用とサポーター用の両方に反映されます。一覧はユーザー用を表示しています）"
            : "（もう一方には反映されません）"}
        </p>
      </div>

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

      {/* 選択中のエディタ（系統を切り替えると中身も切り替わる） */}
      {section === "venues" && (
        <AdminVenueEditor password={password} audience={audience} />
      )}
      {section === "sento" && (
        <AdminSentoEditor password={password} audience={audience} />
      )}
      {section === "laundry" && (
        <AdminLaundryEditor password={password} audience={audience} />
      )}
      {section === "taxi" && (
        <AdminTaxiEditor password={password} audience={audience} />
      )}
    </main>
  );
}
