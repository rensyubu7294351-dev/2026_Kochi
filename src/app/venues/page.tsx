import { Suspense } from "react";
import { VenueExplorer } from "@/components/venues/VenueExplorer";
import { BottomNav } from "@/components/layout/BottomNav";
import { fetchFacilitiesByVenue } from "@/lib/facilities";

export const metadata = {
  title: "演舞会場マップ | 高知よさこい チームマップ",
};

// 施設ピンをページに焼き込み60秒ごとに再生成（表示は一瞬・裏で最新化）。
// searchParams をサーバーで読むと動的レンダリングになりプリフェッチが
// 効かなくなるため、?v=slug はクライアント（useSearchParams）で読む。
export const revalidate = 60;

/**
 * 演舞会場マップ（全14会場を1ページに集約）。
 * パンくず → タブ → 選択中会場のGoogleマップ、の順で表示する。
 * ?v=slug で初期表示する会場を指定できる（共有リンク・旧URLからの遷移用）。
 */
export default async function VenuesPage() {
  const initialFacilities = await fetchFacilitiesByVenue();
  return (
    // ページ全体はスクロールさせず、本文だけをスクロール（タブバー完全固定）
    <main className="flex h-dvh flex-col">
      <div className="flex-1 overflow-y-auto pb-8">
        <Suspense>
          <VenueExplorer initialFacilities={initialFacilities} />
        </Suspense>
      </div>
      <BottomNav />
    </main>
  );
}
