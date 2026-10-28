"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "./admin-sidebar";

type Payment = { id: string; referenceNumber: string; amount: string | number | null; paymentMethod: string | null; paymentDestination: string | null; status: string; paymentProofFileName: string | null; paymentProofSize: number | null; application: { registrationNumber: string | null; student: { profile: { fullName: string | null } | null } }; statusHistory: { status: string; notes: string | null; createdAt: string }[] };
type PaymentConfig = { configured: boolean; amount: number | null; method: string; destination: string };
export default function LivePaymentReview() {
  const [rows, setRows] = useState<Payment[]>([]); const [config, setConfig] = useState<PaymentConfig | null>(null); const [amount, setAmount] = useState(""); const [method, setMethod] = useState(""); const [destination, setDestination] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [busy, setBusy] = useState(""); const [reasons, setReasons] = useState<Record<string, string>>({});
  async function load() {
    setLoading(true);
    try { const [response, configResponse] = await Promise.all([fetch("/api/admin/payments", { cache: "no-store" }), fetch("/api/admin/payments/settings", { cache: "no-store" })]); const data = await response.json().catch(() => null); const settings = await configResponse.json().catch(() => null); if (!response.ok) throw new Error(data?.error || "Pembayaran belum dapat dimuat."); if (!configResponse.ok) throw new Error(settings?.error || "Konfigurasi pembayaran belum dapat dimuat."); setRows(Array.isArray(data) ? data : []); setConfig(settings); setAmount(settings.amount ? String(settings.amount) : ""); setMethod(settings.method || ""); setDestination(settings.destination || ""); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Pembayaran belum dapat dimuat."); }
    finally { setLoading(false); }
  }
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);
  async function decide(row: Payment, status: "VERIFIED" | "REJECTED") {
    setBusy(row.id); setError("");
    try { const response = await fetch(`/api/admin/payments/${encodeURIComponent(row.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, reason: reasons[row.id] ?? "" }) }); const data = await response.json().catch(() => null); if (!response.ok) throw new Error(data?.error || "Status pembayaran gagal disimpan."); await load(); setError("Status pembayaran dan riwayat audit telah disimpan."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Status pembayaran gagal disimpan."); }
    finally { setBusy(""); }
  }
  async function saveSettings(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const amountValue = Number(amount); if (!Number.isSafeInteger(amountValue) || amountValue <= 0 || !method.trim() || !destination.trim()) { setError("Isi nominal rupiah positif, metode, dan tujuan pembayaran dengan benar."); return; } if (!window.confirm("Simpan kebijakan pembayaran sekolah? Tagihan yang sudah dibuat tetap memakai snapshot sebelumnya.")) return; setBusy("settings"); setError(""); try { const response = await fetch("/api/admin/payments/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: amountValue, method, destination }) }); const data = await response.json().catch(() => null); if (!response.ok) throw new Error(data?.error || "Konfigurasi belum dapat disimpan."); setConfig(data); setError("Konfigurasi pembayaran tersimpan dan tercatat di audit."); } catch (cause) { setError(cause instanceof Error ? cause.message : "Konfigurasi belum dapat disimpan."); } finally { setBusy(""); } }
  return <main className="admin-dashboard-outer"><div className="admin-dashboard-app"><AdminSidebar active="payments" demo={false} /><section className="admin-dashboard-main">
    <header className="admin-dashboard-header"><div><h1>Verifikasi Pembayaran</h1><p>Pemeriksaan tagihan dan bukti pembayaran. Bukti hanya tersedia jika storage privat terkonfigurasi.</p></div></header>
    {error && <p role="status">{error}</p>}{loading && <p role="status">Memuat pembayaran…</p>}
    {!loading && <form className="admin-announcement-preview" onSubmit={saveSettings}><h2>Pengaturan pembayaran</h2><p>Nilai ini digunakan server saat membuat invoice baru. Invoice yang sudah ada mempertahankan nilai saat dibuat.</p>{!config?.configured && <p>Konfigurasi belum tersedia; siswa belum dapat membuat invoice.</p>}<label>Nominal (rupiah)<input type="number" min="1" step="1" required value={amount} onChange={(e) => setAmount(e.target.value)} /></label><label>Metode<input maxLength={120} required value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Metode sesuai kebijakan sekolah" /></label><label>Tujuan pembayaran<input maxLength={300} required value={destination} onChange={(e) => setDestination(e.target.value)} /></label><button type="submit" disabled={!!busy}>Simpan pengaturan</button></form>}
    {!loading && !error && !rows.length && <p role="status">Belum ada pembayaran tercatat.</p>}
    {rows.map((row) => <article className="admin-announcement-item" key={row.id}>
      <strong>{row.application.student.profile?.fullName || "Nama belum tersedia"} · {row.application.registrationNumber || "Nomor pendaftaran belum tersedia"}</strong>
      <p>Ref: {row.referenceNumber} · {row.amount == null ? "Nominal belum tersedia" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(row.amount))} · {row.paymentMethod || "Metode belum tersedia"} · Tujuan {row.paymentDestination || "belum tersedia"} · Status {row.status}</p>
      {row.paymentProofFileName ? <a href={`/api/admin/payments/${encodeURIComponent(row.id)}`} download>{row.paymentProofFileName}{row.paymentProofSize ? ` (${Math.ceil(row.paymentProofSize / 1024)} KB)` : ""}</a> : <p>Bukti pembayaran belum tersedia.</p>}
      {row.status === "PENDING" && <div><label>Alasan penolakan<input maxLength={1000} value={reasons[row.id] ?? ""} onChange={(event) => setReasons((current) => ({ ...current, [row.id]: event.target.value }))} /></label><button type="button" disabled={busy === row.id || !row.paymentProofFileName} onClick={() => void decide(row, "VERIFIED")}>Verifikasi</button><button type="button" disabled={busy === row.id || !row.paymentProofFileName || !(reasons[row.id] ?? "").trim()} onClick={() => void decide(row, "REJECTED")}>Tolak</button></div>}
      <details><summary>Riwayat status</summary>{row.statusHistory.map((item, index) => <p key={`${item.createdAt}-${index}`}>{new Date(item.createdAt).toLocaleString("id-ID")} · {item.status}{item.notes ? ` · ${item.notes}` : ""}</p>)}</details>
    </article>)}
  </section></div></main>;
}
