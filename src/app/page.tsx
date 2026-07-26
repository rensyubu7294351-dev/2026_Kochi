import Link from "next/link";
import { HOME_MENU } from "@/config/navigation";

/** ホーム画面：各ページへのハブ */
export default function HomePage() {
  return (
    <main className="p-5">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-yosakoi">
          高知よさこい チームマップ
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          自チーム向け 会場・観光ガイド
        </p>
      </header>

      <nav className="grid gap-4">
        {HOME_MENU.map((item) => {
          const card = (
            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition active:scale-[0.99] hover:shadow-md">
              <span className="text-3xl" aria-hidden>
                {item.emoji}
              </span>
              <div>
                <h2 className="font-bold">{item.title}</h2>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          );
          return item.external ? (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {card}
            </a>
          ) : (
            <Link key={item.title} href={item.href}>
              {card}
            </Link>
          );
        })}
      </nav>
    </main>
  );
}
