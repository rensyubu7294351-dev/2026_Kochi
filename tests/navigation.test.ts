import { describe, it, expect } from "vitest";
import {
  AUDIENCES,
  AUDIENCE_LABEL,
  AUDIENCE_PREFIX,
  audienceFromPath,
  defaultRouteFor,
  isKnownRoute,
  lastPathKey,
  navFor,
  routesFor,
  type Audience,
} from "@/config/navigation";

describe("系統（ユーザー用 / サポーター用）", () => {
  it("2系統が定義されている", () => {
    expect(AUDIENCES).toEqual(["user", "supporter"]);
  });

  it("サポーター用だけURLに接頭辞が付く", () => {
    expect(AUDIENCE_PREFIX.user).toBe("");
    expect(AUDIENCE_PREFIX.supporter).toBe("/supporter");
  });

  it("管理画面用の表示名がある", () => {
    expect(AUDIENCE_LABEL.user).toBe("ユーザー用");
    expect(AUDIENCE_LABEL.supporter).toBe("サポーター用");
  });
});

describe("navFor（下部タブの定義）", () => {
  it.each(AUDIENCES)("%s: 5ページ分のタブが並ぶ", (audience) => {
    expect(navFor(audience)).toHaveLength(5);
  });

  it("ユーザー用は接頭辞なしのURL", () => {
    expect(routesFor("user")).toEqual([
      "/venues",
      "/tourism/sento",
      "/tourism/laundry",
      "/tourism/taxi",
      "/mer",
    ]);
  });

  it("サポーター用は /supporter 配下の同じ構成", () => {
    expect(routesFor("supporter")).toEqual([
      "/supporter/venues",
      "/supporter/tourism/sento",
      "/supporter/tourism/laundry",
      "/supporter/tourism/taxi",
      "/supporter/mer",
    ]);
  });

  it("2系統でページ構成（ラベル・並び順）が完全に一致する", () => {
    expect(navFor("supporter").map((i) => [i.label, i.emoji])).toEqual(
      navFor("user").map((i) => [i.label, i.emoji]),
    );
  });

  it.each(AUDIENCES)("%s: hrefが重複していない", (audience) => {
    const hrefs = routesFor(audience);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("2系統でURLが1つも重ならない", () => {
    const overlap = routesFor("user").filter((r) =>
      routesFor("supporter").includes(r),
    );
    expect(overlap).toEqual([]);
  });

  it.each(AUDIENCES)("%s: 全項目にラベルと絵文字がある", (audience) => {
    for (const item of navFor(audience)) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.emoji.length).toBeGreaterThan(0);
    }
  });
});

describe("audienceFromPath（URLから系統を判定）", () => {
  it.each(["/", "/venues", "/tourism/sento", "/mer", "/admin"])(
    "ユーザー用と判定する: %s",
    (path) => {
      expect(audienceFromPath(path)).toBe("user");
    },
  );

  it.each(["/supporter", "/supporter/venues", "/supporter/tourism/taxi"])(
    "サポーター用と判定する: %s",
    (path) => {
      expect(audienceFromPath(path)).toBe("supporter");
    },
  );

  it("似た名前のパスをサポーター用と誤判定しない", () => {
    expect(audienceFromPath("/supporters")).toBe("user");
    expect(audienceFromPath("/venues/supporter")).toBe("user");
  });
});

describe("isKnownRoute（転送先の検証）", () => {
  const cases: [Audience, string][] = AUDIENCES.flatMap((a) =>
    routesFor(a).map((r) => [a, r] as [Audience, string]),
  );

  it.each(cases)("%s の既知ページと判定する: %s", (audience, route) => {
    expect(isKnownRoute(route, audience)).toBe(true);
  });

  it("別系統のページは既知と判定しない", () => {
    expect(isKnownRoute("/supporter/venues", "user")).toBe(false);
    expect(isKnownRoute("/venues", "supporter")).toBe(false);
  });

  it("クエリ・ハッシュ・末尾スラッシュ付きも既知と判定する", () => {
    expect(isKnownRoute("/venues?v=kamimachi", "user")).toBe(true);
    expect(isKnownRoute("/supporter/mer#top", "supporter")).toBe(true);
    expect(isKnownRoute("/supporter/tourism/taxi/", "supporter")).toBe(true);
  });

  it("トップページ自身は転送先として認めない（無限ループ防止）", () => {
    expect(isKnownRoute("/", "user")).toBe(false);
    expect(isKnownRoute("/supporter", "supporter")).toBe(false);
  });

  it("存在しないページ・管理画面は認めない", () => {
    expect(isKnownRoute("/nope", "user")).toBe(false);
    expect(isKnownRoute("/admin", "user")).toBe(false);
  });

  it("外部URL・相対パスは認めない（オープンリダイレクト防止）", () => {
    expect(isKnownRoute("https://example.com", "user")).toBe(false);
    expect(isKnownRoute("venues", "user")).toBe(false);
  });

  it("null・undefined・空文字は認めない", () => {
    expect(isKnownRoute(null, "user")).toBe(false);
    expect(isKnownRoute(undefined, "user")).toBe(false);
    expect(isKnownRoute("", "user")).toBe(false);
  });
});

describe("defaultRouteFor / lastPathKey", () => {
  it.each(AUDIENCES)("%s: 既定の転送先が実在するページ", (audience) => {
    expect(isKnownRoute(defaultRouteFor(audience), audience)).toBe(true);
  });

  it("既定はどちらも演舞会場ページ", () => {
    expect(defaultRouteFor("user")).toBe("/venues");
    expect(defaultRouteFor("supporter")).toBe("/supporter/venues");
  });

  it("最後に開いたページの記録先が系統ごとに分かれている", () => {
    expect(lastPathKey("user")).not.toBe(lastPathKey("supporter"));
  });
});
