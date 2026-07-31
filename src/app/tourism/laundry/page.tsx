import Link from "next/link";
import { SpotListClient } from "@/components/tourism/SpotListClient";
import { SectionTabs } from "@/components/layout/SectionTabs";

export const metadata = { title: "コインランドリー | 高知便利情報" };

export default function LaundryPage() {
  return (
    <main>
      <SectionTabs />
      <div className="p-4">
        <div className="mb-4">
          <Link href="/tourism" className="text-sm text-gray-500">
            ← 高知便利情報
          </Link>
        </div>
        <h1 className="mb-4 text-xl font-bold">
          コインランドリー（営業時間付き）
        </h1>
        <SpotListClient kind="laundry" />
      </div>
    </main>
  );
}
