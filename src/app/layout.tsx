import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { preconnect } from "react-dom";
import { SUPABASE_URL } from "@/lib/supabaseEnv";
import { KeepExternalBrowserParam } from "@/components/layout/KeepExternalBrowserParam";
import { AppShell } from "@/components/layout/AppShell";
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
  // 下部タブバーを安全領域（iPhoneのホームバー）まで伸ばすため
  viewportFit: "cover",
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
        {/* 全URLに ?openExternalBrowser=1 を常時付与（LINE対策） */}
        <Suspense fallback={null}>
          <KeepExternalBrowserParam />
        </Suspense>
        {/* 下部タブバーを含む共通の外枠。ページを移ってもバーは作り直さない */}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
