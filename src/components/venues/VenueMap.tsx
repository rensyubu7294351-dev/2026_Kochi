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
 * 地図の中心を制御する内部コントローラ。
 * - focusPosition があればそこへズームイン（検索結果・現在地への移動）
 * - なければ会場の中心へ
 */
function MapController({
  venue,
  focusPosition,
}: {
  venue: Venue;
  focusPosition?: LatLng | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (focusPosition) {
      map.panTo(focusPosition);
      map.setZoom(19);
    } else {
      map.panTo(venue.center);
      map.setZoom(venue.zoom ?? DEFAULT_VENUE_ZOOM);
    }
  }, [map, venue, focusPosition]);
  return null;
}

/**
 * 個別会場のマップ。
 * - 施設ピンを AdvancedMarker（自作の可愛いアイコン）で表示
 * - 現在地を青ドットで表示
 * - 凡例を下部に表示
 * - 各ピンから「現在地からのルート検索」を Google マップで開く
 * - venue / focusPosition が変わると地図がその場所へ移動する
 */
export function VenueMap({
  venue,
  facilities,
  currentLocation,
  focusPosition,
}: {
  venue: Venue;
  facilities: Facility[];
  currentLocation?: LatLng | null;
  focusPosition?: LatLng | null;
}) {
  const geo = useGeolocation();
  const facilityTypes = facilities.map((f) => f.type);

  async function routeTo(dest: LatLng) {
    // 現在地を取得できれば origin に含める。失敗しても Google 側で現在地を使う。
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
            <MapController venue={venue} focusPosition={focusPosition} />

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
                    {/* 施設名ラベル（ピンの直下） */}
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
