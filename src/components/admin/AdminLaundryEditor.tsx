"use client";

import { useCallback, useEffect, useState } from "react";
import type { Laundry } from "@/types";
import { fetchLaundry, EMPTY_HOURS } from "@/lib/tourism";

/**
 * コインランドリーの管理エディタ（一覧＋追加＋削除）。
 * 登録内容はユーザーページ（/tourism/laundry）のピン地図に反映される。
 * 営業時間は自由記述テキストとして hours.note に保存する。
 */
export function AdminLaundryEditor({ password }: { password: string }) {
  const [spots, setSpots] = useState<Laundry[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [is24h, setIs24h] = useState(false);
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setSpots(await fetchLaundry());
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleSave() {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!name.trim() || !lat.trim() || !lng.trim()) {
      setMessage("店名・緯度・経度は必須です");
      return;
    }
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      setMessage("緯度・経度は数値で入力してください（例: 33.5597）");
      return;
    }
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/tourism/laundry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({
        name,
        lat: latNum,
        lng: lngNum,
        address,
        hours: hours.trim() ? { ...EMPTY_HOURS, note: hours.trim() } : null,
        note,
        url,
        is24h,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setName("");
      setLat("");
      setLng("");
      setAddress("");
      setHours("");
      setIs24h(false);
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
    const res = await fetch(`/api/tourism/laundry?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (res.ok) reload();
    else setMessage("削除に失敗しました");
  }

  return (
    <div className="px-4 pb-10 pt-3">
      <h2 className="text-lg font-bold">🧺 コインランドリーの管理</h2>

      <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <label className="mb-1 block text-xs text-gray-500">店名 *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="コインランドリー〇〇 △△店"
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-gray-500">緯度 *</label>
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="33.5597"
              inputMode="decimal"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">経度 *</label>
            <input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="133.5311"
              inputMode="decimal"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <p className="mb-3 text-xs text-gray-400">
          Googleマップで場所を右クリック（長押し）すると緯度・経度をコピーできます。
        </p>
        <label className="mb-1 block text-xs text-gray-500">住所</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="高知市〇〇町1-2-3"
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <label className="mb-1 block text-xs text-gray-500">
          営業時間（例: 7:00〜24:00）
        </label>
        <input
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <label className="mb-3 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={is24h}
            onChange={(e) => setIs24h(e.target.checked)}
            className="h-4 w-4"
          />
          24時間営業（地図のピンに24hバッジが付きます）
        </label>
        <label className="mb-1 block text-xs text-gray-500">
          メモ（任意・注意点や特徴など）
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <label className="mb-1 block text-xs text-gray-500">
          GoogleマップURL（任意・共有リンクなど）
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://maps.app.goo.gl/..."
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
        登録済み（{spots.length}件）
      </h3>
      {loading ? (
        <p className="text-xs text-gray-400">読み込み中...</p>
      ) : spots.length === 0 ? (
        <p className="text-xs text-gray-400">まだありません。</p>
      ) : (
        <ul className="grid gap-2">
          {spots.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white p-3 text-sm shadow-sm"
            >
              <div className="flex-1">
                <p className="font-medium">
                  {s.name}
                  {s.is24h && (
                    <span className="ml-2 rounded-full bg-yosakoi px-2 py-[1px] text-[10px] font-bold text-white">
                      24h
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {s.address}
                  {s.hours.note ? ` / ${s.hours.note}` : ""}
                  {s.note ? ` / ${s.note}` : ""}
                </p>
              </div>
              <button
                onClick={() => handleDelete(s.id)}
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
