"use client";

import { useCallback, useEffect, useState } from "react";
import type { TaxiCompany } from "@/types";
import { fetchTaxi } from "@/lib/tourism";

/** タクシー会社の管理エディタ（地図なし・一覧＋追加）。 */
export function AdminTaxiEditor({ password }: { password: string }) {
  const [companies, setCompanies] = useState<TaxiCompany[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setCompanies(await fetchTaxi());
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleSave() {
    if (!name.trim() || !tel.trim()) {
      setMessage("会社名と電話番号は必須です");
      return;
    }
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/tourism/taxi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ name, tel, note, url }),
    });
    setSaving(false);
    if (res.ok) {
      setName("");
      setTel("");
      setNote("");
      setUrl("");
      setMessage("保存しました");
      reload();
    } else {
      const j = await res.json().catch(() => ({}));
      setMessage(`保存に失敗: ${j.error ?? res.status}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    const res = await fetch(`/api/tourism/taxi?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (res.ok) reload();
    else setMessage("削除に失敗しました");
  }

  return (
    <div className="px-4 pb-10 pt-3">
      <h2 className="text-lg font-bold">🚕 タクシー会社の管理</h2>

      <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <label className="mb-1 block text-xs text-gray-500">会社名 *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <label className="mb-1 block text-xs text-gray-500">電話番号 *</label>
        <input
          value={tel}
          onChange={(e) => setTel(e.target.value)}
          placeholder="088-000-0000"
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <label className="mb-1 block text-xs text-gray-500">
          メモ（任意・例: 24時間配車 / ジャンボあり）
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <label className="mb-1 block text-xs text-gray-500">URL（任意）</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-lg bg-yosakoi py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
        {message && <p className="mt-2 text-xs text-gray-600">{message}</p>}
      </div>

      <h3 className="mb-2 mt-4 text-sm font-bold">
        登録済み（{companies.length}件）
      </h3>
      {loading ? (
        <p className="text-xs text-gray-400">読み込み中...</p>
      ) : companies.length === 0 ? (
        <p className="text-xs text-gray-400">まだありません。</p>
      ) : (
        <ul className="grid gap-2">
          {companies.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white p-3 text-sm shadow-sm"
            >
              <div className="flex-1">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-gray-500">
                  {c.tel}
                  {c.note ? ` / ${c.note}` : ""}
                </p>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-500"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
