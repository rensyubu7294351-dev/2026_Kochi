import { describe, it, expect } from "vitest";
import {
  MAIN_NAV,
  APP_ROUTES,
  DEFAULT_ROUTE,
  isKnownRoute,
} from "@/config/navigation";

describe("MAIN_NAV（下部タブの定義）", () => {
  it("アプリ内の全ページがタブに含まれる", () => {
    expect(APP_ROUTES).toEqual([
      "/venues",
      "/tourism/sento",
      "/tourism/laundry",
      "/tourism/taxi",
    ]);
  });

  it("トップページ廃止で失われるライフハックの導線がタブに残っている", () => {
    const external = MAIN_NAV.filter((i) => i.external);
    expect(external).toHaveLength(1);
    expect(external[0].href).toMatch(/^https?:\/\//);
  });

  it("hrefが重複していない", () => {
    const hrefs = MAIN_NAV.map((i) => i.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("全項目にラベルと絵文字がある", () => {
    for (const item of MAIN_NAV) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.emoji.length).toBeGreaterThan(0);
    }
  });

  it("アプリ内リンクは絶対パスで書かれている", () => {
    for (const route of APP_ROUTES) {
      expect(route.startsWith("/")).toBe(true);
    }
  });
});

describe("isKnownRoute（転送先の検証）", () => {
  it.each(APP_ROUTES)("既知ページと判定する: %s", (route) => {
    expect(isKnownRoute(route)).toBe(true);
  });

  it("クエリ付きURLも既知と判定する", () => {
    expect(isKnownRoute("/venues?v=kamimachi&openExternalBrowser=1")).toBe(true);
  });

  it("ハッシュ付きURLも既知と判定する", () => {
    expect(isKnownRoute("/tourism/sento#list")).toBe(true);
  });

  it("末尾スラッシュ付きURLも既知と判定する", () => {
    expect(isKnownRoute("/tourism/taxi/")).toBe(true);
  });

  it("トップページ自身は転送先として認めない（無限ループ防止）", () => {
    expect(isKnownRoute("/")).toBe(false);
  });

  it("存在しないページは認めない", () => {
    expect(isKnownRoute("/nope")).toBe(false);
    expect(isKnownRoute("/venues/extra")).toBe(false);
  });

  it("管理画面は復元対象にしない", () => {
    expect(isKnownRoute("/admin")).toBe(false);
  });

  it("外部URL・相対パスは認めない（オープンリダイレクト防止）", () => {
    expect(isKnownRoute("https://example.com")).toBe(false);
    expect(isKnownRoute("venues")).toBe(false);
  });

  it("null・undefined・空文字は認めない", () => {
    expect(isKnownRoute(null)).toBe(false);
    expect(isKnownRoute(undefined)).toBe(false);
    expect(isKnownRoute("")).toBe(false);
  });
});

describe("DEFAULT_ROUTE（既定の転送先）", () => {
  it("実在するページを指している", () => {
    expect(isKnownRoute(DEFAULT_ROUTE)).toBe(true);
  });

  it("演舞会場ページが既定になっている", () => {
    expect(DEFAULT_ROUTE).toBe("/venues");
  });
});
