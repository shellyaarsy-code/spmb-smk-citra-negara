"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type Notice = { id: string; title: string; content: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; publishedAt: string | null; updatedAt: string };
type Draft = { title: string; content: string };
const blank: Draft = { title: "", content: "" };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers }, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Permintaan gagal diproses.");
  return data as T;
}

export default function LiveAnnouncementManager() {
  const [items, setItems] = useState<Notice[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Draft>(blank);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const selected = items.find((item) => item.id === selectedId) ?? null;

  const refresh = useCallback(async (preserveId?: string | null) => {
    setLoading(true);
    try {
      const next = await request<Notice[]>("/api/admin/announcements");
      setItems(next);
      setSelectedId((current) => {
        const desired = preserveId === undefined ? current : preserveId;
        return desired && next.some((item) => item.id === desired) ? desired : next[0]?.id ?? null;
      });
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pengumuman gagal dimuat."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => { void refresh(); }, 0); return () => window.clearTimeout(timer); }, [refresh]);

  function startCreate() { setSelectedId(null); setForm(blank); setEditing(true); setMessage(""); setError(""); }
  function startEdit() { if (!selected || selected.status !== "DRAFT") return; setForm({ title: selected.title, content: selected.content }); setEditing(true); setMessage(""); }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const saved = selectedId
        ? await request<Notice>(`/api/admin/announcements/${selectedId}`, { method: "PATCH", body: JSON.stringify(form) })
        : await request<Notice>("/api/admin/announcements", { method: "POST", body: JSON.stringify(form) });
      await refresh(saved.id); setEditing(false); setMessage("Draft pengumuman tersimpan.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pengumuman gagal disimpan."); }
    finally { setSaving(false); }
  }
  async function changeStatus(status: "PUBLISHED" | "ARCHIVED") {
    if (!selected) return;
    setSaving(true); setError(""); setMessage("");
    try { const saved = await request<Notice>(`/api/admin/announcements/${selected.id}`, { method: "PATCH", body: JSON.stringify({ status }) }); await refresh(saved.id); setMessage(status === "PUBLISHED" ? "Pengumuman kini tampil pada portal siswa." : "Pengumuman diarsipkan."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Status gagal diperbarui."); }
    finally { setSaving(false); }
  }
  async function removeDraft() {
    if (!selected || selected.status !== "DRAFT" || !window.confirm("Hapus draft pengumuman ini?")) return;
    setSaving(true); setError("");
    try { await request(`/api/admin/announcements/${selected.id}`, { method: "DELETE" }); await refresh(null); setMessage("Draft dihapus."); setEditing(false); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Draft gagal dihapus."); }
    finally { setSaving(false); }
  }

  return <>
    <header className="admin-dashboard-header admin-bank-header"><div className="admin-dashboard-heading"><h1>Kelola Pengumuman</h1><p>Buat draft, terbitkan untuk portal siswa, atau arsipkan pengumuman.</p></div><button className="admin-bank-button primary" type="button" onClick={startCreate}>Tulis Pengumuman</button></header>
    {error && <p role="alert" className="admin-announcement-notice">{error}</p>}{message && <p role="status" className="admin-announcement-notice">{message}</p>}
    <div className="admin-announcement-layout">
      <section className="admin-announcement-history" aria-label="Daftar pengumuman"><div className="admin-announcement-history-heading"><h2>Pengumuman tersimpan</h2></div>
        {loading ? <p role="status">Memuat pengumuman…</p> : error && !items.length ? <p>Daftar pengumuman tidak dapat dimuat.</p> : items.length ? <div className="admin-announcement-list">{items.map((item) => <button key={item.id} type="button" className={`admin-announcement-item ${selectedId === item.id ? "selected" : ""}`} onClick={() => { setSelectedId(item.id); setEditing(false); setMessage(""); }} aria-pressed={selectedId === item.id}><div className="admin-announcement-item-meta"><span>{new Date(item.updatedAt).toLocaleString("id-ID")}</span><span className={`admin-announcement-status ${item.status.toLowerCase()}`}>{item.status}</span></div><strong>{item.title}</strong></button>)}</div> : <p>Belum ada pengumuman. Buat draft pertama.</p>}
      </section>
      <section className="admin-announcement-preview" aria-label="Detail pengumuman">
        {editing ? <form onSubmit={save}><h2>{selectedId ? "Edit draft" : "Pengumuman baru"}</h2><label>Judul<input required maxLength={200} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label>Isi<textarea required maxLength={10000} rows={12} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></label><p>Pengumuman disimpan sebagai draft. Tidak ada notifikasi eksternal yang dikirim.</p><button className="admin-bank-button primary" type="submit" disabled={saving}>{saving ? "Menyimpan…" : "Simpan draft"}</button><button className="admin-bank-button secondary" type="button" onClick={() => setEditing(false)} disabled={saving}>Batal</button></form>
          : selected ? <><div className="admin-announcement-preview-top"><div><h2>{selected.title}</h2><p>Status: {selected.status}{selected.publishedAt ? ` · Terbit ${new Date(selected.publishedAt).toLocaleString("id-ID")}` : ""}</p></div><div className="admin-announcement-preview-actions">{selected.status === "DRAFT" && <><button type="button" className="admin-bank-button secondary" onClick={startEdit}>Edit draft</button><button type="button" className="admin-bank-button primary" onClick={() => void changeStatus("PUBLISHED")} disabled={saving}>Terbitkan</button><button type="button" className="admin-bank-button secondary" onClick={() => void removeDraft()} disabled={saving}>Hapus draft</button></>}{selected.status === "PUBLISHED" && <button type="button" className="admin-bank-button secondary" onClick={() => void changeStatus("ARCHIVED")} disabled={saving}>Arsipkan</button>}</div></div><article className="admin-announcement-article">{selected.content.split("\n").map((line, index) => <p key={index}>{line || " "}</p>)}</article></>
          : <div className="admin-announcement-empty"><h2>{loading ? "Memuat…" : "Pilih pengumuman"}</h2><p>Pilih item pada daftar atau buat pengumuman baru.</p></div>}
      </section>
    </div>
  </>;
}
