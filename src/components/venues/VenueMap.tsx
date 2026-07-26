"use client";

import { useEffect } from "react";
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import type { Facility, LatLng, Venue } from "@/types";
import { FACILITY_META } from "@/config/facilities";
import { DEFAULT_VENUE_ZOOM, GOOGLE_MAPS_MAP_ID } from "@/lib/constants";
import { buildDirectionsUrl } from "@/lib/maps";
import { useGeolocation } from "@/hooks/useGeolocation";
import { GoogleMapProvider } from "@/components/map/GoogleMapProvider";
import { FacilityLegend } from "./FacilityLegend";

/**
 * 地図の中心・ズームを制御する内部コントローラ。
 * 優先順位:
 *  ① focusPosition があればそこへズームイン（検索結果への移動）
 *  ② それ以外は「全ピン（＋現在地）」が収まるよう自動でズーム調整（fitBounds）
 *  ③ ピンが無ければ会場の中心を表示
 */
function MapController({
  venue,
  facilities,
  currentLocation,
  focusPosition,
  fitWithCurrent,
  fitToken,
}: {
  venue: Venue;
  facilities: Facility[];
  currentLocation?: LatLng | null;
  focusPosition?: LatLng | null;
  fitWithCurrent: boolean;
  fitToken: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;

    // ① 検索結果などの単一地点フォーカス
    if (focusPosition) {
      map.panTo(focusPosition);
      map.setZoom(19);
      return;
    }

    // ② 全ピン（必要なら現在地も）を含む範囲を計算
    const pts: LatLng[] = facilities.map((f) => f.position);
    if (fitWithCurrent && currentLocation) pts.push(currentLocation);

    // ③ ピンが無ければ会場中心
    if (pts.length === 0) {
      map.panTo(venue.center);
      map.setZoom(venue.zoom ?? DEFAULT_VENUE_ZOOM);
      return;
    }

    const lats = pts.map((p) => p.lat);
    const lngs = pts.map((p) => p.lng);
    const north = Math.max(...lats);
    const south = Math.min(...lats);
    const east = Math.max(...lngs);
    const west = Math.min(...lngs);

    // ほぼ1点ならfitBoundsだと寄りすぎるのでpan+固定ズーム
    if (north - south < 0.0008 && east - west < 0.0008) {
      map.panTo(pts[0]);
      map.setZoom(18);
      return;
    }

    // 端のピンが切れないよう余白(px)を付けて全体表示
    map.fitBounds({ north, south, east, west }, 64);
  }, [
    map,
    venue,
    facilities,
    currentLocation,
    focusPosition,
    fitWithCurrent,
    fitToken,
  ]);
  return null;
}

/**
 * 個別会場のマップ。
 * - 施設ピン（自作アイコン＋ラベル）を表示
 * - 現在地を青ドットで表示
 * - 全ピン（＋現在地）が収まるよう自動ズーム
 * - 各ピンから「現在地からのルート検索」を Google マップで開く
 */
export function VenueMap({
  venue,
  facilities,
  currentLocation,
  focusPosition,
  fitWithCurrent,
  fitToken,
}: {
  venue: Venue;
  facilities: Facility[];
  currentLocation?: LatLng | null;
  focusPosition?: LatLng | null;
  fitWithCurrent: boolean;
  fitToken: number;
}) {
  const geo = useGeolocation();
  const facilityTypes = facilities.map((f) => f.type);

  async function routeTo(dest: LatLng) {
    const origin = currentLocation ?? (await geo.request()) ?? undefined;
    window.open(buildDirectionsUrl(dest, origin, "walking"), "_blank");
  }

  return (
    <section>
      <GoogleMapProvider>
        <div className="aspect-square w-full sm:aspect-[16/10]">
          <Map
            defaultCenter={venue.center}
            defaultZoom={venue.zoom ?? DEFAULT_VENUE_ZOOM}
            mapId={GOOGLE_MAPS_MAP_ID || undefined}
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            <MapController
              venue={venue}
              facilities={facilities}
              currentLocation={currentLocation}
              focusPosition={focusPosition}
              fitWithCurrent={fitWithCurrent}
              fitToken={fitToken}
            />

            {/* 現在地（青ドット） */}
            {currentLocation && (
              <AdvancedMarker position={currentLocation} title="現在地">
                <span className="block h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.3)]" />
              </AdvancedMarker>
            )}

            {/* 施設ピン */}
            {facilities.map((f) => {
              const meta = FACILITY_META[f.type];
              return (
                <AdvancedMarker
                  key={f.id}
                  position={f.position}
                  title={f.label ?? meta.label}
                  onClick={() => routeTo(f.position)}
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/icons/${meta.icon}`}
                      alt={meta.label}
                      width={44}
                      height={56}
                      className="drop-shadow"
                    />
                    <span className="pointer-events-none absolute left-1/2 top-[52px] -translate-x-1/2 whitespace-nowrap rounded-full border border-gray-200 bg-white/95 px-1.5 py-[1px] text-[10px] font-bold leading-tight text-gray-800 shadow-sm">
                      {f.label ?? meta.label}
                    </span>
                  </div>
                </AdvancedMarker>
              );
            })}
          </Map>
        </div>
      </GoogleMapProvider>

      <FacilityLegend types={facilityTypes} />

      {geo.error && <p className="px-4 text-xs text-red-500">{geo.error}</p>}
      <p className="px-4 pt-1 text-xs text-gray-400">
        ピンをタップすると、現在地からのルートをGoogleマップで開きます。
      </p>
    </section>
  );
}
