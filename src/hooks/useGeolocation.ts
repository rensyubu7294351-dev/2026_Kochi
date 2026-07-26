"use client";

import { useCallback, useState } from "react";
import type { LatLng } from "@/types";

type GeolocationState = {
  position: LatLng | null;
  error: string | null;
  loading: boolean;
};

/**
 * ブラウザの現在地を取得するフック。
 * ルート検索ボタン押下時に呼び出して origin として使う想定。
 * （HTTPS または localhost でのみ動作する点に注意）
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: false,
  });

  const request = useCallback((): Promise<LatLng | null> => {
    return new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setState({
          position: null,
          error: "この端末では位置情報を取得できません",
          loading: false,
        });
        resolve(null);
        return;
      }
      setState((s) => ({ ...s, loading: true, error: null }));
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setState({ position, error: null, loading: false });
          resolve(position);
        },
        (err) => {
          setState({
            position: null,
            error: err.message || "位置情報の取得に失敗しました",
            loading: false,
          });
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  }, []);

  return { ...state, request };
}
