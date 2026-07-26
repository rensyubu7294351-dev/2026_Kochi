import { AdminGate } from "@/components/admin/AdminGate";

export const metadata = {
  title: "管理者 | 高知よさこい チームマップ",
  robots: { index: false, follow: false },
};

/** 管理者画面（施設ピンの入力・削除）。パスワードでロック。 */
export default function AdminPage() {
  return <AdminGate />;
}
