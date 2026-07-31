import Link from "next/link";
import { TOURISM_MENU } from "@/config/navigation";

export const metadata = {
  title: "高知便利情報 | 高知よさこい チームマップ",
};

/** 高知便利スポットトップ：銭湯 / コインランドリー / タクシーへのハブ */
export default function TourismPage() {
  return (
    <main className="p-4">
      <div className="mb-4">
        <Link href="/" className="text-sm text-gray-500">
          ← ホーム
        </Link>
      </div>
      <h1 className="mb-1 text-xl font-bold">高知便利スポット</h1>
      <p className="mb-4 text-sm text-gray-500">
        七福向けのサポート情報
      </p>

      <nav className="grid gap-3">
        {TOURISM_MENU.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm active:scale-[0.99]"
          >
            <span className="text-2xl" aria-hidden>
              {item.emoji}
            </span>
            <div>
              <h2 className="font-bold">{item.title}</h2>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          </Link>
        ))}
      </nav>
    </main>
  );
}
