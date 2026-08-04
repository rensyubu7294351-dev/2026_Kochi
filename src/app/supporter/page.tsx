import { HomeLauncher } from "@/components/layout/HomeLauncher";

/**
 * サポーター用のトップ。画面は持たず、実ページへ転送するだけ。
 * （ページ移動は画面下部の固定タブバーに集約）
 */
export default function SupporterHomePage() {
  return <HomeLauncher audience="supporter" />;
}
