import { NextResponse } from "next/server";
import { checkAdminHeader } from "@/lib/adminAuth";
import { getAdminClient, isAdminConfigured } from "@/lib/supabaseAdmin";
import type { TourismKind } from "@/types";
import type { Audience } from "@/config/navigation";
import {
  parseEditTarget,
  writeAudiences,
  type EditTarget,
} from "@/lib/adminAudience";
import type { SupabaseClient } from "@supabase/supabase-js";

const KINDS: TourismKind[] = ["sento", "laundry", "taxi"];

function isKind(v: string): v is TourismKind {
  return (KINDS as string[]).includes(v);
}

/**
 * 対象の行と、もう一方の系統にある「同じ内容の行」のID一覧を返す。
 *
 * 2系統は同じ内容を別行として持っており、行同士をつなぐ列は無いため、
 * 中身で対を探す。観光データは追加と削除だけで内容の書き換えが無いので、
 * 名前（＋座標）が一致すれば同じものとみなせる。
 * 見つからなければ対象の1件だけを返すため、取り違えて消すことはない。
 */
async function targetIds(
  supabase: SupabaseClient,
  kind: TourismKind,
  id: string,
  target: EditTarget,
): Promise<string[]> {
  if (target !== "both") return [id];

  const columns = kind === "taxi" ? "name, tel, audience" : "name, lat, lng, audience";
  const { data: row } = await supabase
    .from(kind)
    .select(columns)
    .eq("id", id)
    .single<Record<string, unknown>>();
  if (!row) return [id];

  let query = supabase
    .from(kind)
    .select("id")
    .eq("name", row.name as string)
    .neq("audience", row.audience as string);
  query =
    kind === "taxi"
      ? query.eq("tel", row.tel as string)
      : query.eq("lat", row.lat as number).eq("lng", row.lng as number);

  const { data: twins } = await query;
  return [id, ...(twins ?? []).map((t) => t.id as string)];
}

/** 種類ごとに、リクエストボディ → 挿入する行 に変換する */
function buildRow(
  kind: TourismKind,
  b: Record<string, unknown>,
  audience: Audience,
) {
  const str = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;

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
  // 「両方」なら系統ごとに1行ずつ入れ、2つのサイトに同じ内容が載るようにする
  const target = parseEditTarget(body.audience);
  const rows = writeAudiences(target).map((a) => buildRow(kind, body, a));
  if (rows.some((r) => r === null)) {
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
    .insert(rows as never)
    .select();
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

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const supabase = getAdminClient();
  // 「両方」なら、もう一方の系統にある同じ内容も一緒に消す
  const ids = await targetIds(
    supabase,
    kind,
    id,
    parseEditTarget(url.searchParams.get("audience")),
  );
  const { error } = await supabase.from(kind).delete().in("id", ids);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
