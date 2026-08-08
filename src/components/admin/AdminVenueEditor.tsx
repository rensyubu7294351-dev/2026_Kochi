"use client";

import { useCallback, useEffect, useState } from "react";
import { readAudience, type EditTarget } from "@/lib/adminAudience";
import {
  Map,
  AdvancedMarker,
  useMap,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import type { FacilityRow, FacilityType, LatLng, Venue } from "@/types";
import { VENUES, getVenueBySlug } from "@/data/venues";
import { FACILITY_META, FACILITY_ORDER } from "@/config/facilities";
import { DEFAULT_VENUE_ZOOM, GOOGLE_MAPS_MAP_ID } from "@/lib/constants";
import { fetchVenueFacilityRows } from "@/lib/facilities";
import { GoogleMapProvider } from "@/components/map/GoogleMapProvider";
import { VenueTabs } from "@/components/venues/VenueTabs";

/** 会場が変わったら地図を移動 */
function MapController({ venue }: { venue: Venue }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.panTo(venue.center);
    map.setZoom(venue.zoom ?? DEFAULT_VENUE_ZOOM);
  }, [map, venue]);
  return null;
}

/**
 * 座標を打ち込んだ時に、その地点まで地図を動かす。
 * token が増えた時だけ動くので、地図のタップやドラッグの邪魔をしない。
 */
function FocusOnDraft({
  position,
  token,
}: {
  position: LatLng | null;
  token: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map || !position || token === 0) return;
    map.panTo(position);
  }, [map, token]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/**
 * 入力された緯度・経度を読み取る。
 * Googleマップからコピーすると「33.5583, 133.5402」のように2つまとめて
 * 貼られることが多いので、片方の欄にまとめて貼られた場合も受け付ける。
 */
export function parseLatLngInput(
  latText: string,
  lngText: string,
): LatLng | null {
  const nums = `${latText} ${lngText}`
    .replace(/[，、]/g, ",")
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);
  if (nums.length !== 2 || nums.some((n) => !Number.isFinite(n))) return null;
  const [lat, lng] = nums;
  // 地球上にあり得ない値は弾く
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

/** 2地点の距離（m）。打ち間違いに気づけるよう会場からの離れ具合を出す */
function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/**
 * 管理者用の施設ピン編集画面。
 * 使い方: 会場タブ選択 → 地図をタップ（または座標を入力）して位置指定 →
 * 種類/名前を入れて保存。保存内容はSupabaseに書き込まれ、地図に反映される。
 */
export function AdminVenueEditor({
  password,
  audience,
}: {
  password: string;
  audience: EditTarget;
}) {
  const [activeSlug, setActiveSlug] = useState(VENUES[0].slug);
  const venue = getVenueBySlug(activeSlug) ?? VENUES[0];

  const [rows, setRows] = useState<FacilityRow[]>([]);
  const [loading, setLoading] = useState(false);

  // 入力中の下書き。位置は地図タップと座標入力のどちらでも決められる
  const [draft, setDraft] = useState<LatLng | null>(null);
  const [latText, setLatText] = useState("");
  const [lngText, setLngText] = useState("");
  // 座標を打ち込んだ時だけ地図をそこへ動かすための合図
  const [focusToken, setFocusToken] = useState(0);
  const [type, setType] = useState<FacilityType>(FACILITY_ORDER[0]);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 既存ピンの編集
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<FacilityType>(FACILITY_ORDER[0]);
  const [editLabel, setEditLabel] = useState("");
  const [editNote, setEditNote] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    // 「両方」を選んでいる時は、見本としてユーザー用の内容を表示する
    setRows(await fetchVenueFacilityRows(activeSlug, readAudience(audience)));
    setLoading(false);
  }, [activeSlug, audience]);

  useEffect(() => {
    reload();
    clearDraft();
  }, [reload]);

  /** 位置を決める（地図タップ・座標入力の共通処理） */
  function applyDraft(pos: LatLng | null) {
    setDraft(pos);
    setLatText(pos ? String(pos.lat) : "");
    setLngText(pos ? String(pos.lng) : "");
  }

  function clearDraft() {
    applyDraft(null);
  }

  function handleMapClick(e: MapMouseEvent) {
    const ll = e.detail.latLng;
    if (ll) applyDraft({ lat: ll.lat, lng: ll.lng });
  }

  /** 座標欄の入力。打ち途中でもピンが消えないよう、読めた時だけ位置を更新する */
  function handleCoordInput(nextLat: string, nextLng: string) {
    setLatText(nextLat);
    setLngText(nextLng);
    const parsed = parseLatLngInput(nextLat, nextLng);
    if (!parsed) return;
    // 「33.55, 133.54」とまとめて貼られた時は2つの欄に振り分ける
    setLatText(String(parsed.lat));
    setLngText(String(parsed.lng));
    setDraft(parsed);
    setFocusToken((t) => t + 1);
  }

  async function handleSave() {
    if (!draft) {
      setMessage("先に地図をタップするか、座標を入力して位置を指定してください");
      return;
    }
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/facilities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({
        audience,
        venueSlug: activeSlug,
        type,
        label,
        note,
        lat: draft.lat,
        lng: draft.lng,
      }),
    });
    setSaving(false);
    if (res.ok) {
      clearDraft();
      setLabel("");
      setNote("");
      setMessage(
        audience === "both"
          ? "保存しました（ユーザー用・サポーター用の両方）"
          : "保存しました",
      );
      reload();
    } else {
      const j = await res.json().catch(() => ({}));
      setMessage(`保存に失敗: ${j.error ?? res.status}`);
    }
  }

  async function handleDelete(id: string) {
    const warning =
      audience === "both"
        ? "このピンを削除しますか？（ユーザー用・サポーター用の両方から消えます）"
        : "このピンを削除しますか？";
    if (!confirm(warning)) return;
    const res = await fetch(`/api/facilities?id=${id}&audience=${audience}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (res.ok) reload();
    else setMessage("削除に失敗しました");
  }

  function startEdit(r: FacilityRow) {
    setEditingId(r.id);
    setEditType(r.type);
    setEditLabel(r.label ?? "");
    setEditNote(r.note ?? "");
    setMessage(null);
  }

  async function handleUpdate() {
    if (!editingId) return;
    const res = await fetch("/api/facilities", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({
        audience,
        id: editingId,
        type: editType,
        label: editLabel,
        note: editNote,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      setMessage(
        audience === "both"
          ? "更新しました（ユーザー用・サポーター用の両方）"
          : "更新しました",
      );
      reload();
    } else {
      const j = await res.json().catch(() => ({}));
      setMessage(`更新に失敗: ${j.error ?? res.status}`);
    }
  }

  return (
    <div className="pb-10">
      {/* ピンの置き場所になるタブだけ出す（「全体」は置き場所ではないので隠す） */}
      <VenueTabs
        activeSlug={activeSlug}
        onSelect={setActiveSlug}
        showAll={false}
      />

      {/* 地図（タップで位置指定） */}
      <div className="px-4 pt-3">
        <p className="mb-2 text-sm text-gray-600">
          地図をタップ（または下に座標を入力）して位置を指定 → 種類を選んで「保存」
        </p>
      </div>
      <GoogleMapProvider>
        <div className="aspect-square w-full sm:aspect-[16/10]">
          <Map
            defaultCenter={venue.center}
            defaultZoom={venue.zoom ?? DEFAULT_VENUE_ZOOM}
            mapId={GOOGLE_MAPS_MAP_ID || undefined}
            gestureHandling="greedy"
            onClick={handleMapClick}
          >
            <MapController venue={venue} />
            <FocusOnDraft position={draft} token={focusToken} />
            {/* 既存ピン */}
            {rows.map((r) => {
              const meta = FACILITY_META[r.type];
              return (
                <AdvancedMarker
                  key={r.id}
                  position={{ lat: r.lat, lng: r.lng }}
                  title={r.label ?? meta.label}
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/icons/${meta.icon}`}
                      alt={meta.label}
                      width={40}
                      height={51}
                    />
                    <span className="pointer-events-none absolute left-1/2 top-[47px] -translate-x-1/2 whitespace-nowrap rounded-full border border-gray-200 bg-white/95 px-1.5 py-[1px] text-[10px] font-bold leading-tight text-gray-800 shadow-sm">
                      {r.label ?? meta.label}
                    </span>
                  </div>
                </AdvancedMarker>
              );
            })}
            {/* 下書きピン（未保存） */}
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

      {/* 入力フォーム */}
      <div className="mt-4 px-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold">ピンを追加</h2>

          <label className="mb-1 block text-xs text-gray-500">種類</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as FacilityType)}
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {FACILITY_ORDER.map((t) => (
              <option key={t} value={t}>
                {FACILITY_META[t].label}
              </option>
            ))}
          </select>

          <label className="mb-1 block text-xs text-gray-500">
            名前（任意・例: 北側 仮設トイレ）
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />

          <label className="mb-1 block text-xs text-gray-500">
            メモ（任意・例: 22時まで）
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />

          {/* 位置：地図タップでも、座標を直接打ち込んでも決められる */}
          <label className="mb-1 block text-xs text-gray-500">
            位置（地図をタップするか、座標を直接入力）
          </label>
          <div className="mb-1 flex gap-2">
            <input
              value={latText}
              onChange={(e) => handleCoordInput(e.target.value, lngText)}
              inputMode="decimal"
              placeholder="緯度 例: 33.558342"
              aria-label="緯度"
              className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              value={lngText}
              onChange={(e) => handleCoordInput(latText, e.target.value)}
              inputMode="decimal"
              placeholder="経度 例: 133.540268"
              aria-label="経度"
              className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <p className="mb-3 text-xs text-gray-400">
            {draft ? (
              <>
                この位置に置きます（{venue.name} から
                {distanceMeters(venue.center, draft) >= 1000
                  ? `約${(distanceMeters(venue.center, draft) / 1000).toFixed(1)}km`
                  : `約${distanceMeters(venue.center, draft)}m`}
                ）
                {distanceMeters(venue.center, draft) > 3000 && (
                  <span className="font-bold text-orange-600">
                    {" "}
                    ⚠️ 会場から離れています。座標の入れ違いにご注意ください
                  </span>
                )}
              </>
            ) : latText || lngText ? (
              "緯度・経度の数字を確認してください（例: 33.558342 と 133.540268）"
            ) : (
              "未指定（地図をタップ、または上に座標を入力）"
            )}
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !draft}
              className="flex-1 rounded-lg bg-yosakoi py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              onClick={clearDraft}
              disabled={!draft && !latText && !lngText}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm disabled:opacity-50"
            >
              クリア
            </button>
          </div>
          {message && (
            <p className="mt-2 text-xs text-gray-600">{message}</p>
          )}
        </div>
      </div>

      {/* 既存ピン一覧 */}
      <div className="mt-4 px-4">
        <h2 className="mb-2 text-sm font-bold">
          {venue.name} のピン（{rows.length}件）
        </h2>
        {loading ? (
          <p className="text-xs text-gray-400">読み込み中...</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-gray-400">まだピンがありません。</p>
        ) : (
          <ul className="grid gap-2">
            {rows.map((r) => {
              const meta = FACILITY_META[r.type];
              const editing = editingId === r.id;
              return (
                <li
                  key={r.id}
                  className="rounded-lg border border-gray-100 bg-white p-2 text-sm shadow-sm"
                >
                  {editing ? (
                    // 編集フォーム（アイコン種別・ラベル・メモ）
                    <div className="space-y-2">
                      <label className="block text-xs text-gray-500">
                        アイコン（種類）
                      </label>
                      <select
                        value={editType}
                        onChange={(e) =>
                          setEditType(e.target.value as FacilityType)
                        }
                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                      >
                        {FACILITY_ORDER.map((t) => (
                          <option key={t} value={t}>
                            {FACILITY_META[t].label}
                          </option>
                        ))}
                      </select>
                      <input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        placeholder="ラベル名（任意）"
                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                      />
                      <input
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="メモ（任意）"
                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdate}
                          className="flex-1 rounded-lg bg-yosakoi py-1.5 text-xs font-bold text-white"
                        >
                          更新
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs text-gray-500"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/images/icons/${meta.icon}`}
                        alt=""
                        width={22}
                        height={28}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{r.label || meta.label}</p>
                        {r.note && (
                          <p className="text-xs text-gray-500">{r.note}</p>
                        )}
                      </div>
                      <button
                        onClick={() => startEdit(r)}
                        className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-500"
                      >
                        削除
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
