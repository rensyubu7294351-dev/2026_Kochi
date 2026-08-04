import { LaundryScreen } from "@/components/screens/screens";

export const metadata = { title: "コインランドリー | 高知便利情報（サポーター用）" };

// データをページに焼き込み60秒ごとに再生成（表示は一瞬・裏で最新化）
export const revalidate = 60;

export default function Page() {
  return <LaundryScreen audience="supporter" />;
}
