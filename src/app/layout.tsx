import type { Metadata, Viewport } from "next";
import { preconnect } from "react-dom";
import { SUPABASE_URL } from "@/lib/supabaseEnv";
import "./globals.css";

export const metadata: Metadata = {
  title: "七福高知アプリ",
  // description:
  //   "高知よさこい祭りの演舞会場マップと観光情報。自チーム向けの非公式マップアプリ。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e4002b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 地図・データ取得先へ事前接続し、初回リクエストのTLS往復を省く
  preconnect("https://maps.googleapis.com");
  preconnect("https://maps.gstatic.com");
  if (SUPABASE_URL) preconnect(SUPABASE_URL);
  return (
    <html lang="ja">
      {/* フォントは端末標準を使用（Webフォントを読み込まず高速表示） */}
      <body className="font-sans">
        <div className="mx-auto min-h-dvh max-w-[var(--max-content-width)] bg-white shadow-sm">
          {children}
        </div>
      </body>
    </html>
  );
}
