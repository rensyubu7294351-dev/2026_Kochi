"use client";

import type { FacilityType } from "@/types";
import { FACILITY_META, FACILITY_ORDER } from "@/config/facilities";

/**
 * 施設アイコンのチップ一覧（タップ可能）。
 * その会場に存在する施設タイプだけを表示する。
 * タップするとその施設タイプを選択（＝地図上で強調表示）、もう一度で解除。
 * 開始/終了ピンが揃う会場では先頭に「🏁 パレード」チップも表示する。
 */
export function FacilityChips({
  types,
  selected,
  onSelect,
  paradeAvailable,
  paradeActive,
  onToggleParade,
}: {
  types: FacilityType[];
  selected: FacilityType | null;
  onSelect: (t: FacilityType | null) => void;
  paradeAvailable: boolean;
  paradeActive: boolean;
  onToggleParade: () => void;
}) {
  const present = FACILITY_ORDER.filter((t) => types.includes(t));
  if (present.length === 0 && !paradeAvailable) {
    return (
      <p className="text-xs text-gray-400">
        この会場の施設情報はまだ登録されていません。
      </p>
    );
  }

  return (
    <div>
      <p className="mb-1.5 text-xs text-gray-500">
        アイコンをタップすると地図で強調表示します
      </p>
      <div className="flex flex-wrap gap-2">
        {/* パレード（開始→終了ルート）チップ */}
        {paradeAvailable && (
          <button
            type="button"
            onClick={onToggleParade}
            aria-pressed={paradeActive}
            className={
              "flex items-center gap-1 rounded-full border py-1 pl-2.5 pr-2.5 text-xs font-bold transition " +
              (paradeActive
                ? "border-yosakoi bg-yosakoi text-white ring-2 ring-yosakoi/40"
                : "border-yosakoi bg-white text-yosakoi active:scale-95")
            }
          >
            🏁 パレード
          </button>
        )}

        {present.map((t) => {
          const meta = FACILITY_META[t];
          const active = selected === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onSelect(active ? null : t)}
              aria-pressed={active}
              className={
                "flex items-center gap-1 rounded-full border py-1 pl-1 pr-2.5 text-xs transition " +
                (active
                  ? "border-yosakoi bg-yosakoi/10 font-bold text-yosakoi ring-2 ring-yosakoi/40"
                  : "border-gray-200 bg-white text-gray-700 active:scale-95")
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/icons/${meta.icon}`}
                alt=""
                width={20}
                height={25}
              />
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
