import { VenueExplorer } from "@/components/venues/VenueExplorer";
import { SectionTabs } from "@/components/layout/SectionTabs";

export const metadata = {
  title: "演舞会場マップ | 高知よさこい チームマップ",
};

/**
 * 演舞会場マップ（全14会場を1ページに集約）。
 * パンくず → タブ → 選択中会場のGoogleマップ、の順で表示する。
 * ?v=slug で初期表示する会場を指定できる（共有リンク・旧URLからの遷移用）。
 */
export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  return (
    <main className="pb-8">
      <SectionTabs />
      <VenueExplorer initialSlug={v} />
    </main>
  );
}
