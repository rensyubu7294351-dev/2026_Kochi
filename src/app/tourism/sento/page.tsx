import Link from "next/link";
import { SentoMapClient } from "@/components/tourism/SentoMapClient";
import { BottomNav } from "@/components/layout/BottomNav";
import { fetchSento } from "@/lib/tourism";

export const metadata = { title: "銭湯マップ | 高知便利情報" };

// データをページに焼き込み60秒ごとに再生成（表示は一瞬・裏で最新化）
export const revalidate = 60;

export default async function SentoPage() {
  const initialSpots = await fetchSento();
  return (
    // ページ全体はスクロールさせず、本文だけをスクロール（タブバー完全固定）
    <main className="flex h-dvh flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="animate-fade-in-up p-4">
          <div className="mb-4">
            <Link href="/" className="text-sm text-gray-500">
              ← ホーム
            </Link>
          </div>
          <h1 className="mb-4 text-xl font-bold">高知市内 銭湯マップ</h1>
          <SentoMapClient initialSpots={initialSpots} />
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
