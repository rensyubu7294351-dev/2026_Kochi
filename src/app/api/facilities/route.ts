import { NextResponse } from "next/server";
import { checkAdminHeader } from "@/lib/adminAuth";
import { getAdminClient, isAdminConfigured } from "@/lib/supabaseAdmin";
import { FACILITY_META } from "@/config/facilities";
import type { FacilityType } from "@/types";
import {
  parseEditTarget,
  writeAudiences,
  type EditTarget,
} from "@/lib/adminAudience";
import type { SupabaseClient } from "@supabase/supabase-js";

const VALID_TYPES = Object.keys(FACILITY_META) as FacilityType[];

/**
 * 対象のピンと、もう一方の系統にある「同じピン」のID一覧を返す。
 *
 * 2系統は同じ内容を別行として持っており、行同士をつなぐ列は無い。
 * ピンの位置は編集できない（種類・名前・メモだけ変更できる）ので、
 * 会場と座標が一致する行を対になるピンとみなす。
 * 見つからなければ対象の1件だけを返すため、取り違えて消すことはない。
 */
async function targetIds(
  supabase: SupabaseClient,
  id: string,
  target: EditTarget,
): Promise<string[]> {
  if (target !== "both") return [id];

  const { data: row } = await supabase
    .from("facilities")
    .select("venue_slug, lat, lng, audience")
    .eq("id", id)
    .single();
  if (!row) return [id];

  const { data: twins } = await supabase
    .from("facilities")
    .select("id")
    .eq("venue_slug", row.venue_slug)
    .eq("lat", row.lat)
    .eq("lng", row.lng)
    .neq("audience", row.audience);

  return [id, ...(twins ?? []).map((t) => t.id as string)];
}

/**
 * 施設ピンの新規追加。
 * パスワードは x-admin-password ヘッダーでサーバー側照合。
 */
export async function POST(req: Request) {
  if (!checkAdminHeader(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabaseが未設定です（.env.localのSUPABASE設定を確認）" },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { venueSlug, type, label, note, lat, lng } = body;
  // 編集対象（ユーザー用 / サポーター用 / 両方）。未指定は従来どおりユーザー用
  const target = parseEditTarget(body.audience);

  if (
    typeof venueSlug !== "string" ||
    !VALID_TYPES.includes(type) ||
    typeof lat !== "number" ||
    typeof lng !== "number"
  ) {
    return NextResponse.json(
      { error: "必須項目（venueSlug/type/lat/lng）が不正です" },
      { status: 400 },
    );
  }

  const supabase = getAdminClient();
  // 「両方」なら系統ごとに1行ずつ入れ、2つのサイトに同じピンが立つようにする
  const { data, error } = await supabase
    .from("facilities")
    .insert(
      writeAudiences(target).map((audience) => ({
        venue_slug: venueSlug,
        type,
        label: label?.trim() || null,
        note: note?.trim() || null,
        lat,
        lng,
        audience,
      })),
    )
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 201 });
}

/**
 * 施設ピンの更新（アイコン種別・ラベル・メモ）。
 * body: { id, type?, label?, note? }
 */
export async function PATCH(req: Request) {
  if (!checkAdminHeader(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabaseが未設定です（.env.localのSUPABASE設定を確認）" },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.id !== "string") {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.type !== undefined) {
    if (!VALID_TYPES.includes(body.type)) {
      return NextResponse.json({ error: "invalid type" }, { status: 400 });
    }
    patch.type = body.type;
  }
  if (body.label !== undefined) {
    patch.label =
      typeof body.label === "string" && body.label.trim()
        ? body.label.trim()
        : null;
  }
  if (body.note !== undefined) {
    patch.note =
      typeof body.note === "string" && body.note.trim()
        ? body.note.trim()
        : null;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "更新項目がありません" }, { status: 400 });
  }

  const supabase = getAdminClient();
  // 「両方」なら、もう一方の系統にある同じピンも一緒に直す
  const ids = await targetIds(supabase, body.id, parseEditTarget(body.audience));
  const { data, error } = await supabase
    .from("facilities")
    .update(patch)
    .in("id", ids)
    .select();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

/** 施設ピンの削除（?id=... ） */
export async function DELETE(req: Request) {
  if (!checkAdminHeader(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabaseが未設定です（.env.localのSUPABASE設定を確認）" },
      { status: 503 },
    );
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = getAdminClient();
  // 「両方」なら、もう一方の系統にある同じピンも一緒に消す
  const ids = await targetIds(
    supabase,
    id,
    parseEditTarget(url.searchParams.get("audience")),
  );
  const { error } = await supabase.from("facilities").delete().in("id", ids);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
