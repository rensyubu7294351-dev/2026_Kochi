import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VenueTabs } from "@/components/venues/VenueTabs";
import { VENUES, LODGING_VENUE, getVenueBySlug } from "@/data/venues";
import { FACILITY_META, FACILITY_ORDER } from "@/config/facilities";

/** タブの並びを表示順のまま取り出す */
function tabLabels() {
  return screen.getAllByRole("button").map((b) => b.textContent?.trim() ?? "");
}

describe("「宿」タブ", () => {
  it("一番左（「全体」より前）にある", () => {
    render(<VenueTabs activeSlug="all" onSelect={vi.fn()} />);
    const labels = tabLabels();
    expect(labels[0]).toContain("宿");
    expect(labels[1]).toContain("全体");
  });

  it("会場より前にある", () => {
    render(<VenueTabs activeSlug="all" onSelect={vi.fn()} />);
    const labels = tabLabels();
    expect(labels.findIndex((l) => l.includes("宿"))).toBeLessThan(
      labels.findIndex((l) => l.includes(VENUES[0].name)),
    );
  });

  it("押すと宿タブに切り替わる", async () => {
    const onSelect = vi.fn();
    render(<VenueTabs activeSlug="all" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: /宿/ }));
    expect(onSelect).toHaveBeenCalledWith(LODGING_VENUE.slug);
  });

  it("選択中は他のタブと同じように目立つ", () => {
    render(<VenueTabs activeSlug={LODGING_VENUE.slug} onSelect={vi.fn()} />);
    const tab = screen.getByRole("button", { name: /宿/ });
    expect(tab).toHaveAttribute("aria-current", "true");
    expect(tab.className).toContain("bg-yosakoi");
  });

  it("管理画面では「全体」を隠す（ピンの置き場所ではないため）", () => {
    render(
      <VenueTabs activeSlug={LODGING_VENUE.slug} onSelect={vi.fn()} showAll={false} />,
    );
    const labels = tabLabels();
    expect(labels.some((l) => l.includes("全体"))).toBe(false);
    // 宿と会場は残る（どちらもピンを置ける）
    expect(labels[0]).toContain("宿");
    expect(labels.some((l) => l.includes(VENUES[0].name))).toBe(true);
  });
});

describe("宿タブのデータ", () => {
  it("会場と同じ仕組みで引ける", () => {
    expect(getVenueBySlug(LODGING_VENUE.slug)).toBe(LODGING_VENUE);
  });

  it("演舞会場の一覧には混ざらない（全体マップに出ない）", () => {
    expect(VENUES.some((v) => v.slug === LODGING_VENUE.slug)).toBe(false);
    expect(VENUES).toHaveLength(14);
  });

  it("競演場ではないのでメダル・競演場の長さを持たない", () => {
    expect(LODGING_VENUE.hasMedal).toBe(false);
    expect(LODGING_VENUE.courseLength).toBeUndefined();
  });

  it("高知市内が写る位置に地図が開く", () => {
    expect(LODGING_VENUE.center.lat).toBeGreaterThan(33.4);
    expect(LODGING_VENUE.center.lat).toBeLessThan(33.7);
    expect(LODGING_VENUE.center.lng).toBeGreaterThan(133.4);
    expect(LODGING_VENUE.center.lng).toBeLessThan(133.7);
  });
});

describe("「集合・待機所」アイコン", () => {
  it("施設の種類として選べる", () => {
    expect(FACILITY_ORDER).toContain("assembly");
    expect(FACILITY_META.assembly.label).toBe("集合・待機所");
  });

  it("宿と並んで使える（どちらも新しい種類）", () => {
    expect(FACILITY_ORDER).toContain("lodging");
    expect(FACILITY_META.assembly.icon).toBe("assembly.svg");
    expect(FACILITY_META.lodging.icon).toBe("lodging.svg");
  });
});
