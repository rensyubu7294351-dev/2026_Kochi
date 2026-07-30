import type { FacilityType } from "@/types";

/**
 * 施設タイプごとの表示メタ情報。
 * - label   : 画面に出す日本語名
 * - icon    : public/images/icons 配下のアイコンファイル名
 * - color   : マーカー・凡例の色（Tailwindではなく地図マーカー用の生の色）
 * - short   : 凡例やチップで使う短縮ラベル
 *
 * アイコン画像は public/images/icons/ に同名で用意する（未用意でも動くよう
 * にコンポーネント側でフォールバックする想定）。
 */
export const FACILITY_META: Record<
  FacilityType,
  { label: string; icon: string; color: string; short: string }
> = {
  // 救護所と休憩所は統合し、同じ医療アイコンで表示する
  "first-aid": {
    label: "救護所・休憩所",
    icon: "first-aid.svg",
    color: "#ff4d6d",
    short: "救護",
  },
  // 旧「休憩所」データ互換用（救護所と同一表示にフォールバック）。
  // 選択肢(FACILITY_ORDER)には出さない。
  "rest-area": {
    label: "救護所・休憩所",
    icon: "first-aid.svg",
    color: "#ff4d6d",
    short: "救護",
  },
  "toilet-public": {
    label: "公衆トイレ",
    icon: "toilet-public.svg",
    color: "#3aa0ff",
    short: "公衆WC",
  },
  "toilet-temporary": {
    label: "仮設トイレ",
    icon: "toilet-temporary.svg",
    color: "#6fc2ff",
    short: "仮設WC",
  },
  "bus-waiting": {
    label: "バス待機場所",
    icon: "bus.svg",
    color: "#ffab2e",
    short: "バス",
  },
  "dance-start": {
    label: "踊り開始位置",
    icon: "dance-start.svg",
    color: "#a855f7",
    short: "開始",
  },
  "dance-end": {
    label: "踊り終了位置",
    icon: "dance-end.svg",
    color: "#7c3aed",
    short: "終了",
  },
  reception: {
    label: "受付",
    icon: "reception.svg",
    color: "#14b8a6",
    short: "受付",
  },
  drugstore: {
    label: "ドラッグストア",
    icon: "drugstore.svg",
    color: "#ff7a45",
    short: "薬局",
  },
  convenience: {
    label: "コンビニ",
    icon: "convenience.svg",
    color: "#22b573",
    short: "コンビニ",
  },
  shop: {
    label: "お店",
    icon: "shop.svg",
    color: "#ff6fae",
    short: "店",
  },
  judging: {
    label: "審査場",
    icon: "judging.svg",
    color: "#4f46e5",
    short: "審査",
  },
  "water-station": {
    label: "給水所",
    icon: "water-station.svg",
    color: "#06b6d4",
    short: "給水",
  },
};

/** 凡例やフィルタで使う、表示順を固定した施設タイプ一覧 */
export const FACILITY_ORDER: FacilityType[] = [
  "dance-start",
  "dance-end",
  "reception",
  "first-aid",
  "toilet-public",
  "toilet-temporary",
  "bus-waiting",
  "drugstore",
  "convenience",
  "shop",
  "judging",
  "water-station",
];
