import { NextResponse } from "next/server";
import { checkAdminHeader } from "@/lib/adminAuth";
import { getAdminClient, isAdminConfigured } from "@/lib/supabaseAdmin";
import type { TourismKind } from "@/types";
import { AUDIENCES, type Audience } from "@/config/navigation";

const KINDS: TourismKind[] = ["sento", "laundry", "taxi"];

function isKind(v: string): v is TourismKind {
  return (KINDS as string[]).includes(v);
}

/** 種類ごとに、リクエストボディ → 挿入する行 に変換する */
function buildRow(kind: TourismKind, b: Record<string, unknown>) {
  const str = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;
  // 系統（ユーザー用 / サポーター用）。未指定は従来どおりユーザー用
  const audience: Audience = AUDIENCES.includes(b.audience as Audience)
    ? (b.audience as Audience)
    : "user";

  if (kind === "taxi") {
    if (typeof b.name !== "string" || typeof b.tel !== "string") return null;
    return {
      name: b.name.trim(),
      tel: b.tel.trim(),
      note: str(b.note),
      url: str(b.url),
      audience,
    };
  }

  // sento / laundry 共通
  if (
    typeof b.name !== "string" ||
    typeof b.lat !== "number" ||
    typeof b.lng !== "number"
  ) {
    return null;
  }
  const base = {
    name: b.name.trim(),
    address: str(b.address),
    lat: b.lat,
    lng: b.lng,
    hours: b.hours ?? null,
    tel: str(b.tel),
    url: str(b.url),
    note: str(b.note),
    audience,
  };
  if (kind === "sento") {
    return {
      ...base,
      price: typeof b.price === "number" ? b.price : null,
      has_sauna: Boolean(b.hasSauna),
      access: str(b.access),
      map_url: str(b.mapUrl),
    };
  }
  return { ...base, is_24h: Boolean(b.is24h) };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const { kind } = await params;
  if (!isKind(kind)) {
    return NextResponse.json({ error: "unknown kind" }, { status: 404 });
  }
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
  const row = buildRow(kind, body);
  if (!row) {
    return NextResponse.json(
      { error: "必須項目が不足しています" },
      { status: 400 },
    );
  }

  const supabase = getAdminClient();
  // kind がユニオン型のため insert の型推論が効かない。行の形はサーバーで
  // 検証済みなので never にキャストして通す（DB型は未生成）。
  const { data, error } = await supabase
    .from(kind)
    .insert(row as never)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const { kind } = await params;
  if (!isKind(kind)) {
    return NextResponse.json({ error: "unknown kind" }, { status: 404 });
  }
  if (!checkAdminHeader(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabaseが未設定です" },
      { status: 503 },
    );
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const supabase = getAdminClient();
  const { error } = await supabase.from(kind).delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
