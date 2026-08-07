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

/**
 * 保存済みリンクから場所ID（ChIJ… で始まる Google の場所の識別子）を取り出す。
 * 管理画面に貼られる古い形式 `.../maps/place/?q=place_id:ChIJ…` と、
 * 公式形式の `...&query_place_id=ChIJ…` の両方に対応する。
 */
function placeIdFrom(url: string): string | null {
  return url.match(/place_id[:=](ChIJ[A-Za-z0-9_-]+)/)?.[1] ?? null;
}

/** 座標だけで開く公式形式のURL（場所IDが分かる時はそれも添える） */
function officialPlaceUrl(point: LatLng, placeId?: string): string {
  const params = new URLSearchParams({
    api: "1",
    query: `${point.lat},${point.lng}`,
  });
  // 場所IDを添えると、ただの座標ピンではなく店舗として開く。
  // 万一IDが古くなっていても query の座標があるので位置は外さない。
  if (placeId) params.set("query_place_id", placeId);
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

/**
 * 単一地点をGoogleマップで開くURL（ルートではなくピン表示）。
 *
 * 公式の Google Maps URLs 仕様（api=1）で組み立てる。この形式だけが
 * PC・iPhone・Androidのアプリすべてで同じように解釈される。
 *
 * 直す対象は次の2つ。どちらもスマホのGoogleマップアプリに渡ると
 * 「一致する検索場所がありません」になる。
 *
 * 1. 保存リンクが無い時の `query=緯度,経度(店名)` という書き方。
 *    api=1 では使えない古い記法で、Googleは全体を1つの検索語として扱う。
 *    実測ではコインランドリーを開くと350km離れた三重県が表示されていた。
 *    座標は必ず `緯度,経度` だけを渡す。
 * 2. 管理画面で貼られた `.../maps/place/?q=place_id:ChIJ…` という古い形式。
 *    公式仕様に無いためアプリが場所IDを検索語として読んでしまう。
 *    場所IDだけ取り出して公式形式に組み立て直す。
 *
 * 短縮リンク（maps.app.goo.gl）や `?cid=` など、Google自身が発行して
 * そのまま開ける形式はいじらずに使う。
 *
 * @param point    その場所の座標（保存済みリンクが無くても必ずここが開く）
 * @param savedUrl 管理画面で登録されたGoogleマップのリンク（任意）
 */
export function buildPlaceUrl(point: LatLng, savedUrl?: string): string {
  const saved = savedUrl?.trim();
  if (!saved) return officialPlaceUrl(point);

  // すでに公式形式ならそのまま
  if (saved.includes("api=1")) return saved;

  // 古い場所ID形式は、IDを取り出して公式形式に直す
  const placeId = placeIdFrom(saved);
  if (placeId) return officialPlaceUrl(point, placeId);

  // 短縮リンク・cid など、Googleがそのまま解釈できるリンクは触らない
  return saved;
}
