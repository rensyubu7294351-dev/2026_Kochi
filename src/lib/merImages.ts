import "server-only";
import fs from "node:fs";
import path from "node:path";

export type MerImage = {
  /** ファイル名 */
  file: string;
  /** 公開URL */
  src: string;
  /** 画像の上に出す見出し（ファイル名の先頭の「1-」などを除いたもの） */
  title: string;
  /** レイアウトのガタつき防止用。取得できなければ undefined */
  width?: number;
  height?: number;
};

const MER_DIR = path.join(process.cwd(), "public", "images", "mer");
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;

/** JPEG / PNG のヘッダから画像サイズを読む（依存を増やさない簡易版） */
function readSize(file: string): { width: number; height: number } | null {
  let fd: number | null = null;
  try {
    fd = fs.openSync(file, "r");
    const buf = Buffer.alloc(65536);
    const len = fs.readSync(fd, buf, 0, buf.length, 0);

    // PNG: IHDR に幅・高さが入っている
    if (buf.slice(0, 8).toString("hex") === "89504e470d0a1a0a") {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }

    // JPEG: SOFn マーカー（0xFFC0〜0xFFCF、DHT等は除く）を探す
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i + 9 < len) {
        if (buf[i] !== 0xff) {
          i++;
          continue;
        }
        const marker = buf[i + 1];
        const isSOF =
          marker >= 0xc0 &&
          marker <= 0xcf &&
          marker !== 0xc4 &&
          marker !== 0xc8 &&
          marker !== 0xcc;
        if (isSOF) {
          return {
            height: buf.readUInt16BE(i + 5),
            width: buf.readUInt16BE(i + 7),
          };
        }
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    if (fd !== null) fs.closeSync(fd);
  }
}

/**
 * public/images/mer に置かれた画像を、ファイル名の昇順で返す。
 * ビルド時に読むので、画像を追加・差し替えするだけでページに反映される
 * （コードの修正は不要。並び順はファイル名の先頭に 1- 2- を付けて指定）。
 */
export function getMerImages(): MerImage[] {
  let files: string[];
  try {
    files = fs.readdirSync(MER_DIR);
  } catch {
    return [];
  }

  return files
    .filter((f) => IMAGE_EXT.test(f))
    .sort((a, b) => a.localeCompare(b, "ja"))
    .map((file) => {
      const size = readSize(path.join(MER_DIR, file));
      return {
        file,
        src: `/images/mer/${file}`,
        title: file.replace(IMAGE_EXT, "").replace(/^\d+[-_\s]*/, ""),
        width: size?.width,
        height: size?.height,
      };
    });
}
