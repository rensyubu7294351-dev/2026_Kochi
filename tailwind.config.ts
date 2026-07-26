import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // よさこいのイメージcarカラー。data/デザインに合わせて調整可。
        yosakoi: {
          DEFAULT: "#e4002b", // 鳴子の赤
          dark: "#a80020",
          light: "#ff5a5f",
        },
        kochi: {
          sea: "#0077be", // 太平洋ブルー
          leaf: "#2e7d32", // 緑（自然）
        },
      },
      fontFamily: {
        // 端末標準の日本語フォント（Webフォントを読み込まず即表示）
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Hiragino Sans"',
          '"Hiragino Kaku Gothic ProN"',
          '"Yu Gothic"',
          "YuGothic",
          "Meiryo",
          '"Noto Sans JP"',
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
