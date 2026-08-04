import { HomeLauncher } from "@/components/layout/HomeLauncher";

/**
 * トップページは廃止し、実ページへの転送のみ行う。
 * （ページ移動は画面下部の固定タブバーに集約）
 */
export default function HomePage() {
  return <HomeLauncher audience="user" />;
}
