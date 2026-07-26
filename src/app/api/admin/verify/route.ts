import { NextResponse } from "next/server";
import { isValidAdminPassword } from "@/lib/adminAuth";

/** 管理者パスワードの照合だけを行う（画面のロック解除用） */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const ok = isValidAdminPassword(body?.password);
  return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
}
