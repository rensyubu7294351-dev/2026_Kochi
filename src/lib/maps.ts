import type { LatLng } from "@/types";

/**
 * 現在地から目的地までのルートを Google マップで開くURLを生成する。
 *
 * 方針:
 * - 最も確実でメンテ不要なのは Google Maps の URL スキームを使う方法。
 *   アプリ内で Directions API を叩いて経路描画することも可能だが、
 *   まずは「Googleマップアプリ/サイトに飛ばしてルート案内させる」実装が堅実。
 * - origin を省略すると Google 側が現在地を使う。確実に現在地を使いたい場合は
 *   ブラウザの Geolocation で取得した座標を渡す。
 *
 * @param destination 目的地の座標
 * @param origin      出発地（省略時は Google 側で現在地扱い）
 * @param travelmode  移動手段（既定: walking）
 */
export function buildDirectionsUrl(
  destination: LatLng,
  origin?: LatLng,
  travelmode: "walking" | "driving" | "transit" | "bicycling" = "walking",
): string {
  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.lat},${destination.lng}`,
    travelmode,
  });
  if (origin) {
    params.set("origin", `${origin.lat},${origin.lng}`);
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** 単一地点をGoogleマップで開くURL（ルートではなくピン表示） */
export function buildPlaceUrl(point: LatLng, label?: string): string {
  const q = label
    ? `${point.lat},${point.lng}(${encodeURIComponent(label)})`
    : `${point.lat},${point.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
