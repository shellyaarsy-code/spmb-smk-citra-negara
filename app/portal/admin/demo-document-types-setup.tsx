"use client";

import { useState } from "react";

export default function DemoDocumentTypesSetup() {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);

  async function activate() {
    setPending(true);
    setFeedback("");
    setFailed(false);
    try {
      const response = await fetch("/api/admin/demo-document-types", { method: "POST" });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setFailed(true);
        setFeedback(result?.error || "Konfigurasi belum dapat disiapkan.");
        return;
      }
      setFeedback(result.created ? `${result.message} ${result.created} tipe baru ditambahkan.` : result.message);
    } catch {
      setFailed(true);
      setFeedback("Konfigurasi belum dapat disiapkan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="admin-dashboard-card" aria-labelledby="demo-document-types-title">
      <h2 id="demo-document-types-title">Aktifkan tipe dokumen demo</h2>
      <p>Menambahkan tipe KK, rapor, dan pas foto contoh yang hanya ditampilkan dalam mode demo. Unggah berkas fiktif saja.</p>
      <button className="button" type="button" onClick={() => void activate()} disabled={pending}>{pending ? "Menyiapkan…" : "Siapkan tipe dokumen"}</button>
      <p role={failed ? "alert" : "status"} aria-live="polite">{feedback}</p>
    </section>
  );
}