import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "高知よさこい チームマップ",
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
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-sans">
        <div className="mx-auto min-h-dvh max-w-[var(--max-content-width)] bg-white shadow-sm">
          {children}
        </div>
      </body>
    </html>
  );
}
