"use client";

import { useEffect } from "react";
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import type { LatLng } from "@/types";
import { VENUES } from "@/data/venues";
import { KOCHI_CENTER, GOOGLE_MAPS_MAP_ID } from "@/lib/constants";
import { GoogleMapProvider } from "@/components/map/GoogleMapProvider";

/** 全会場（＋取得済みなら現在地）が1画面に収まるよう表示範囲を制御 */
function MapController({
  currentLocation,
  fitWithCurrent,
  fitToken,
}: {
  currentLocation: LatLng | null;
  fitWithCurrent: boolean;
  fitToken: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const pts = VENUES.map((v) => v.center);
    if (fitWithCurrent && currentLocation) pts.push(currentLocation);
    const lats = pts.map((p) => p.lat);
    const lngs = pts.map((p) => p.lng);
    map.fitBounds(
      {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs),
      },
      48,
    );
  }, [map, currentLocation, fitWithCurrent, fitToken]);
  return null;
}

/**
 * 「全体」タブ用の全演舞会場マップ。
 * 全会場をピンで一望でき、ピンをタップするとその会場のタブに切り替わる。
 */
export function AllVenuesMap({
  currentLocation,
  fitWithCurrent,
  fitToken,
  onSelect,
}: {
  currentLocation: LatLng | null;
  fitWithCurrent: boolean;
  fitToken: number;
  onSelect: (slug: string) => void;
}) {
  return (
    <section>
      <GoogleMapProvider>
        <div className="aspect-square w-full sm:aspect-[16/10]">
          <Map
            defaultCenter={KOCHI_CENTER}
            defaultZoom={13}
            mapId={GOOGLE_MAPS_MAP_ID || undefined}
            gestureHandling="greedy"
            clickableIcons={false}
          >
            <MapController
              currentLocation={currentLocation}
              fitWithCurrent={fitWithCurrent}
              fitToken={fitToken}
            />

            {/* 現在地（青ドット） */}
            {currentLocation && (
              <AdvancedMarker
                position={currentLocation}
                title="現在地"
                zIndex={30}
              >
                <span className="block h-4 w-4 animate-location-pulse rounded-full border-2 border-white bg-blue-500" />
              </AdvancedMarker>
            )}

            {/* 会場ピン（タップでその会場ページへ） */}
            {VENUES.map((v) => (
              <AdvancedMarker
                key={v.slug}
                position={v.center}
                title={v.name}
                onClick={() => onSelect(v.slug)}
              >
                <div className="relative flex animate-pin-pop flex-col items-center transition-all duration-300 ease-spring">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-yosakoi bg-white text-xl shadow-md"
                    aria-hidden
                  >
                    💃
                  </span>
                  {v.hasMedal && (
                    <span className="absolute -right-2 -top-1 text-sm" aria-hidden>
                      🥇
                    </span>
                  )}
                  <span className="pointer-events-none mt-0.5 max-w-[9rem] truncate whitespace-nowrap rounded-full border border-gray-200 bg-white/95 px-1.5 py-[1px] text-[10px] font-bold leading-tight text-gray-800 shadow-sm">
                    {v.name}
                  </span>
                </div>
              </AdvancedMarker>
            ))}
          </Map>
        </div>
      </GoogleMapProvider>
    </section>
  );
}
