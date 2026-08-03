import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav } from "@/components/layout/BottomNav";
import { MAIN_NAV, APP_ROUTES } from "@/config/navigation";

let currentPath = "/venues";
vi.mock("next/navigation", () => ({ usePathname: () => currentPath }));
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  currentPath = "/venues";
});

describe("BottomNav（下部タブバー）", () => {
  it("全ページ分のタブが表示される", () => {
    render(<BottomNav />);
    for (const item of MAIN_NAV) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("link")).toHaveLength(MAIN_NAV.length);
  });

  it.each(APP_ROUTES)("表示中のページのタブが選択状態になる: %s", (route) => {
    currentPath = route;
    render(<BottomNav />);
    const active = screen
      .getAllByRole("link")
      .filter((el) => el.getAttribute("aria-current") === "page");
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveAttribute("href", route);
  });

  it("表示中でないタブは選択状態にならない", () => {
    currentPath = "/venues";
    render(<BottomNav />);
    const others = screen
      .getAllByRole("link")
      .filter((el) => el.getAttribute("href") !== "/venues");
    for (const el of others) {
      expect(el).not.toHaveAttribute("aria-current");
    }
  });

  it("どのページにも該当しない場合は選択状態のタブが無い", () => {
    currentPath = "/unknown";
    render(<BottomNav />);
    const active = screen
      .getAllByRole("link")
      .filter((el) => el.getAttribute("aria-current") === "page");
    expect(active).toHaveLength(0);
  });

  it("外部リンクは別タブで安全に開く", () => {
    render(<BottomNav />);
    const external = MAIN_NAV.find((i) => i.external)!;
    const link = screen.getByText(external.label).closest("a")!;
    expect(link).toHaveAttribute("href", external.href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("外部リンクは選択状態にならない", () => {
    const external = MAIN_NAV.find((i) => i.external)!;
    currentPath = external.href;
    render(<BottomNav />);
    const link = screen.getByText(external.label).closest("a")!;
    expect(link).not.toHaveAttribute("aria-current");
  });

  it("スクリーンリーダー向けのラベルが付いている", () => {
    render(<BottomNav />);
    expect(
      screen.getByRole("navigation", { name: "ページ切り替え" }),
    ).toBeInTheDocument();
  });
});
