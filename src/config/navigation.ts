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
    description: "全14会場のマップ・施設ピン・ルート検索",
    href: "/venues",
    emoji: "🗾",
  },
  {
    title: "高知観光編",
    description: "銭湯・コインランドリー・タクシー会社",
    href: "/tourism",
    emoji: "♨️",
  },
  {
    title: "お役立ち（ライフハック）",
    description: "既存のライフハックアプリを開く",
    href: LIFEHACK_APP_URL,
    external: true,
    emoji: "💡",
  },
];

/** 観光編のサブメニュー */
export const TOURISM_MENU: NavItem[] = [
  {
    title: "銭湯マップ",
    description: "営業時間付き",
    href: "/tourism/sento",
    emoji: "♨️",
  },
  {
    title: "コインランドリー",
    description: "営業時間付き",
    href: "/tourism/laundry",
    emoji: "🧺",
  },
  {
    title: "タクシー会社",
    description: "市内で呼べる会社一覧",
    href: "/tourism/taxi",
    emoji: "🚕",
  },
];
