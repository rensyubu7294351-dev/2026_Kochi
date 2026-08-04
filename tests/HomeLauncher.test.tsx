import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeLauncher } from "@/components/layout/HomeLauncher";
import {
  AUDIENCES,
  defaultRouteFor,
  lastPathKey,
} from "@/config/navigation";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

beforeEach(() => {
  replace.mockClear();
  vi.restoreAllMocks();
});

describe("HomeLauncher（トップの転送）", () => {
  it.each(AUDIENCES)("%s: 前回開いていたページへ転送する", (audience) => {
    const last = `${audience === "supporter" ? "/supporter" : ""}/tourism/sento`;
    localStorage.setItem(lastPathKey(audience), last);
    render(<HomeLauncher audience={audience} />);
    expect(replace).toHaveBeenCalledWith(last);
  });

  it("会場タブなどのクエリを保ったまま転送する", () => {
    localStorage.setItem(lastPathKey("user"), "/venues?v=kamimachi");
    render(<HomeLauncher audience="user" />);
    expect(replace).toHaveBeenCalledWith("/venues?v=kamimachi");
  });

  it.each(AUDIENCES)(
    "%s: 初回アクセス（記録なし）は演舞会場ページへ転送する",
    (audience) => {
      render(<HomeLauncher audience={audience} />);
      expect(replace).toHaveBeenCalledWith(defaultRouteFor(audience));
    },
  );

  it("別系統の記録があっても引きずられない", () => {
    localStorage.setItem(lastPathKey("supporter"), "/supporter/mer");
    render(<HomeLauncher audience="user" />);
    expect(replace).toHaveBeenCalledWith(defaultRouteFor("user"));
  });

  it("別系統のページが記録されていたら既定ページへ転送する", () => {
    localStorage.setItem(lastPathKey("user"), "/supporter/venues");
    render(<HomeLauncher audience="user" />);
    expect(replace).toHaveBeenCalledWith(defaultRouteFor("user"));
  });

  it("記録が古く存在しないページなら既定ページへ転送する", () => {
    localStorage.setItem(lastPathKey("user"), "/removed-page");
    render(<HomeLauncher audience="user" />);
    expect(replace).toHaveBeenCalledWith(defaultRouteFor("user"));
  });

  it("記録が自分自身でも転送しない（無限ループ防止）", () => {
    localStorage.setItem(lastPathKey("supporter"), "/supporter");
    render(<HomeLauncher audience="supporter" />);
    expect(replace).toHaveBeenCalledWith(defaultRouteFor("supporter"));
  });

  it("外部URLが記録されていても転送しない（オープンリダイレクト防止）", () => {
    localStorage.setItem(lastPathKey("user"), "https://evil.example.com");
    render(<HomeLauncher audience="user" />);
    expect(replace).toHaveBeenCalledWith(defaultRouteFor("user"));
  });

  it("ストレージが使えない環境でも既定ページへ転送する", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    render(<HomeLauncher audience="user" />);
    expect(replace).toHaveBeenCalledWith(defaultRouteFor("user"));
  });

  it("転送までの間は読み込み中を表示する", () => {
    render(<HomeLauncher audience="user" />);
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("転送は履歴を残さない（戻るでトップに戻らない）", () => {
    render(<HomeLauncher audience="user" />);
    expect(replace).toHaveBeenCalledTimes(1);
  });
});
