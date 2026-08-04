import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  AUDIENCES,
  AUDIENCE_PREFIX,
  routesFor,
  type Audience,
} from "@/config/navigation";

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
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

const read = (p: string) => fs.readFileSync(p, "utf8");
const pageFile = (route: string) => path.join(APP_DIR, route, "page.tsx");

describe("ルーティングの健全性", () => {
  const cases = AUDIENCES.flatMap((a) =>
    routesFor(a).map((r) => ({ audience: a, route: r })),
  );

  it.each(cases)("$route のページが実在する", ({ route }) => {
    expect(fs.existsSync(pageFile(route)), `${route} が無い`).toBe(true);
  });

  it.each(AUDIENCES)(
    "%s のトップは404にせず残してある（LINEリッチメニューの入口のため）",
    (audience) => {
      const top = path.join(APP_DIR, AUDIENCE_PREFIX[audience], "page.tsx");
      expect(fs.existsSync(top)).toBe(true);
    },
  );

  it("ユーザー向けページはすべてタブから到達できる", () => {
    const userPages = pageRoutes().filter(
      (r) =>
        r !== "/" &&
        r !== "/supporter" &&
        !r.startsWith("/admin") &&
        !r.startsWith("/api") &&
        !r.includes("["), // 動的ルート（旧URLの転送用）は除く
    );
    const expected = AUDIENCES.flatMap((a) => routesFor(a));
    expect(userPages.sort()).toEqual(expected.sort());
  });
});

describe("2系統がクローンとして一致している", () => {
  const pagePairs = routesFor("user").map((userRoute, i) => ({
    userRoute,
    supporterRoute: routesFor("supporter")[i],
  }));

  it.each(pagePairs)(
    "$userRoute と $supporterRoute が同じ画面を使っている",
    ({ userRoute, supporterRoute }) => {
      const screenOf = (route: string) =>
        read(pageFile(route)).match(/<(\w+Screen)\s/)?.[1];
      expect(screenOf(supporterRoute)).toBe(screenOf(userRoute));
      expect(screenOf(userRoute)).toBeTruthy();
    },
  );

  it.each(pagePairs)(
    "$userRoute と $supporterRoute の違いが系統の指定だけ",
    ({ userRoute, supporterRoute }) => {
      // 系統の指定とページタイトルの注記を取り除くと完全に一致するはず
      const normalize = (src: string) =>
        src
          .replace(/audience="(user|supporter)"/g, "audience=<A>")
          .replace(/（サポーター用）/g, "");
      expect(normalize(read(pageFile(supporterRoute)))).toBe(
        normalize(read(pageFile(userRoute))),
      );
    },
  );

  it.each(pagePairs)(
    "$userRoute はユーザー用、$supporterRoute はサポーター用を指定している",
    ({ userRoute, supporterRoute }) => {
      expect(read(pageFile(userRoute))).toContain('audience="user"');
      expect(read(pageFile(supporterRoute))).toContain('audience="supporter"');
    },
  );

  it.each(AUDIENCES)("%s のトップが自分の系統へ転送する", (audience) => {
    const top = path.join(APP_DIR, AUDIENCE_PREFIX[audience], "page.tsx");
    expect(read(top)).toContain(`audience="${audience}"`);
  });
});

describe("2系統でデータが混ざらない", () => {
  it("Supabaseからの読み取りは必ず系統で絞り込んでいる", () => {
    for (const rel of ["src/lib/tourism.ts", "src/lib/facilities.ts"]) {
      const src = read(path.join(ROOT, rel));
      const queries = src.match(/select=\*[^`"]*/g) ?? [];
      expect(queries.length).toBeGreaterThan(0);
      for (const q of queries) {
        expect(q, `${rel} の絞り込み漏れ: ${q}`).toContain(
          "audience=eq.${audience}",
        );
      }
    }
  });

  it("管理画面からの保存は系統を送っている", () => {
    const editors = [
      "AdminVenueEditor",
      "AdminSentoEditor",
      "AdminLaundryEditor",
      "AdminTaxiEditor",
    ];
    for (const name of editors) {
      const src = read(path.join(SRC, "components/admin", `${name}.tsx`));
      // 保存リクエストの本文の先頭で audience を渡していること
      expect(src, `${name} が系統を送っていない`).toMatch(
        /JSON\.stringify\(\{\s*audience,/,
      );
    }
  });

  it("保存先APIが系統を受け取って保存している", () => {
    for (const rel of [
      "src/app/api/facilities/route.ts",
      "src/app/api/tourism/[kind]/route.ts",
    ]) {
      const src = read(path.join(ROOT, rel));
      expect(src).toContain("AUDIENCES.includes");
      expect(src).toContain("audience,");
    }
  });

  it("「最後に開いたページ」の記録が系統ごとに分かれている", () => {
    const src = read(path.join(SRC, "components/layout/KeepExternalBrowserParam.tsx"));
    expect(src).toContain("lastPathKey(audienceFromPath(pathname))");
  });
});

describe("トップページ廃止後のリンク健全性", () => {
  const files = sourceFiles(SRC);

  it("廃止したトップ画面へのリンクが残っていない", () => {
    const offenders = files.filter((f) => /href=["']\/["']/.test(read(f)));
    expect(offenders.map((f) => path.relative(SRC, f))).toEqual([]);
  });

  it("削除した旧コンポーネントを参照していない", () => {
    const offenders = files.filter((f) =>
      /RestoreLastPage|HOME_MENU|MAIN_NAV/.test(read(f)),
    );
    expect(offenders.map((f) => path.relative(SRC, f))).toEqual([]);
  });

  it("全ページ共通の外枠に下部タブが置かれている", () => {
    const src = read(path.join(SRC, "components/screens/screens.tsx"));
    expect(src).toContain("<BottomNav audience={audience} />");
  });

  it("タブが隠れないよう本文だけをスクロールさせている", () => {
    const src = read(path.join(SRC, "components/screens/screens.tsx"));
    expect(src).toContain("h-dvh");
    expect(src).toContain("overflow-y-auto");
  });
});

describe("現在地・ルート案内まわりが維持されている", () => {
  const locationPages = [
    "src/components/venues/VenueExplorer.tsx",
    "src/components/tourism/SentoMapClient.tsx",
    "src/components/tourism/LaundryMapClient.tsx",
  ];

  it.each(locationPages)("現在地の取得処理が残っている: %s", (rel) => {
    const src = read(path.join(ROOT, rel));
    expect(src).toContain("useGeolocation");
    expect(src).toContain("geo.request()");
  });

  it.each(locationPages)("失敗時の案内が出るようになっている: %s", (rel) => {
    const src = read(path.join(ROOT, rel));
    expect(src).toContain("geo.error && <LocationErrorNotice />");
  });

  it.each(locationPages)("ピンの詳細シートが残っている: %s", (rel) => {
    const src = read(path.join(ROOT, rel));
    expect(src).toContain("BottomSheet");
  });

  // 演舞会場はルート描画を VenueMap 側に持つため、地図コンポーネントで確認する
  it.each([
    "src/components/venues/VenueMap.tsx",
    "src/components/tourism/SentoMapClient.tsx",
    "src/components/tourism/LaundryMapClient.tsx",
  ])("現在地からのルート描画が残っている: %s", (rel) => {
    const src = read(path.join(ROOT, rel));
    expect(src).toContain("RouteLayer");
  });
});
