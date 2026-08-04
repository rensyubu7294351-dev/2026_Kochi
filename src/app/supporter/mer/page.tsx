import { MerScreen } from "@/components/screens/screens";

export const metadata = { title: "MER | 高知便利情報（サポーター用）" };

// 画像はビルド時に固定。データ取得が無いので表示は一瞬
export const dynamic = "force-static";

export default function Page() {
  return <MerScreen audience="supporter" />;
}
