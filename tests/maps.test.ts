import { describe, it, expect } from "vitest";
import { buildPlaceUrl, buildDirectionsUrl } from "@/lib/maps";

const 百石町店 = { lat: 33.54502, lng: 133.5436 };
const HA = { lat: 33.558342, lng: 133.540268 };

/** URLのクエリを取り出す（順序に依存せず中身で確かめる） */
const q = (url: string) => new URL(url).searchParams;

describe("Googleマップで場所を開くURL", () => {
  it("保存リンクが無ければ座標そのものを開く", () => {
    const url = buildPlaceUrl(百石町店);
    expect(url.startsWith("https://www.google.com/maps/search/?")).toBe(true);
    expect(q(url).get("api")).toBe("1");
    expect(q(url).get("query")).toBe("33.54502,133.5436");
  });

  it("座標に店名を混ぜない（混ぜると別の場所が開いてしまう）", () => {
    // 以前は query=緯度,経度(店名) としており、Googleが検索語として扱って
    // 「一致する検索場所がありません」になっていた
    const query = q(buildPlaceUrl(百石町店)).get("query")!;
    expect(query).toMatch(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/);
    expect(query).not.toContain("(");
  });

  it("古い place_id 形式のリンクは公式形式に直す", () => {
    const old = "https://www.google.com/maps/place/?q=place_id:ChIJ86bI_hwZTjUR2COAjhAmfXs";
    const url = buildPlaceUrl(HA, old);
    expect(url).not.toContain("place_id:");
    expect(q(url).get("api")).toBe("1");
    expect(q(url).get("query")).toBe("33.558342,133.540268");
    expect(q(url).get("query_place_id")).toBe("ChIJ86bI_hwZTjUR2COAjhAmfXs");
  });

  it("短縮リンクはそのまま使う（Googleが発行した共有URLのため）", () => {
    const short = "https://maps.app.goo.gl/VLXjp67RNpevG8wQ7";
    expect(buildPlaceUrl(HA, short)).toBe(short);
  });

  it("銭湯の cid 形式のリンクもそのまま使う", () => {
    const cid = "https://maps.google.com/?cid=12540426611826982880";
    expect(buildPlaceUrl(HA, cid)).toBe(cid);
  });

  it("すでに公式形式ならそのまま使う", () => {
    const ok =
      "https://www.google.com/maps/search/?api=1&query=33.5,133.5&query_place_id=ChIJabc123";
    expect(buildPlaceUrl(HA, ok)).toBe(ok);
  });

  it("空文字や空白だけのリンクは無視して座標で開く", () => {
    for (const empty of ["", "   "]) {
      expect(q(buildPlaceUrl(百石町店, empty)).get("query")).toBe(
        "33.54502,133.5436",
      );
    }
  });
});

describe("ルート案内のURL", () => {
  it("目的地の座標を渡す", () => {
    const url = buildDirectionsUrl(HA);
    expect(q(url).get("api")).toBe("1");
    expect(q(url).get("destination")).toBe("33.558342,133.540268");
    expect(q(url).get("travelmode")).toBe("walking");
  });

  it("現在地が分かっていれば出発地として渡す", () => {
    const url = buildDirectionsUrl(HA, 百石町店);
    expect(q(url).get("origin")).toBe("33.54502,133.5436");
  });
});
