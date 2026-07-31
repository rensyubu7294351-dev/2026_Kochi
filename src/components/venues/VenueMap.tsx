"use client";

import { useEffect, useState } from "react";
import {
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import type { Facility, FacilityType, LatLng, Venue } from "@/types";
import { FACILITY_META } from "@/config/facilities";
import { DEFAULT_VENUE_ZOOM, GOOGLE_MAPS_MAP_ID } from "@/lib/constants";
import { GoogleMapProvider } from "@/components/map/GoogleMapProvider";

export type RouteSummary = { distance: string; duration: string };

/** 地図の中心・ズームを制御する内部コントローラ。 */
function MapController({
  venue,
  facilities,
  highlightType,
  currentLocation,
  focusPosition,
  fitWithCurrent,
  fitToken,
  routeActive,
  courseFrom,
  courseTo,
}: {
  venue: Venue;
  facilities: Facility[];
  highlightType: FacilityType | null;
  currentLocation?: LatLng | null;
  focusPosition?: LatLng | null;
  fitWithCurrent: boolean;
  fitToken: number;
  routeActive: boolean;
  courseFrom?: LatLng | null;
  courseTo?: LatLng | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (routeActive) return; // 現在地→ピンのルートに任せる

    if (focusPosition) {
      map.panTo(focusPosition);
      map.setZoom(19);
      return;
    }

    // 演舞コース表示中は開始〜終了に合わせる
    let pts: LatLng[];
    if (courseFrom && courseTo) {
      pts = [courseFrom, courseTo];
    } else {
      const source = highlightType
        ? facilities.filter((f) => f.type === highlightType)
        : facilities;
      pts = source.map((f) => f.position);
      if (fitWithCurrent && currentLocation) pts.push(currentLocation);
    }

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

    if (north - south < 0.0008 && east - west < 0.0008) {
      map.panTo(pts[0]);
      map.setZoom(18);
      return;
    }
    map.fitBounds({ north, south, east, west }, 64);
  }, [
    map,
    venue,
    facilities,
    highlightType,
    currentLocation,
    focusPosition,
    fitWithCurrent,
    fitToken,
    routeActive,
    courseFrom,
    courseTo,
  ]);
  return null;
}

/** 2地点間の徒歩ルートを地図上に描画（Directions API）。色・自動移動は指定可能。 */
function RouteLayer({
  origin,
  destination,
  color,
  preserveViewport,
  onSummary,
  onError,
}: {
  origin: LatLng;
  destination: LatLng;
  color: string;
  preserveViewport?: boolean;
  onSummary: (s: RouteSummary | null) => void;
  onError: () => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const [renderer, setRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!routesLib || !map) return;
    const r = new routesLib.DirectionsRenderer({
      map,
      suppressMarkers: true,
      preserveViewport: preserveViewport ?? false,
      polylineOptions: {
        strokeColor: color,
        strokeWeight: 6,
        strokeOpacity: 0.85,
      },
    });
    setRenderer(r);
    return () => r.setMap(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routesLib, map]);

  useEffect(() => {
    if (!routesLib || !renderer) return;
    const svc = new routesLib.DirectionsService();
    let cancelled = false;
    svc
      .route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.WALKING,
      })
      .then((res) => {
        if (cancelled) return;
        renderer.setDirections(res);
        const leg = res.routes[0]?.legs[0];
        onSummary(
          leg
            ? {
                distance: leg.distance?.text ?? "",
                duration: leg.duration?.text ?? "",
              }
            : null,
        );
      })
      .catch(() => {
        if (!cancelled) onError();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routesLib, renderer, origin.lat, origin.lng, destination.lat, destination.lng]);

  return null;
}

/**
 * 個別会場のマップ。
 * - 施設ピン（自作アイコン＋ラベル）を表示、highlightType を強調
 * - 現在地→タップしたピンの徒歩ルート（青）
 * - 演舞コース：踊り開始位置→終了位置の徒歩ルート（赤）
 */
export function VenueMap({
  venue,
  facilities,
  highlightType,
  currentLocation,
  focusPosition,
  fitWithCurrent,
  fitToken,
  routeDest,
  courseFrom,
  courseTo,
  onPinClick,
  onRouteInfo,
  onRouteError,
  onCourseInfo,
  onCourseError,
}: {
  venue: Venue;
  facilities: Facility[];
  highlightType: FacilityType | null;
  currentLocation?: LatLng | null;
  focusPosition?: LatLng | null;
  fitWithCurrent: boolean;
  fitToken: number;
  routeDest?: Facility | null;
  courseFrom?: LatLng | null;
  courseTo?: LatLng | null;
  onPinClick: (f: Facility) => void;
  onRouteInfo: (s: RouteSummary | null) => void;
  onRouteError: () => void;
  onCourseInfo: (s: RouteSummary | null) => void;
  onCourseError: () => void;
}) {
  const routeActive = Boolean(currentLocation && routeDest);

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
            clickableIcons={false}
          >
            <MapController
              venue={venue}
              facilities={facilities}
              highlightType={highlightType}
              currentLocation={currentLocation}
              focusPosition={focusPosition}
              fitWithCurrent={fitWithCurrent}
              fitToken={fitToken}
              routeActive={routeActive}
              courseFrom={courseFrom}
              courseTo={courseTo}
            />

            {/* 演舞コース（踊り開始→終了・赤） */}
            {courseFrom && courseTo && (
              <RouteLayer
                origin={courseFrom}
                destination={courseTo}
                color="#e4002b"
                preserveViewport
                onSummary={onCourseInfo}
                onError={onCourseError}
              />
            )}

            {/* 現在地→ピンの徒歩ルート（青） */}
            {currentLocation && routeDest && (
              <RouteLayer
                origin={currentLocation}
                destination={routeDest.position}
                color="#2563eb"
                onSummary={onRouteInfo}
                onError={onRouteError}
              />
            )}

            {/* 現在地（青ドット） */}
            {currentLocation && (
              <AdvancedMarker
                position={currentLocation}
                title="現在地"
                zIndex={30}
              >
                <span className="block h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.3)]" />
              </AdvancedMarker>
            )}

            {/* 施設ピン */}
            {facilities.map((f) => {
              const meta = FACILITY_META[f.type];
              const isDest = routeDest?.id === f.id;
              const dimmed = highlightType != null && f.type !== highlightType;
              const emphasized =
                highlightType != null && f.type === highlightType;
              return (
                <AdvancedMarker
                  key={f.id}
                  position={f.position}
                  title={f.label ?? meta.label}
                  onClick={() => onPinClick(f)}
                  zIndex={isDest ? 25 : emphasized ? 20 : undefined}
                >
                  <div
                    className={
                      "relative transition " +
                      (dimmed ? "opacity-30 " : "") +
                      (emphasized ? "scale-125 " : "")
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/icons/${meta.icon}`}
                      alt={meta.label}
                      width={44}
                      height={56}
                      className="drop-shadow"
                      style={
                        isDest
                          ? { filter: "drop-shadow(0 0 6px #2563eb)" }
                          : emphasized
                            ? { filter: "drop-shadow(0 0 6px #e4002b)" }
                            : undefined
                      }
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
    </section>
  );
}
