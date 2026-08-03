import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  // tsconfig の jsx: "preserve"（Next用）に引きずられないよう明示する
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      // トップページ廃止で影響を受ける「ナビゲーション・転送」まわりを
      // カバレッジの対象にする。地図描画やSupabase通信は外部APIに依存し
      // モックが実挙動と乖離するため、対象外（実機確認で担保）。
      include: [
        "src/config/navigation.ts",
        "src/components/layout/BottomNav.tsx",
        "src/components/layout/HomeLauncher.tsx",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
