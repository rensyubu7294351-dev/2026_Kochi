import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeLauncher } from "@/components/layout/HomeLauncher";
import {
  AUDIENCES,
  defaultRouteFor,
  lastPathKey,
  type Audience,
} from "@/config/navigation";

/**
 * 転送は React の描画を待たずHTMLの読み込み中に動くインラインスクリプトが行う。
 * そのスクリプトを取り出し、location / localStorage を差し替えて実行することで
 * 「どこへ転送するか」を確かめる。
 */
function redirectTargetOf(
  audience: Audience,
  options: { search?: string; storage?: Pick<Storage, "getItem"> } = {},
) {
  const { container } = render(<HomeLauncher audience={audience} />);
  const code = container.querySelector("script")?.innerHTML ?? "";
  expect(code, "転送スクリプトが埋め込まれていない").not.toBe("");

  let target: string | undefined;
  const location = {
    search: options.search ?? "",
    replace: (to: string) => {
      target = to;
    },
  };
  // スクリプト内の location / localStorage を引数で差し替えて実行する
  new Function("location", "localStorage", code)(
    location,
    options.storage ?? window.localStorage,
  );
  return target;
}

beforeEach(() => {
  localStorage.clear();
});

describe("HomeLauncher（トップの転送）", () => {
  it.each(AUDIENCES)("%s: 前回開いていたページへ転送する", (audience) => {
    const last = `${audience === "supporter" ? "/supporter" : ""}/tourism/sento`;
    localStorage.setItem(lastPathKey(audience), last);
    expect(redirectTargetOf(audience)).toBe(last);
  });

  it("会場タブなどのクエリを保ったまま転送する", () => {
    localStorage.setItem(lastPathKey("user"), "/venues?v=kamimachi");
    expect(redirectTargetOf("user")).toBe("/venues?v=kamimachi");
  });

  it.each(AUDIENCES)(
    "%s: 初回アクセス（記録なし）は演舞会場ページへ転送する",
    (audience) => {
      expect(redirectTargetOf(audience)).toBe(defaultRouteFor(audience));
    },
  );

  it("既定ページへ転送する時は今のクエリを引き継ぐ（LINE対策の印を落とさない）", () => {
    expect(redirectTargetOf("user", { search: "?openExternalBrowser=1" })).toBe(
      "/venues?openExternalBrowser=1",
    );
  });

  it("別系統の記録があっても引きずられない", () => {
    localStorage.setItem(lastPathKey("supporter"), "/supporter/mer");
    expect(redirectTargetOf("user")).toBe(defaultRouteFor("user"));
  });

  it("別系統のページが記録されていたら既定ページへ転送する", () => {
    localStorage.setItem(lastPathKey("user"), "/supporter/venues");
    expect(redirectTargetOf("user")).toBe(defaultRouteFor("user"));
  });

  it("記録が古く存在しないページなら既定ページへ転送する", () => {
    localStorage.setItem(lastPathKey("user"), "/removed-page");
    expect(redirectTargetOf("user")).toBe(defaultRouteFor("user"));
  });

  it("記録が自分自身でも転送しない（無限ループ防止）", () => {
    localStorage.setItem(lastPathKey("supporter"), "/supporter");
    expect(redirectTargetOf("supporter")).toBe(defaultRouteFor("supporter"));
  });

  it("外部URLが記録されていても転送しない（オープンリダイレクト防止）", () => {
    localStorage.setItem(lastPathKey("user"), "https://evil.example.com");
    expect(redirectTargetOf("user")).toBe(defaultRouteFor("user"));
  });

  it("ストレージが使えない環境でも既定ページへ転送する", () => {
    const storage = {
      getItem: () => {
        throw new Error("storage blocked");
      },
    };
    expect(redirectTargetOf("user", { storage })).toBe(defaultRouteFor("user"));
  });

  it.each(AUDIENCES)(
    "%s: 転送は履歴を残さない（戻るでトップに戻らない）",
    (audience) => {
      const { container } = render(<HomeLauncher audience={audience} />);
      const code = container.querySelector("script")?.innerHTML ?? "";
      expect(code).toContain("location.replace(");
      expect(code).not.toContain("location.assign(");
      expect(code).not.toContain("location.href=");
    },
  );
});

describe("転送が効かなかった時に行き止まりにならない", () => {
  it.each(AUDIENCES)(
    "%s: 自分で進める演舞会場ページへのリンクがある",
    (audience) => {
      render(<HomeLauncher audience={audience} />);
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        defaultRouteFor(audience),
      );
    },
  );

  it.each(AUDIENCES)("%s: JSが無効でも自動で転送される", (audience) => {
    const { container } = render(<HomeLauncher audience={audience} />);
    const noscript = container.querySelector("noscript")?.innerHTML ?? "";
    expect(noscript).toContain('http-equiv="refresh"');
    expect(noscript).toContain(defaultRouteFor(audience));
  });

  it("転送までの間は読み込み中を表示する", () => {
    render(<HomeLauncher audience="user" />);
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });
});
