import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  EDIT_TARGETS,
  EDIT_TARGET_LABEL,
  parseEditTarget,
  readAudience,
  writeAudiences,
} from "@/lib/adminAudience";
import { AUDIENCES } from "@/config/navigation";
import { FACILITY_META, FACILITY_ORDER } from "@/config/facilities";

const ROOT = path.resolve(__dirname, "..");

describe("編集対象（ユーザー用 / サポーター用 / 両方）", () => {
  it("3つの選択肢がある", () => {
    expect(EDIT_TARGETS).toEqual(["user", "supporter", "both"]);
    for (const t of EDIT_TARGETS) expect(EDIT_TARGET_LABEL[t]).toBeTruthy();
  });

  it("「両方」は2系統ともに書き込む", () => {
    expect(writeAudiences("both").sort()).toEqual([...AUDIENCES].sort());
  });

  it.each(AUDIENCES)("%s を選んだ時はその系統だけに書き込む", (a) => {
    expect(writeAudiences(a)).toEqual([a]);
  });

  it("「両方」の一覧表示はユーザー用を見本にする", () => {
    expect(readAudience("both")).toBe("user");
  });

  it.each(AUDIENCES)("%s の一覧表示はその系統そのもの", (a) => {
    expect(readAudience(a)).toBe(a);
  });

  it("受け取った値を編集対象として読む", () => {
    expect(parseEditTarget("both")).toBe("both");
    expect(parseEditTarget("supporter")).toBe("supporter");
    expect(parseEditTarget("user")).toBe("user");
  });

  it("不正な値は既定のユーザー用に倒す（取り違え防止）", () => {
    for (const bad of [undefined, null, "", "everyone", 1, {}]) {
      expect(parseEditTarget(bad)).toBe("user");
    }
  });
});

describe("管理APIが編集対象を受け取っている", () => {
  const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

  it.each([
    "src/app/api/facilities/route.ts",
    "src/app/api/tourism/[kind]/route.ts",
  ])("%s が「両方」に対応している", (rel) => {
    const src = read(rel);
    expect(src).toContain("parseEditTarget");
    expect(src).toContain("writeAudiences");
  });

  it.each([
    "src/app/api/facilities/route.ts",
    "src/app/api/tourism/[kind]/route.ts",
  ])("%s の削除がもう一方の系統も対象にできる", (rel) => {
    const src = read(rel);
    // 削除は id だけでなく編集対象も見て、対になる行を一緒に消す
    expect(src).toContain('searchParams.get("audience")');
    expect(src).toContain(".in(");
  });

  it.each([
    "AdminVenueEditor",
    "AdminSentoEditor",
    "AdminLaundryEditor",
    "AdminTaxiEditor",
  ])("%s の削除リクエストが編集対象を送っている", (name) => {
    const src = read(`src/components/admin/${name}.tsx`);
    expect(src).toContain("audience=${audience}");
  });
});

describe("宿アイコン", () => {
  it("施設の種類として選べる", () => {
    expect(FACILITY_ORDER).toContain("lodging");
    expect(FACILITY_META.lodging.label).toBe("宿");
  });

  it("アイコン画像が実在する", () => {
    for (const type of FACILITY_ORDER) {
      const icon = FACILITY_META[type].icon;
      const file = path.join(ROOT, "public/images/icons", icon);
      expect(fs.existsSync(file), `${type} のアイコン ${icon} が無い`).toBe(
        true,
      );
    }
  });

  it("他の種類と色が重ならない（地図で見分けられる）", () => {
    const colors = FACILITY_ORDER.map((t) => FACILITY_META[t].color);
    expect(new Set(colors).size).toBe(colors.length);
  });
});
