import Link from "next/link";
import { SentoMapClient } from "@/components/tourism/SentoMapClient";
import { SectionTabs } from "@/components/layout/SectionTabs";

export const metadata = { title: "銭湯マップ | 高知便利情報" };

export default function SentoPage() {
  return (
    <main>
      <SectionTabs />
      <div className="p-4">
        <div className="mb-4">
          <Link href="/" className="text-sm text-gray-500">
            ← ホーム
          </Link>
        </div>
        <h1 className="mb-4 text-xl font-bold">高知市内 銭湯マップ</h1>
        <SentoMapClient />
      </div>
    </main>
  );
}
