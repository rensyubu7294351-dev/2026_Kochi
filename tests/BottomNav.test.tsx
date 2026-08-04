import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav } from "@/components/layout/BottomNav";
import { AUDIENCES, navFor, routesFor } from "@/config/navigation";

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
  it.each(AUDIENCES)("%s: 全ページ分のタブが表示される", (audience) => {
    render(<BottomNav audience={audience} />);
    for (const item of navFor(audience)) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("link")).toHaveLength(navFor(audience).length);
  });

  it.each(AUDIENCES)("%s: 自分の系統のURLだけを指す", (audience) => {
    render(<BottomNav audience={audience} />);
    const hrefs = screen
      .getAllByRole("link")
      .map((el) => el.getAttribute("href"));
    expect(hrefs).toEqual(routesFor(audience));
  });

  const cases = AUDIENCES.flatMap((a) =>
    routesFor(a).map((r) => ({ audience: a, route: r })),
  );

  it.each(cases)(
    "表示中のページのタブが選択状態になる: $route",
    ({ audience, route }) => {
      currentPath = route;
      render(<BottomNav audience={audience} />);
      const active = screen
        .getAllByRole("link")
        .filter((el) => el.getAttribute("aria-current") === "page");
      expect(active).toHaveLength(1);
      expect(active[0]).toHaveAttribute("href", route);
    },
  );

  it("表示中でないタブは選択状態にならない", () => {
    currentPath = "/venues";
    render(<BottomNav audience="user" />);
    const others = screen
      .getAllByRole("link")
      .filter((el) => el.getAttribute("href") !== "/venues");
    for (const el of others) {
      expect(el).not.toHaveAttribute("aria-current");
    }
  });

  it("別系統のページを表示中なら選択状態のタブが無い", () => {
    currentPath = "/supporter/venues";
    render(<BottomNav audience="user" />);
    const active = screen
      .getAllByRole("link")
      .filter((el) => el.getAttribute("aria-current") === "page");
    expect(active).toHaveLength(0);
  });

  it("全タブがアプリ内ページを指している（外部サイトへ飛ばない）", () => {
    render(<BottomNav audience="user" />);
    for (const link of screen.getAllByRole("link")) {
      expect(link.getAttribute("href")).toMatch(/^\//);
    }
  });

  it("スクリーンリーダー向けのラベルが付いている", () => {
    render(<BottomNav audience="user" />);
    expect(
      screen.getByRole("navigation", { name: "ページ切り替え" }),
    ).toBeInTheDocument();
  });
});
