"use client";

import { useEffect, useState } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { LatLng } from "@/types";

export type RouteSummary = { distance: string; duration: string };

/** 2地点間の徒歩ルートを地図上に描画（Directions API）。色・自動移動は指定可能。 */
export function RouteLayer({
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
