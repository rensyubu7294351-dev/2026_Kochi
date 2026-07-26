import type { FacilityType } from "@/types";
import { FACILITY_META, FACILITY_ORDER } from "@/config/facilities";

/**
 * 会場マップの凡例。
 * その会場に存在する施設タイプだけを表示する（無い施設は出さない）。
 */
export function FacilityLegend({ types }: { types: FacilityType[] }) {
  const present = FACILITY_ORDER.filter((t) => types.includes(t));
  if (present.length === 0) {
    return (
      <p className="px-4 py-2 text-sm text-gray-400">
        施設情報は公式マップ公開後に追加されます。
      </p>
    );
  }
  return (
    <ul className="flex flex-wrap gap-2 px-4 py-3">
      {present.map((t) => {
        const meta = FACILITY_META[t];
        return (
          <li
            key={t}
            className="flex items-center gap-1 rounded-full border border-gray-200 py-1 pl-1 pr-2.5 text-xs"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/icons/${meta.icon}`}
              alt=""
              width={18}
              height={22}
              aria-hidden
            />
            {meta.label}
          </li>
        );
      })}
    </ul>
  );
}
