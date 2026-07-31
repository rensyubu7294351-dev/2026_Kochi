import Link from "next/link";
import { TaxiListClient } from "@/components/tourism/TaxiListClient";
import { SectionTabs } from "@/components/layout/SectionTabs";

export const metadata = { title: "タクシー会社一覧 | 高知便利情報" };

export default function TaxiPage() {
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
          高知市内で呼べるタクシー会社
        </h1>
        <TaxiListClient />
      </div>
    </main>
  );
}
