import { preload } from "react-dom";
import { BottomNav } from "@/components/layout/BottomNav";
import { MerGallery } from "@/components/mer/MerGallery";
import { getMerImages } from "@/lib/merImages";

export const metadata = { title: "MER | 高知便利情報" };

// 画像はビルド時に固定。データ取得が無いので表示は一瞬
export const dynamic = "force-static";

export default function MerPage() {
  const images = getMerImages();

  // 1枚目だけ先読みして、開いた瞬間に見えるようにする
  if (images[0]) preload(images[0].src, { as: "image", fetchPriority: "high" });

  return (
    // ページ全体はスクロールさせず、本文だけをスクロール（タブバー完全固定）
    <main className="flex h-dvh flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="animate-fade-in-up p-4">
          <h1 className="mb-4 text-xl font-bold">🏥 MER</h1>
          <MerGallery images={images} />
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
