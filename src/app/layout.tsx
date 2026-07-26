import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "七福高知マップ（デモ版）",
  description:
    "高知よさこい祭りの演舞会場マップと観光情報。自チーム向けの非公式マップアプリ。",
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
