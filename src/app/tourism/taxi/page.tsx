import Link from "next/link";
import { TaxiListClient } from "@/components/tourism/TaxiListClient";
import { SectionTabs } from "@/components/layout/SectionTabs";

export const metadata = { title: "タクシー会社一覧 | 高知観光編" };

export default function TaxiPage() {
  return (
    <main>
      <SectionTabs />
      <div className="p-4">
        <div className="mb-4">
          <Link href="/tourism" className="text-sm text-gray-500">
            ← 観光編
          </Link>
        </div>
        <h1 className="mb-4 text-xl font-bold">
          高知市内で呼べるタクシー会社
        </h1>
        <TaxiListClient />
      </div>
    </main>
  );
}
