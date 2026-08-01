import Link from "next/link";
import { TaxiListClient } from "@/components/tourism/TaxiListClient";
import { BottomNav } from "@/components/layout/BottomNav";
import { fetchTaxi } from "@/lib/tourism";

export const metadata = { title: "タクシー会社一覧 | 高知便利情報" };

// データをページに焼き込み60秒ごとに再生成（表示は一瞬・裏で最新化）
export const revalidate = 60;

export default async function TaxiPage() {
  const initialCompanies = await fetchTaxi();
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
          タクシー会社一覧（24時間受付）
        </h1>
        <TaxiListClient initialCompanies={initialCompanies} />
      </div>
    </main>
  );
}
