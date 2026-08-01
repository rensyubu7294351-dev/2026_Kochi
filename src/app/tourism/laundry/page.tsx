import Link from "next/link";
import { LaundryMapClient } from "@/components/tourism/LaundryMapClient";
import { BottomNav } from "@/components/layout/BottomNav";
import { fetchLaundry } from "@/lib/tourism";

export const metadata = { title: "コインランドリー | 高知便利情報" };

// データをページに焼き込み60秒ごとに再生成（表示は一瞬・裏で最新化）
export const revalidate = 60;

export default async function LaundryPage() {
  const initialSpots = await fetchLaundry();
  return (
    <main className="pb-24">
      <BottomNav />
      <div className="p-4">
        <div className="mb-4">
          <Link href="/" className="text-sm text-gray-500">
            ← ホーム
          </Link>
        </div>
        <h1 className="mb-4 text-xl font-bold">
          高知市内 コインランドリーマップ
        </h1>
        <LaundryMapClient initialSpots={initialSpots} />
      </div>
    </main>
  );
}
