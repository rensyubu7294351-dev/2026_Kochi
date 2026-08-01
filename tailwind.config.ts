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
      // なめらかな減速カーブ（iOS風スプリング）
      transitionTimingFunction: {
        spring: "cubic-bezier(.22,1,.36,1)",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "none" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(.97)" },
          "60%": { opacity: "1", transform: "translateY(-2px) scale(1.01)" },
          "100%": { opacity: "1", transform: "none" },
        },
        "pin-pop": {
          "0%": { opacity: "0", transform: "scale(.5) translateY(6px)" },
          "60%": { opacity: "1", transform: "scale(1.12)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "location-pulse": {
          "0%": { boxShadow: "0 0 0 0 rgba(59,130,246,.45)" },
          "100%": { boxShadow: "0 0 0 14px rgba(59,130,246,0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up .4s cubic-bezier(.22,1,.36,1) both",
        "pop-in": "pop-in .35s cubic-bezier(.22,1,.36,1) both",
        // backwards: 終了後はクラスの transform（scale-125等）を邪魔しない
        "pin-pop": "pin-pop .35s cubic-bezier(.22,1,.36,1) backwards",
        "location-pulse": "location-pulse 1.6s ease-out infinite",
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
