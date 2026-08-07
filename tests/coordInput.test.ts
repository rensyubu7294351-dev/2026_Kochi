import { describe, it, expect } from "vitest";
import { parseLatLngInput } from "@/components/admin/AdminVenueEditor";

describe("管理画面の座標入力", () => {
  it("緯度・経度を別々の欄に入れられる", () => {
    expect(parseLatLngInput("33.558342", "133.540268")).toEqual({
      lat: 33.558342,
      lng: 133.540268,
    });
  });

  it("前後の空白があっても読める", () => {
    expect(parseLatLngInput(" 33.5 ", " 133.5 ")).toEqual({
      lat: 33.5,
      lng: 133.5,
    });
  });

  it("Googleマップからまとめて貼り付けても読める", () => {
    // 「33.558342, 133.540268」を片方の欄に貼るとよくある形
    expect(parseLatLngInput("33.558342, 133.540268", "")).toEqual({
      lat: 33.558342,
      lng: 133.540268,
    });
    expect(parseLatLngInput("", "33.558342,133.540268")).toEqual({
      lat: 33.558342,
      lng: 133.540268,
    });
  });

  it("全角のカンマ・読点でも読める", () => {
    expect(parseLatLngInput("33.558342，133.540268", "")).toEqual({
      lat: 33.558342,
      lng: 133.540268,
    });
  });

  it("マイナスの座標も読める", () => {
    expect(parseLatLngInput("-33.86", "151.2")).toEqual({
      lat: -33.86,
      lng: 151.2,
    });
  });

  it("入力途中や空欄では位置を確定しない", () => {
    for (const [a, b] of [
      ["", ""],
      ["33.5", ""],
      ["", "133.5"],
      ["33.", ""],
      ["-", "133.5"],
    ]) {
      expect(parseLatLngInput(a, b)).toBeNull();
    }
  });

  it("数字でないものは受け付けない", () => {
    expect(parseLatLngInput("あ", "133.5")).toBeNull();
    expect(parseLatLngInput("33.5", "abc")).toBeNull();
    expect(parseLatLngInput("https://maps.google.com/", "")).toBeNull();
  });

  it("地球上にあり得ない値は受け付けない", () => {
    expect(parseLatLngInput("91", "133.5")).toBeNull();
    expect(parseLatLngInput("33.5", "181")).toBeNull();
  });

  it("3つ以上の数字が入っていたら受け付けない", () => {
    expect(parseLatLngInput("33.5, 133.5, 12", "")).toBeNull();
  });
});
