"use client";

import { useCallback, useEffect, useState } from "react";
import type { Sento } from "@/types";
import { fetchSento, EMPTY_HOURS } from "@/lib/tourism";

/**
 * 銭湯の管理エディタ（一覧＋追加＋削除）。
 * 登録内容はユーザーページ（/tourism/sento）のピン地図に反映される。
 * 営業時間は自由記述テキストとして hours.note に保存する。
 */
export function AdminSentoEditor({ password }: { password: string }) {
  const [spots, setSpots] = useState<Sento[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [price, setPrice] = useState("");
  const [hasSauna, setHasSauna] = useState(false);
  const [access, setAccess] = useState("");
  const [tel, setTel] = useState("");
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setSpots(await fetchSento());
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
    const priceNum = price.trim() ? Number(price) : null;
    if (priceNum !== null && Number.isNaN(priceNum)) {
      setMessage("料金は数値で入力してください（例: 450）");
      return;
    }
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/tourism/sento", {
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
        tel,
        price: priceNum,
        hasSauna,
        access,
        note,
        url,
        mapUrl,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setName("");
      setLat("");
      setLng("");
      setAddress("");
      setHours("");
      setPrice("");
      setHasSauna(false);
      setAccess("");
      setTel("");
      setNote("");
      setUrl("");
      setMapUrl("");
      setMessage("保存しました");
      reload();
    } else {
      const j = await res.json().catch(() => ({}));
      setMessage(`保存に失敗: ${j.error ?? res.status}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    const res = await fetch(`/api/tourism/sento?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (res.ok) reload();
    else setMessage("削除に失敗しました");
  }

  return (
    <div className="px-4 pb-10 pt-3">
      <h2 className="text-lg font-bold">♨️ 銭湯の管理</h2>

      <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <label className="mb-1 block text-xs text-gray-500">店名 *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="〇〇温泉"
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
          営業時間（例: 8:00〜24:00・年中無休）
        </label>
        <input
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-gray-500">
              料金（円・任意）
            </label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="450"
              inputMode="numeric"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">電話番号</label>
            <input
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              placeholder="088-000-0000"
              inputMode="tel"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <label className="mb-3 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={hasSauna}
            onChange={(e) => setHasSauna(e.target.checked)}
            className="h-4 w-4"
          />
          サウナあり（詳細カードにバッジが付きます）
        </label>
        <label className="mb-1 block text-xs text-gray-500">
          アクセス目安（例: タクシー10〜15分）
        </label>
        <input
          value={access}
          onChange={(e) => setAccess(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <label className="mb-1 block text-xs text-gray-500">
          ⚠️ 注意事項（最終受付・予約制など。ユーザー画面で赤く強調されます）
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="⚠️最終受付 23:30 など"
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <label className="mb-1 block text-xs text-gray-500">
          公式サイトURL（任意）
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <label className="mb-1 block text-xs text-gray-500">
          GoogleマップURL（任意・共有リンクなど）
        </label>
        <input
          value={mapUrl}
          onChange={(e) => setMapUrl(e.target.value)}
          placeholder="https://maps.google.com/?cid=..."
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
                  {s.hasSauna && (
                    <span className="ml-2 rounded-full bg-yosakoi px-2 py-[1px] text-[10px] font-bold text-white">
                      サウナ
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {s.address}
                  {s.hours.note ? ` / ${s.hours.note}` : ""}
                  {s.price != null ? ` / ${s.price}円` : ""}
                  {s.access ? ` / ${s.access}` : ""}
                </p>
                {s.note && (
                  <p className="mt-0.5 text-xs font-bold text-red-500">
                    {s.note}
                  </p>
                )}
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
