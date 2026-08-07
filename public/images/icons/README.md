# 施設ピンアイコンの置き場

`src/config/facilities.ts` の `icon` で参照するアイコンを置きます。
`.svg` 推奨（拡大しても綺麗、色替えしやすい）。

| 施設 | ファイル名 |
| ---- | ---------- |
| 救護所 | `first-aid.svg` |
| 休憩所 | `rest-area.svg` |
| 公衆トイレ | `toilet-public.svg` |
| 仮設トイレ | `toilet-temporary.svg` |
| バス待機場所 | `bus.svg` |
| 踊り開始位置 | `dance-start.svg` |
| 踊り終了位置 | `dance-end.svg` |
| 受付 | `reception.svg` |
| ドラッグストア | `drugstore.svg` |
| コンビニ | `convenience.svg` |
| 宿 | `lodging.svg` |
| メダル | `medal.svg` |

※ 現状のマップは色付き丸マーカーで動作します。アイコン画像を用意したら
`VenueMap.tsx` のマーカー描画をアイコン参照に差し替えてください。
