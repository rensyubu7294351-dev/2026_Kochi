import Link from "next/link";
import { MapPageClient } from "@/components/tourism/MapPageClient";
import { SectionTabs } from "@/components/layout/SectionTabs";

export const metadata = { title: "コインランドリー | 高知便利情報" };

export default function LaundryPage() {
  return (
    <main>
      <SectionTabs />
      <div className="p-4">
        <div className="mb-4">
          <Link href="/" className="text-sm text-gray-500">
            ← ホーム
          </Link>
        </div>
        <h1 className="mb-4 text-xl font-bold">
          高知市内 コインランドリーマップ
        </h1>
        <MapPageClient kind="laundry" />
      </div>
    </main>
  );
}
