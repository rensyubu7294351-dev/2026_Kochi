"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Map,
  AdvancedMarker,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import type { Laundry, LatLng, OpeningHours, Sento } from "@/types";
import { KOCHI_CENTER } from "@/lib/constants";
import { GOOGLE_MAPS_MAP_ID } from "@/lib/constants";
import { EMPTY_HOURS, fetchLaundry, fetchSento } from "@/lib/tourism";
import { GoogleMapProvider } from "@/components/map/GoogleMapProvider";
import { HoursEditor } from "./HoursEditor";

type SpotKind = "sento" | "laundry";

const CONFIG: Record<SpotKind, { title: string; emoji: string }> = {
  sento: { title: "銭湯", emoji: "♨️" },
  laundry: { title: "コインランドリー", emoji: "🧺" },
};

/**
 * 銭湯・コインランドリーの管理エディタ（共通）。
 * 地図タップで位置指定 → 名前・営業時間などを入力して保存。
 */
export function AdminSpotEditor({
  kind,
  password,
}: {
  kind: SpotKind;
  password: string;
}) {
  const cfg = CONFIG[kind];
  const [spots, setSpots] = useState<(Sento | Laundry)[]>([]);
  const [loading, setLoading] = useState(false);

  const [draft, setDraft] = useState<LatLng | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState<OpeningHours>({ ...EMPTY_HOURS });
  const [tel, setTel] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [price, setPrice] = useState("");
  const [hasSauna, setHasSauna] = useState(false);
  const [is24h, setIs24h] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setSpots(kind === "sento" ? await fetchSento() : await fetchLaundry());
    setLoading(false);
  }, [kind]);

  useEffect(() => {
    reload();
  }, [reload]);

  function resetForm() {
    setDraft(null);
    setName("");
    setAddress("");
    setHours({ ...EMPTY_HOURS });
    setTel("");
    setUrl("");
    setNote("");
    setPrice("");
    setHasSauna(false);
    setIs24h(false);
  }

  function handleMapClick(e: MapMouseEvent) {
    const ll = e.detail.latLng;
    if (ll) setDraft({ lat: ll.lat, lng: ll.lng });
  }

  async function handleSave() {
    if (!name.trim()) {
      setMessage("名前を入力してください");
      return;
    }
    if (!draft) {
      setMessage("地図をタップして位置を指定してください");
      return;
    }
    setSaving(true);
    setMessage(null);
    const body: Record<string, unknown> = {
      name,
      address,
      hours,
      tel,
      url,
      note,
      lat: draft.lat,
      lng: draft.lng,
    };
    if (kind === "sento") {
      body.price = price.trim() ? Number(price) : undefined;
      body.hasSauna = hasSauna;
    } else {
      body.is24h = is24h;
    }

    const res = await fetch(`/api/tourism/${kind}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      resetForm();
      setMessage("保存しました");
      reload();
    } else {
      const j = await res.json().catch(() => ({}));
      setMessage(`保存に失敗: ${j.error ?? res.status}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    const res = await fetch(`/api/tourism/${kind}?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (res.ok) reload();
    else setMessage("削除に失敗しました");
  }

  return (
    <div className="pb-10">
      <div className="px-4 pt-3">
        <h2 className="text-lg font-bold">
          {cfg.emoji} {cfg.title}の管理
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          地図をタップして位置を指定 → 下で情報を入力して「保存」
        </p>
      </div>

      <GoogleMapProvider>
        <div className="mt-2 aspect-square w-full sm:aspect-[16/10]">
          <Map
            defaultCenter={KOCHI_CENTER}
            defaultZoom={14}
            mapId={GOOGLE_MAPS_MAP_ID || undefined}
            gestureHandling="greedy"
            onClick={handleMapClick}
          >
            {spots.map((s) => (
              <AdvancedMarker
                key={s.id}
                position={s.position}
                title={s.name}
              >
                <span className="text-2xl">{cfg.emoji}</span>
              </AdvancedMarker>
            ))}
            {draft && (
              <AdvancedMarker position={draft} title="ここに追加">
                <span className="flex h-7 w-7 animate-pulse items-center justify-center rounded-full border-2 border-white bg-black text-white shadow">
                  ＋
                </span>
              </AdvancedMarker>
            )}
          </Map>
        </div>
      </GoogleMapProvider>

      {/* フォーム */}
      <div className="mt-4 px-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <label className="mb-1 block text-xs text-gray-500">名前 *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />

          <label className="mb-1 block text-xs text-gray-500">住所</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />

          <div className="mb-3">
            <HoursEditor value={hours} onChange={setHours} />
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">電話</label>
              <input
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder="088-000-0000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            {kind === "sento" && (
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  入浴料(円)
                </label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>

          {kind === "sento" && (
            <label className="mb-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hasSauna}
                onChange={(e) => setHasSauna(e.target.checked)}
              />
              サウナあり
            </label>
          )}
          {kind === "laundry" && (
            <label className="mb-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={is24h}
                onChange={(e) => setIs24h(e.target.checked)}
              />
              24時間営業
            </label>
          )}

          <label className="mb-1 block text-xs text-gray-500">
            URL（任意）
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />

          <label className="mb-1 block text-xs text-gray-500">
            メモ（任意）
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />

          <p className="mb-3 text-xs text-gray-400">
            位置:{" "}
            {draft
              ? `${draft.lat.toFixed(6)}, ${draft.lng.toFixed(6)}`
              : "未指定（地図をタップ）"}
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-yosakoi py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
            >
              クリア
            </button>
          </div>
          {message && <p className="mt-2 text-xs text-gray-600">{message}</p>}
        </div>
      </div>

      {/* 一覧 */}
      <div className="mt-4 px-4">
        <h3 className="mb-2 text-sm font-bold">
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
                className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white p-2 text-sm shadow-sm"
              >
                <span className="text-xl">{cfg.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.address}</p>
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
    </div>
  );
}
