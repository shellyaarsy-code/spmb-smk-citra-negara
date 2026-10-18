"use client";

import { useCallback, useEffect, useState } from "react";

type DocumentRow = { id: string; fileName: string; mimeType: string | null; uploadedAt: string; status: string; documentType: { name: string }; verifications: { status: string; notes: string | null }[] };

export default function LiveDocumentReview({ registrationNumber }: { registrationNumber: string }) {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState("VERIFIED");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const active = documents.find((item) => item.id === selected) ?? documents[0];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/applications/${encodeURIComponent(registrationNumber)}/documents`, { cache: "no-store" });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Dokumen belum dapat dimuat.");
      setDocuments(result.documents ?? []); setSelected((current) => current || result.documents?.[0]?.id || "");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Dokumen belum dapat dimuat."); }
    finally { setLoading(false); }
  }, [registrationNumber]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function saveVerification() {
    if (!active) return;
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/admin/documents/${encodeURIComponent(active.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, notes }) });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Status verifikasi gagal disimpan.");
      setError("Status verifikasi tersimpan."); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Status verifikasi gagal disimpan."); }
    finally { setSaving(false); }
  }

  return <section className="admin-verification-card" aria-label="Verifikasi dokumen tersimpan">
    <h1>Verifikasi Berkas</h1><p>No. pendaftaran: {registrationNumber}</p>
    {error && <p role="status">{error}</p>}{loading && <p role="status">Memuat dokumen…</p>}
    {!loading && documents.length === 0 && <p>Belum ada dokumen yang diunggah.</p>}
    <ul>{documents.map((doc) => <li key={doc.id}>
      <button type="button" onClick={() => { setSelected(doc.id); setNotes(doc.verifications[0]?.notes ?? ""); setStatus(doc.status === "PENDING" ? "VERIFIED" : doc.status); }}>{doc.documentType.name}: {doc.fileName} — {doc.status}</button>
      <a href={`/api/admin/documents/${encodeURIComponent(doc.id)}`} download>Unduh</a>
    </li>)}</ul>
    {active && <div>
      <h2>{active.documentType.name}</h2>
      <label>Status verifikasi <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="VERIFIED">Terverifikasi</option><option value="REJECTED">Ditolak</option><option value="REVISION_REQUIRED">Perlu revisi</option></select></label>
      <label>Catatan (opsional) <textarea value={notes} maxLength={1000} onChange={(event) => setNotes(event.target.value)} /></label>
      <button type="button" disabled={saving} onClick={() => void saveVerification()}>{saving ? "Menyimpan…" : "Simpan verifikasi"}</button>
    </div>}
  </section>;
}
