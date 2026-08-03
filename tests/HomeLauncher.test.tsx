import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeLauncher } from "@/components/layout/HomeLauncher";
import { DEFAULT_ROUTE } from "@/config/navigation";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

beforeEach(() => {
  replace.mockClear();
  vi.restoreAllMocks();
});

describe("HomeLauncher（'/' の転送）", () => {
  it("前回開いていたページへ転送する", () => {
    localStorage.setItem("lastPath", "/tourism/sento");
    render(<HomeLauncher />);
    expect(replace).toHaveBeenCalledWith("/tourism/sento");
  });

  it("会場タブなどのクエリを保ったまま転送する", () => {
    localStorage.setItem("lastPath", "/venues?v=kamimachi");
    render(<HomeLauncher />);
    expect(replace).toHaveBeenCalledWith("/venues?v=kamimachi");
  });

  it("初回アクセス（記録なし）は演舞会場ページへ転送する", () => {
    render(<HomeLauncher />);
    expect(replace).toHaveBeenCalledWith(DEFAULT_ROUTE);
  });

  it("記録が古く存在しないページなら既定ページへ転送する", () => {
    localStorage.setItem("lastPath", "/removed-page");
    render(<HomeLauncher />);
    expect(replace).toHaveBeenCalledWith(DEFAULT_ROUTE);
  });

  it("記録が '/' でも自分自身へ転送しない（無限ループ防止）", () => {
    localStorage.setItem("lastPath", "/");
    render(<HomeLauncher />);
    expect(replace).toHaveBeenCalledWith(DEFAULT_ROUTE);
  });

  it("外部URLが記録されていても転送しない（オープンリダイレクト防止）", () => {
    localStorage.setItem("lastPath", "https://evil.example.com");
    render(<HomeLauncher />);
    expect(replace).toHaveBeenCalledWith(DEFAULT_ROUTE);
  });

  it("ストレージが使えない環境でも既定ページへ転送する", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    render(<HomeLauncher />);
    expect(replace).toHaveBeenCalledWith(DEFAULT_ROUTE);
  });

  it("転送までの間は読み込み中を表示する", () => {
    render(<HomeLauncher />);
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("転送は履歴を残さない（戻るで '/' に戻らない）", () => {
    render(<HomeLauncher />);
    expect(replace).toHaveBeenCalledTimes(1);
  });
});
