import {
  defaultRouteFor,
  lastPathKey,
  routesFor,
  type Audience,
} from "@/config/navigation";

/**
 * "/" と "/supporter" の入口。
 * トップ画面は廃止したが、LINEのリッチメニュー等がここを入口にしている
 * ため 404 にはせず、実ページへ転送する。
 * 転送先は「前回最後に開いていたページ」、無ければ演舞会場ページ。
 *
 * 転送は React の描画を待たず、HTMLを読み込んだその場で動く下の
 * インラインスクリプトで行い、実際のページ遷移（location.replace）で移動する。
 *
 * useEffect + router.replace だと、転送までに
 *   (1) クライアントJSの読み込みと hydration の完了
 *   (2) 転送先ページのデータ（RSCペイロード）の取得
 * の両方を待つ必要がある。回線が遅い・LINEの内蔵ブラウザが外部ブラウザへ
 * 引き渡す際に裏に回る、などで(1)(2)のどちらかが止まると転送は再試行されず、
 * 「読み込み中」の画面から進めなくなる（自分で再読み込みするまで使えない）。
 * インラインスクリプトならJSの読み込みもデータ取得も待たないため、この
 * 行き止まりが起きない。
 */
export function HomeLauncher({ audience }: { audience: Audience }) {
  const fallback = defaultRouteFor(audience);

  // 保存されたパスは念のためその系統の既知ページか検証してから使う
  // （古い記録での404や、外部URLによる意図しない転送を防ぐ）。
  const redirect = `(function(){
  var to=${JSON.stringify(fallback)}+(location.search||"");
  try{
    var last=localStorage.getItem(${JSON.stringify(lastPathKey(audience))});
    if(last&&last.charAt(0)==="/"&&${JSON.stringify(routesFor(audience))}.indexOf(last.split(/[?#]/)[0].replace(/\\/+$/,""))>=0)to=last;
  }catch(e){}
  location.replace(to);
})();`;

  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-4 p-6">
      <script dangerouslySetInnerHTML={{ __html: redirect }} />
      {/* JSが無効な環境でも自動で開けるように。React に <meta> を
          <head> へ持ち上げられないよう、生のHTMLとして書き出す。 */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<meta http-equiv="refresh" content="0;url=${fallback}">`,
        }}
      />
      <p className="text-sm text-gray-400">読み込み中...</p>
      {/* 自動転送が効かなかった時の逃げ道。ここが行き止まりにならないよう、
          必ず手で進める導線を残す。転送と同じ「実際のページ遷移」で開きたい
          ので、Link（クライアント側遷移）ではなく素の <a> を使う。 */}
      <a
        href={fallback}
        className="tap rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-yosakoi"
      >
        演舞会場マップを開く
      </a>
    </main>
  );
}
