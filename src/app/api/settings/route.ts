import { NextResponse } from "next/server";
import { checkAdminHeader } from "@/lib/adminAuth";
import { getAdminClient, isAdminConfigured } from "@/lib/supabaseAdmin";

/** 許可する設定キー */
const ALLOWED_KEYS = [
  "sento_map_url",
  "sento_desc",
  "laundry_map_url",
  "laundry_desc",
];

/**
 * アプリ設定の保存（upsert）。
 * body: { key, value }
 */
export async function POST(req: Request) {
  if (!checkAdminHeader(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabaseが未設定です" },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.key !== "string" || !ALLOWED_KEYS.includes(body.key)) {
    return NextResponse.json({ error: "invalid key" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { error } = await supabase
    .from("app_settings")
    .upsert(
      {
        key: body.key,
        value: typeof body.value === "string" ? body.value : "",
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "key" },
    );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
