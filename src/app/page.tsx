import Link from "next/link";
import { HOME_MENU } from "@/config/navigation";
import { InAppBrowserNotice } from "@/components/layout/InAppBrowserNotice";

/** ホーム画面：各ページへのハブ */
export default function HomePage() {
  return (
    <main className="p-5">
      <header className="mb-6 animate-fade-in-up text-center">
        <h1 className="text-2xl font-bold text-yosakoi">
          七福高知アプリ
        </h1>
      </header>

      {/* LINE等のアプリ内ブラウザで開かれた場合の外部ブラウザ誘導 */}
      <div className="mb-4">
        <InAppBrowserNotice />
      </div>

      <nav className="grid gap-4">
        {HOME_MENU.map((item, i) => {
          const card = (
            <div
              className="tap flex animate-fade-in-up items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md"
              style={{ animationDelay: `${i * 60}ms` }}
            >
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
