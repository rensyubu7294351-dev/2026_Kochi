"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { GOOGLE_MAPS_API_KEY } from "@/lib/constants";

/**
 * Google Maps JavaScript API のプロバイダ。
 * 地図を使うページ／コンポーネントをこれで囲う。
 * APIキー未設定時は子要素に案内を出す（開発中でも画面が壊れないように）。
 */
export function GoogleMapProvider({ children }: { children: React.ReactNode }) {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex aspect-square items-center justify-center bg-gray-100 p-6 text-center text-sm text-gray-500">
        地図を表示するには
        <br />
        <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>
        <br />
        を .env.local に設定してください。
      </div>
    );
  }
  return <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>{children}</APIProvider>;
}
