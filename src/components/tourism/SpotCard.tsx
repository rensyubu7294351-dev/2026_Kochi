import type { OpeningHours, TourismSpot } from "@/types";
import { buildPlaceUrl, buildDirectionsUrl } from "@/lib/maps";

const DAY_LABELS: { key: keyof Omit<OpeningHours, "note">; label: string }[] = [
  { key: "mon", label: "月" },
  { key: "tue", label: "火" },
  { key: "wed", label: "水" },
  { key: "thu", label: "木" },
  { key: "fri", label: "金" },
  { key: "sat", label: "土" },
  { key: "sun", label: "日" },
];

/**
 * 銭湯・コインランドリー共通の表示カード。
 * 営業時間・地図リンク・ルート検索・電話を表示する。
 */
export function SpotCard({
  spot,
  extra,
}: {
  spot: TourismSpot;
  /** 種別ごとの追加バッジ（例: 「サウナ」「24h」「¥490」） */
  extra?: React.ReactNode;
}) {
  return (
    <li className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold">{spot.name}</h3>
          <p className="text-xs text-gray-500">{spot.address}</p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">{extra}</div>
      </div>

      <table className="mt-3 w-full text-xs">
        <tbody>
          {DAY_LABELS.map(({ key, label }) => (
            <tr key={key} className="border-b border-gray-50 last:border-0">
              <th className="w-8 py-0.5 text-left font-medium text-gray-400">
                {label}
              </th>
              <td className="py-0.5">
                {spot.hours[key] ?? (
                  <span className="text-red-400">定休</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {spot.hours.note && (
        <p className="mt-1 text-xs text-gray-400">※ {spot.hours.note}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <a
          href={buildDirectionsUrl(spot.position, undefined, "walking")}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-yosakoi px-3 py-1 font-medium text-white"
        >
          ルート検索
        </a>
        <a
          href={buildPlaceUrl(spot.position, spot.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-gray-200 px-3 py-1"
        >
          地図で見る
        </a>
        {spot.tel && (
          <a
            href={`tel:${spot.tel}`}
            className="rounded-full border border-gray-200 px-3 py-1"
          >
            📞 {spot.tel}
          </a>
        )}
      </div>
    </li>
  );
}
