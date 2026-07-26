"use client";

import { useEffect, useState } from "react";
import { AdminDashboard } from "./AdminDashboard";

const STORAGE_KEY = "yosakoi-admin-pw";

/**
 * 管理者画面のパスワードロック。
 * 入力されたパスワードはサーバー(/api/admin/verify)で照合する。
 * 照合OKなら sessionStorage に保持し、以降の書き込みAPIに添付する。
 * （タブを閉じると解除される）
 */
export function AdminGate() {
  const [password, setPassword] = useState("");
  const [unlockedPw, setUnlockedPw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // リロード時：保存済みパスワードがあれば再検証して自動ロック解除
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    verify(saved).then((ok) => {
      if (ok) setUnlockedPw(saved);
      else sessionStorage.removeItem(STORAGE_KEY);
    });
  }, []);

  async function verify(pw: string): Promise<boolean> {
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    return res.ok;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const ok = await verify(password);
    setLoading(false);
    if (ok) {
      sessionStorage.setItem(STORAGE_KEY, password);
      setUnlockedPw(password);
    } else {
      setError("パスワードが違います");
    }
  }

  function lock() {
    sessionStorage.removeItem(STORAGE_KEY);
    setUnlockedPw(null);
    setPassword("");
  }

  if (unlockedPw) {
    return <AdminDashboard password={unlockedPw} onLock={lock} />;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <h1 className="mb-1 text-lg font-bold">管理者ログイン</h1>
        <p className="mb-4 text-xs text-gray-500">
          施設ピンを編集するにはパスワードが必要です。
        </p>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yosakoi"
        />
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="mt-4 w-full rounded-lg bg-yosakoi py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? "確認中..." : "ログイン"}
        </button>
      </form>
    </main>
  );
}
