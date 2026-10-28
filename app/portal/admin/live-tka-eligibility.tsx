"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import AdminSidebar from "./admin-sidebar";

type Attempt = { id: string; status: string; startedAt: string | null; submittedAt: string | null; schedule: { scheduledAt: string; status: string; tkaTest: { name: string } } | null };
type Applicant = { id: string; registrationNumber: string | null; status: string; student: { profile: { fullName: string | null } | null }; statusHistory: { status: string; notes: string | null; createdAt: string }[]; tkaAttempts: Attempt[]; tkaResults: { totalScore: number | null; publishedAt: string | null }[] };
type Data = { durationMinutes: number | null; applications: Applicant[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } };

export default function LiveTkaEligibility() {
  const [data, setData] = useState<Data | null>(null); const [duration, setDuration] = useState(""); const [reasons, setReasons] = useState<Record<string, string>>({}); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(""); const [message, setMessage] = useState(""); const [page, setPage] = useState(1);
  const load = useCallback(async () => {
    setLoading(true);
    try { const [a, c] = await Promise.all([fetch(`/api/admin/tka/eligibility?page=${page}`, { cache: "no-store" }), fetch("/api/admin/tka/configuration", { cache: "no-store" })]); const body = await a.json(); const config = await c.json(); if (!a.ok) throw new Error(body.error || "Peserta TKA belum dapat dimuat."); if (!c.ok) throw new Error(config.error || "Konfigurasi TKA belum dapat dimuat."); setData(body); setDuration(config.durationMinutes ? String(config.durationMinutes) : ""); setMessage(""); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Data TKA belum dapat dimuat."); }
    finally { setLoading(false); }
  }, [page]);
  useEffect(() => { const id = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(id); }, [load]);
  async function save(url: string, method: string, body: unknown, success: string) {
    setBusy(url); setMessage("");
    try { const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const result = await response.json().catch(() => null); if (!response.ok) throw new Error(result?.error || "Perubahan gagal disimpan."); await load(); setMessage(success); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Perubahan gagal disimpan."); }
    finally { setBusy(""); }
  }
  function saveDuration(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const n = Number(duration); if (!Number.isSafeInteger(n) || n < 1 || n > 1440) { setMessage("Durasi harus berupa bilangan bulat 1–1440 menit."); return; } if (window.confirm(`Simpan durasi TKA ${n} menit? Perubahan berlaku juga pada attempt yang masih berjalan.`)) void save("/api/admin/tka/configuration", "PUT", { durationMinutes: n }, "Durasi TKA tersimpan."); }
  function grant(event: FormEvent<HTMLFormElement>, applicant: Applicant) { event.preventDefault(); const reason = reasons[applicant.id]?.trim(); if (!reason) { setMessage("Isi alasan penetapan kelayakan."); return; } if (window.confirm(`Tetapkan ${applicant.student.profile?.fullName || applicant.registrationNumber || "peserta"} sebagai layak TKA? Tindakan ini dicatat di riwayat status dan audit.`)) void save("/api/admin/tka/eligibility", "POST", { applicationId: applicant.id, reason }, "Kelayakan peserta diperbarui."); }
  return <main className="admin-dashboard-outer"><div className="admin-dashboard-app"><AdminSidebar active="tkaEligibility" demo={false} /><section className="admin-dashboard-main"><header className="admin-dashboard-header"><div><h1>Kelayakan dan Peserta TKA</h1><p>Penetapan dilakukan satu per satu oleh admin dan dicatat pada riwayat aplikasi.</p></div></header>
    {message && <p role="status">{message}</p>}{loading ? <p role="status">Memuat data TKA…</p> : data && <>
      <form className="admin-announcement-preview" onSubmit={saveDuration}><h2>Durasi sesi</h2><p>Server memakai konfigurasi ini saat menyimpan jawaban dan mengirim sesi. Perubahan durasi juga berlaku pada attempt yang masih berjalan.</p><label>Durasi (menit)<input type="number" required min="1" max="1440" step="1" value={duration} onChange={(e) => setDuration(e.target.value)} /></label><button disabled={!!busy} type="submit">Simpan durasi</button>{!data.durationMinutes && <p>Durasi belum dikonfigurasi; siswa belum dapat memulai TKA.</p>}</form>
      <h2>Peserta dan status ujian</h2><p>Menampilkan {data.pagination.total ? ((data.pagination.page - 1) * data.pagination.pageSize + 1) : 0}–{Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)} dari {data.pagination.total} aplikasi.</p>{!data.applications.length && <p>Belum ada aplikasi yang dapat ditinjau.</p>}
      {data.applications.map((app) => { const attempt = app.tkaAttempts[0]; const result = app.tkaResults[0]; return <article key={app.id} className="admin-announcement-item"><strong>{app.student.profile?.fullName || "Nama belum tersedia"} · {app.registrationNumber || "Nomor belum tersedia"}</strong><p>Status aplikasi: {app.status} · Jadwal: {attempt?.schedule ? `${attempt.schedule.tkaTest.name}, ${new Date(attempt.schedule.scheduledAt).toLocaleString("id-ID")}` : "Belum ada attempt/jadwal"} · Attempt: {attempt?.status || "Belum dimulai"}</p><p>Hasil: {result?.publishedAt ? `${result.totalScore ?? "—"} (dipublikasikan)` : result ? "Tersimpan, belum dipublikasikan" : "Belum ada"}</p>
        {["SUBMITTED", "WAITING_DOCUMENT_VERIFICATION", "DOCUMENT_REVISION_REQUIRED", "DOCUMENT_VERIFIED", "WAITING_PAYMENT", "PAYMENT_VERIFIED", "WAITING_SELECTION"].includes(app.status) && <form onSubmit={(e) => grant(e, app)}><label>Alasan penetapan<input required maxLength={1000} value={reasons[app.id] ?? ""} onChange={(e) => setReasons((old) => ({ ...old, [app.id]: e.target.value }))} /></label><button type="submit" disabled={!!busy}>Tetapkan layak TKA</button></form>}
        {app.statusHistory.length > 0 && <details><summary>Riwayat status dan alasan admin</summary>{app.statusHistory.map((history, index) => <p key={`${history.createdAt}-${index}`}>{new Date(history.createdAt).toLocaleString("id-ID")} · {history.status}{history.notes ? ` · ${history.notes}` : ""}</p>)}</details>}
      </article>; })}
      {data.pagination.totalPages > 1 && <nav aria-label="Halaman peserta TKA"><button type="button" disabled={loading || page <= 1} onClick={() => setPage((value) => value - 1)}>Sebelumnya</button><span> Halaman {page} dari {data.pagination.totalPages} </span><button type="button" disabled={loading || page >= data.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Berikutnya</button></nav>}
    </>}</section></div></main>;
}
