import { NextResponse } from "next/server";
import { checkAdminHeader } from "@/lib/adminAuth";
import { getAdminClient, isAdminConfigured } from "@/lib/supabaseAdmin";
import { FACILITY_META } from "@/config/facilities";
import type { FacilityType } from "@/types";
import { AUDIENCES, type Audience } from "@/config/navigation";

const VALID_TYPES = Object.keys(FACILITY_META) as FacilityType[];

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
  // 系統（ユーザー用 / サポーター用）。未指定は従来どおりユーザー用
  const audience: Audience = AUDIENCES.includes(body.audience)
    ? body.audience
    : "user";

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
  const { data, error } = await supabase
    .from("facilities")
    .insert({
      venue_slug: venueSlug,
      type,
      label: label?.trim() || null,
      note: note?.trim() || null,
      lat,
      lng,
      audience,
    })
    .select()
    .single();

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
  const { data, error } = await supabase
    .from("facilities")
    .update(patch)
    .eq("id", body.id)
    .select()
    .single();
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

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { error } = await supabase.from("facilities").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
