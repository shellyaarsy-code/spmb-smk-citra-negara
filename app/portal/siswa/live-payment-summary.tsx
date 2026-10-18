"use client";

import { useEffect, useState, type ChangeEvent } from "react";

type Payment = { referenceNumber: string; amount: string | number | null; status: string; hasProof: boolean; statusHistory: { status: string; notes: string | null; createdAt: string }[] };
type Summary = { configured: boolean; proofUploadEnabled: boolean; instructions: { amount: number | null; method: string | null; destination: string | null } | null; payment: Payment | null };

export default function LivePaymentSummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [message, setMessage] = useState("Memuat status tagihan…");
  const [busy, setBusy] = useState(false);
  const [proofBusy, setProofBusy] = useState(false);
  async function load() {
    try {
      const response = await fetch("/api/student/payment", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Status pembayaran belum dapat dimuat.");
      setSummary(data); setMessage("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Status pembayaran belum dapat dimuat."); }
  }
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);
  async function createInvoice() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/student/payment", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Tagihan belum dapat dibuat.");
      await load();
      setMessage("Tagihan tercatat. Ikuti metode pembayaran yang ditetapkan sekolah.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Tagihan belum dapat dibuat."); }
    finally { setBusy(false); }
  }
  async function uploadProof(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setProofBusy(true); setMessage("");
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/student/payment/proof", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Bukti pembayaran belum dapat dikirim.");
      await load(); setMessage("Bukti pembayaran dikirim untuk verifikasi.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Bukti pembayaran belum dapat dikirim."); }
    finally { setProofBusy(false); event.target.value = ""; }
  }
  return <section className="payment-fee-card" aria-label="Status tagihan dari server">
    <h2>Status Tagihan</h2>
    {message && <p role="status">{message}</p>}
    {summary?.instructions && <dl><div><dt>Nominal</dt><dd>{summary.instructions.amount === null ? "Belum tersedia" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(summary.instructions.amount)}</dd></div><div><dt>Metode</dt><dd>{summary.instructions.method || "Belum tersedia"}</dd></div><div><dt>Tujuan</dt><dd>{summary.instructions.destination || "Belum tersedia"}</dd></div></dl>}
    {summary?.payment ? <>
      <dl>
      <div><dt>Referensi</dt><dd>{summary.payment.referenceNumber}</dd></div>
      <div><dt>Nominal terkonfigurasi</dt><dd>{summary.payment.amount == null ? "Belum tersedia" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(summary.payment.amount))}</dd></div>
      <div><dt>Status verifikasi</dt><dd>{summary.payment.status === "VERIFIED" ? "Terverifikasi" : summary.payment.status === "REJECTED" ? "Ditolak · unggah bukti perbaikan" : "Menunggu verifikasi"}</dd></div>
      </dl>
      {summary.payment.statusHistory?.map((history, index) => <p key={`${history.createdAt}-${index}`}><time>{new Date(history.createdAt).toLocaleString("id-ID")}</time> · {history.notes || history.status}</p>)}
      {summary.payment.hasProof && <p><a href="/api/student/payment/proof">Unduh bukti terakhir</a></p>}
      {summary.proofUploadEnabled && summary.payment.status !== "VERIFIED" && <label>Unggah atau perbarui bukti pembayaran <input type="file" accept="application/pdf,image/jpeg,image/png" disabled={proofBusy} onChange={(event) => void uploadProof(event)} /></label>}
      {!summary.proofUploadEnabled && <p>Unggah bukti dinonaktifkan sampai storage dokumen terkonfigurasi dan terverifikasi privat.</p>}
    </> : summary?.configured ? <><p>Metode dan nominal telah dikonfigurasi sekolah. Buat catatan tagihan untuk pendaftaran ini.</p><button type="button" disabled={busy} onClick={() => void createInvoice()}>Buat tagihan</button></> : <p>Nominal, metode, atau tujuan pembayaran belum dikonfigurasi sekolah. Tidak ada tagihan yang dibuat.</p>}
  </section>;
}
