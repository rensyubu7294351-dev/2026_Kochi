"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls } from "motion/react";

/**
 * 下から重なって出るボトムシート（ネイティブアプリ風）。
 * - 開閉はスプリングで滑らかにスライド
 * - 上部のつまみを下へスワイプ（またはフリック）すると閉じる
 * - オーバーレイ表示なので地図や一覧を押し下げない（レイアウトが動かない）
 * - 下部タブバー（z-30）の背後から出るため、タブバーは常に見えて押せる
 * - createPortal で body 直下に描画する。祖先に transform アニメーション等が
 *   あると position:fixed がビューポート基準にならず「ページ最下部」に
 *   描画されてしまうブラウザ仕様を回避するため（必ず画面下端に出す）。
 */
export function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dragControls = useDragControls();

  // SSR中は document が無いため、マウント後にのみポータルを描画する
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[var(--max-content-width)]"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 340, damping: 32 }}
          drag="y"
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.7 }}
          onDragEnd={(_, info) => {
            // ある程度引き下げるか、勢いよくフリックしたら閉じる
            if (info.offset.y > 90 || info.velocity.y > 600) onClose();
          }}
        >
          <div className="rounded-t-2xl border-x border-t border-gray-200 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.15)]">
            {/* つまみ（ここを持って下にスワイプで閉じる） */}
            <div
              className="flex cursor-grab touch-none justify-center py-3"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <span className="h-1.5 w-10 rounded-full bg-gray-300" />
            </div>
            {/* 下部タブバーに隠れないよう余白を確保しつつ、長い内容はシート内でスクロール */}
            <div className="max-h-[45dvh] overflow-y-auto px-3 pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
