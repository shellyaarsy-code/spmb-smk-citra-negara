"use client";

import { useEffect, useState } from "react";

type Notice = { id: string; title: string; message: string; type: string; isRead: boolean; readAt: string | null; createdAt: string };
export default function LiveNotifications() {
  const [items, setItems] = useState<Notice[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [busy, setBusy] = useState("");
  async function load() {
    setLoading(true);
    try { const response = await fetch("/api/student/notifications", { cache: "no-store" }); const body = await response.json().catch(() => null); if (!response.ok) throw new Error(body?.error || "Notifikasi belum dapat dimuat."); setItems(Array.isArray(body) ? body : []); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Notifikasi belum dapat dimuat."); }
    finally { setLoading(false); }
  }
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);
  async function markRead(id: string) {
    setBusy(id);
    try { const response = await fetch(`/api/student/notifications/${encodeURIComponent(id)}`, { method: "PATCH" }); const body = await response.json().catch(() => null); if (!response.ok) throw new Error(body?.error || "Notifikasi gagal ditandai."); setItems((current) => current.map((item) => item.id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Notifikasi gagal ditandai."); }
    finally { setBusy(""); }
  }
  const unread = items.filter((item) => !item.isRead).length;
  return <section className="student-dashboard-main" aria-label="Notifikasi siswa"><header className="student-dashboard-header"><div><h1>Notifikasi</h1><p>{unread} belum dibaca · notifikasi internal portal</p></div></header>{error && <p role="alert">{error}</p>}{loading ? <p role="status">Memuat notifikasi…</p> : !error && !items.length ? <p role="status">Belum ada notifikasi.</p> : items.map((item) => <article className="student-announcement" key={item.id}><div><strong>{item.title}</strong><span>{item.isRead ? "Dibaca" : "Belum dibaca"}</span></div><time>{new Date(item.createdAt).toLocaleString("id-ID")}</time><p>{item.message}</p>{!item.isRead && <button type="button" disabled={busy === item.id} onClick={() => void markRead(item.id)}>{busy === item.id ? "Menyimpan…" : "Tandai dibaca"}</button>}</article>)}</section>;
}
