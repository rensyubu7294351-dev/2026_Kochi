import type { MerImage } from "@/lib/merImages";

/**
 * MERの画像一覧。
 * 端末に保存してもらう用途のため、原寸の画像をそのまま配信する
 * （Next.jsの最適化を通さない）。保存は画像の長押しで行う。
 * 最初の1枚だけ即時読み込み、残りは遅延読み込みにする。
 */
export function MerGallery({ images }: { images: MerImage[] }) {
  if (images.length === 0) {
    return (
      <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-400">
        画像は準備中です。
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-yosakoi/30 bg-yosakoi/5 px-3 py-2 text-sm font-medium text-yosakoi">
        📥 画像を長押しして
        <br />
        「写真に追加」で端末に保存できます
      </p>

      <ul>
        {images.map((img, i) => (
          <li
            key={img.src}
            // 2枚目以降は太い境界線で区切り、画像の切れ目を分かりやすくする
            className={i > 0 ? "mt-6 border-t-8 border-gray-200 pt-6" : ""}
          >
            <h2 className="mb-1.5 flex items-center gap-2 text-sm font-bold text-gray-700">
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-700 px-1.5 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              {img.title || `${i + 1}枚目 / 全${images.length}枚`}
            </h2>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {/* 保存用の原寸画像。next/image を通すと保存時に最適化後の
                  ファイルになるため、あえて素の img で配信する */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.title || "MERの案内画像"}
                width={img.width}
                height={img.height}
                className="block h-auto w-full"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding="async"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
