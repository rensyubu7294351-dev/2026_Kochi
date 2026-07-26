"use client";

import type { OpeningHours } from "@/types";

const DAYS: { key: keyof Omit<OpeningHours, "note">; label: string }[] = [
  { key: "mon", label: "月" },
  { key: "tue", label: "火" },
  { key: "wed", label: "水" },
  { key: "thu", label: "木" },
  { key: "fri", label: "金" },
  { key: "sat", label: "土" },
  { key: "sun", label: "日" },
];

/**
 * 営業時間の入力。空欄=定休(null)。
 * 「平日を一括入力」ボタンで月〜金にまとめて反映できる。
 */
export function HoursEditor({
  value,
  onChange,
}: {
  value: OpeningHours;
  onChange: (h: OpeningHours) => void;
}) {
  function setDay(key: keyof OpeningHours, v: string) {
    onChange({ ...value, [key]: v.trim() === "" ? null : v });
  }

  function fillWeekdays() {
    const src = value.mon ?? "";
    onChange({ ...value, tue: src || null, wed: src || null, thu: src || null, fri: src || null });
  }

  function fillAll() {
    const src = value.mon ?? "";
    onChange({
      ...value,
      tue: src || null,
      wed: src || null,
      thu: src || null,
      fri: src || null,
      sat: src || null,
      sun: src || null,
    });
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-xs text-gray-500">
          営業時間（空欄=定休 / 例: 15:00-24:00, 24時間）
        </label>
      </div>
      <div className="grid gap-1">
        {DAYS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-5 text-sm text-gray-400">{label}</span>
            <input
              value={value[key] ?? ""}
              onChange={(e) => setDay(key, e.target.value)}
              placeholder="定休"
              className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={fillWeekdays}
          className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600"
        >
          月の値を平日にコピー
        </button>
        <button
          type="button"
          onClick={fillAll}
          className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600"
        >
          月の値を全曜日にコピー
        </button>
      </div>
      <input
        value={value.note ?? ""}
        onChange={(e) =>
          onChange({ ...value, note: e.target.value.trim() || undefined })
        }
        placeholder="補足（最終受付など・任意）"
        className="mt-2 w-full rounded-lg border border-gray-300 px-2 py-1 text-sm"
      />
    </div>
  );
}
