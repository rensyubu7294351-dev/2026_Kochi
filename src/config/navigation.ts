import { LIFEHACK_APP_URL } from "@/lib/constants";

/** ホーム画面に並べる主要メニュー */
export type NavItem = {
  title: string;
  description: string;
  href: string;
  /** 外部リンク（別タブで開く）か */
  external?: boolean;
  /** カードの装飾用アイコン名（public/images/icons or 絵文字など任意運用） */
  emoji?: string;
};

export const HOME_MENU: NavItem[] = [
  {
    title: "演舞会場マップ",
    description: "演舞場ごとのマップ・ルート検索",
    href: "/venues",
    emoji: "🗾",
  },
  {
    title: "銭湯マップ",
    description: "深夜まで営業している銭湯まとめ\n（タクシー移動推奨）",
    href: "/tourism/sento",
    emoji: "♨️",
  },
  {
    title: "コインランドリーマップ",
    description: "コインランドリーマップ\n（タクシー移動推奨）",
    href: "/tourism/laundry",
    emoji: "🧺",
  },
  {
    title: "タクシー会社一覧",
    description: "市内で呼べるタクシーの電話番号",
    href: "/tourism/taxi",
    emoji: "🚕",
  },
  {
    title: "ライフハック",
    description: "七福のライフハックアプリ",
    href: LIFEHACK_APP_URL,
    external: true,
    emoji: "💡",
  },
];
