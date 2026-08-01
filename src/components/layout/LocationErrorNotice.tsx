"use client";

/** 手順1つ分（番号を丸バッジで表示し、1行を短く保つ） */
function Step({ no, children }: { no: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
        {no}
      </span>
      <span className="flex-1">{children}</span>
    </li>
  );
}

/**
 * 現在地の取得に失敗したときだけ表示する対処案内。
 * 原因のほとんどは端末側で位置情報が拒否されていること。
 * 読み飛ばされないよう、手順は3つ・1行は短くまとめる。
 */
export function LocationErrorNotice() {
  return (
    <div className="mt-2 rounded-lg border-2 border-red-400 bg-red-50 px-3 py-2.5">
      <p className="text-sm font-bold text-red-700">
        ⚠️ 現在地を取得できませんでした
      </p>
      <p className="mt-0.5 text-[11px] font-medium text-red-600">
        端末の設定をご確認ください（Safari・Chrome 共通）
      </p>

      <ol className="mt-2 space-y-2 text-xs leading-relaxed text-gray-800">
        <Step no={1}>
          <b>設定</b> → プライバシーとセキュリティ
          <br />→ <b>位置情報サービス</b> をオン
        </Step>
        <Step no={2}>
          同じ画面の <b>「Safariのウェブサイト」</b>
          <br />
          （Chromeは <b>「Chrome」</b>）をタップ
          <br />→ <b>「次回または共有時に確認」</b>
          <br />→ <b>「正確な位置情報」</b> もオン
        </Step>
        <Step no={3}>
          下のボタンで再読み込み → ピンをタップ
          <br />→ 確認画面で <b>「許可」</b>
        </Step>
      </ol>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="tap mt-2.5 w-full rounded-lg bg-red-500 py-2 text-sm font-bold text-white"
      >
        🔄 ページを再読み込み
      </button>
    </div>
  );
}
