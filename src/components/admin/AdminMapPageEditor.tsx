"use client";

import { useEffect, useState } from "react";
import { fetchSettings } from "@/lib/settings";

const CONFIG = {
  sento: { title: "銭湯マップ", emoji: "♨️" },
  laundry: { title: "コインランドリーマップ", emoji: "🧺" },
} as const;

/**
 * 銭湯・コインランドリーの「まとめGoogleマップURL」と「説明文」を編集する。
 * 保存内容はユーザーページ（/tourism/sento・/laundry）に反映される。
 */
export function AdminMapPageEditor({
  kind,
  password,
}: {
  kind: "sento" | "laundry";
  password: string;
}) {
  const cfg = CONFIG[kind];
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSettings().then((s) => {
      if (cancelled) return;
      setUrl(s[`${kind}_map_url`] ?? "");
      setDesc(s[`${kind}_desc`] ?? "");
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  async function saveOne(key: string, value: string) {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ key, value }),
    });
    return res.ok;
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const ok1 = await saveOne(`${kind}_map_url`, url.trim());
    const ok2 = await saveOne(`${kind}_desc`, desc);
    setSaving(false);
    setMessage(ok1 && ok2 ? "保存しました" : "保存に失敗しました");
  }

  return (
    <div className="px-4 pb-10 pt-3">
      <h2 className="text-lg font-bold">
        {cfg.emoji} {cfg.title}の設定
      </h2>

      {loading ? (
        <p className="mt-3 text-xs text-gray-400">読み込み中...</p>
      ) : (
        <div className="mt-3 space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div>
            <label className="mb-1 block text-xs text-gray-500">
              GoogleマップURL（埋め込み用）
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.google.com/maps/d/embed?mid=..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">
              Googleマイマップ →「共有」→「地図を埋め込む」で表示される
              iframe の src（https://... の部分）を貼り付けてください。
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">説明文</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={6}
              placeholder="この地図の使い方や注意事項など"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-yosakoi py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          {message && <p className="text-xs text-gray-600">{message}</p>}
        </div>
      )}
    </div>
  );
}
