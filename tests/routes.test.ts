import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { APP_ROUTES } from "@/config/navigation";

const SRC = path.resolve(__dirname, "../src");
const APP_DIR = path.join(SRC, "app");

/** src 配下の全ソースを再帰的に集める */
function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return sourceFiles(p);
    return /\.tsx?$/.test(e.name) ? [p] : [];
  });
}

/** app 配下の page.tsx からルート（URLパス）を復元する */
function pageRoutes(): string[] {
  return sourceFiles(APP_DIR)
    .filter((f) => path.basename(f) === "page.tsx")
    .map((f) => {
      const rel = path.relative(APP_DIR, path.dirname(f));
      return rel === "" ? "/" : `/${rel.split(path.sep).join("/")}`;
    });
}

describe("ルーティングの健全性", () => {
  it("タブに載っている全ページが実在する", () => {
    for (const route of APP_ROUTES) {
      const file = path.join(APP_DIR, route, "page.tsx");
      expect(fs.existsSync(file), `${route} のページが無い`).toBe(true);
    }
  });

  it("'/' は404にせず残してある（LINEリッチメニューの入口のため）", () => {
    expect(fs.existsSync(path.join(APP_DIR, "page.tsx"))).toBe(true);
  });

  it("ユーザー向けページはすべてタブから到達できる", () => {
    const userPages = pageRoutes().filter(
      (r) =>
        r !== "/" &&
        !r.startsWith("/admin") &&
        !r.startsWith("/api") &&
        !r.includes("["), // 動的ルート（旧URLの転送用）は除く
    );
    expect(userPages.sort()).toEqual([...APP_ROUTES].sort());
  });
});

describe("トップページ廃止後のリンク健全性", () => {
  const files = sourceFiles(SRC);

  it("廃止したトップ画面へのリンクが残っていない", () => {
    const offenders = files.filter((f) =>
      /href=["']\/["']/.test(fs.readFileSync(f, "utf8")),
    );
    expect(offenders.map((f) => path.relative(SRC, f))).toEqual([]);
  });

  it("削除した旧コンポーネントを参照していない", () => {
    const offenders = files.filter((f) =>
      /RestoreLastPage|HOME_MENU/.test(fs.readFileSync(f, "utf8")),
    );
    expect(offenders.map((f) => path.relative(SRC, f))).toEqual([]);
  });

  it("ユーザー向けページには下部タブが置かれている", () => {
    for (const route of APP_ROUTES) {
      const src = fs.readFileSync(
        path.join(APP_DIR, route, "page.tsx"),
        "utf8",
      );
      expect(src, `${route} に BottomNav が無い`).toContain("<BottomNav />");
    }
  });

  it("タブが隠れないよう本文だけをスクロールさせている", () => {
    for (const route of APP_ROUTES) {
      const src = fs.readFileSync(
        path.join(APP_DIR, route, "page.tsx"),
        "utf8",
      );
      expect(src, `${route} のレイアウト崩れ`).toContain("h-dvh");
      expect(src, `${route} のスクロール設定漏れ`).toContain("overflow-y-auto");
    }
  });
});

describe("現在地・ルート案内まわりが維持されている", () => {
  const locationPages = [
    "src/components/venues/VenueExplorer.tsx",
    "src/components/tourism/SentoMapClient.tsx",
    "src/components/tourism/LaundryMapClient.tsx",
  ];

  it.each(locationPages)("現在地の取得処理が残っている: %s", (rel) => {
    const src = fs.readFileSync(path.resolve(__dirname, "..", rel), "utf8");
    expect(src).toContain("useGeolocation");
    expect(src).toContain("geo.request()");
  });

  it.each(locationPages)("失敗時の案内が出るようになっている: %s", (rel) => {
    const src = fs.readFileSync(path.resolve(__dirname, "..", rel), "utf8");
    expect(src).toContain("geo.error && <LocationErrorNotice />");
  });

  it.each(locationPages)("ピンの詳細シートが残っている: %s", (rel) => {
    const src = fs.readFileSync(path.resolve(__dirname, "..", rel), "utf8");
    expect(src).toContain("BottomSheet");
  });

  // 演舞会場はルート描画を VenueMap 側に持つため、地図コンポーネントで確認する
  it.each([
    "src/components/venues/VenueMap.tsx",
    "src/components/tourism/SentoMapClient.tsx",
    "src/components/tourism/LaundryMapClient.tsx",
  ])("現在地からのルート描画が残っている: %s", (rel) => {
    const src = fs.readFileSync(path.resolve(__dirname, "..", rel), "utf8");
    expect(src).toContain("RouteLayer");
  });
});
