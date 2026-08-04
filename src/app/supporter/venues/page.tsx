import { VenuesScreen } from "@/components/screens/screens";

export const metadata = { title: "演舞会場マップ | 高知よさこい チームマップ（サポーター用）" };

// データをページに焼き込み60秒ごとに再生成（表示は一瞬・裏で最新化）
export const revalidate = 60;

export default function Page() {
  return <VenuesScreen audience="supporter" />;
}
