import Link from "next/link";
import { SpotListClient } from "@/components/tourism/SpotListClient";
import { SectionTabs } from "@/components/layout/SectionTabs";

export const metadata = { title: "銭湯マップ | 高知観光編" };

export default function SentoPage() {
  return (
    <main>
      <SectionTabs />
      <div className="p-4">
        <div className="mb-4">
          <Link href="/tourism" className="text-sm text-gray-500">
            ← 観光編
          </Link>
        </div>
        <h1 className="mb-4 text-xl font-bold">銭湯マップ（営業時間付き）</h1>
        <SpotListClient kind="sento" />
      </div>
    </main>
  );
}
