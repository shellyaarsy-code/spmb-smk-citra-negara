"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAvailableDocumentTypes, useStudentDocuments } from "./student-documents-client";

function DocumentIcon({ tone }: { tone: "green" | "amber" | "neutral" }) {
  return (
    <span className={`student-document-icon ${tone}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 3.5h7l4 4v13h-11z" /><path d="M13.5 3.5v5h5M9.5 13h5M9.5 16.5h5" />
      </svg>
    </span>
  );
}

export default function StudentDocumentsForm() {
  const router = useRouter();
  const { documents, loading: documentsLoading, error: documentsError, refresh } = useStudentDocuments();
  const { documentTypes, loading: typesLoading, error: typesError } = useAvailableDocumentTypes();
  const [uploadConfig, setUploadConfig] = useState<{ enabled: boolean; allowedMimeTypes: string[]; maxFileSizeBytes: number | null }>({ enabled: false, allowedMimeTypes: [], maxFileSizeBytes: null });
  const [selectedType, setSelectedType] = useState("");
  const [busyType, setBusyType] = useState("");
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/student/document-upload-config", { cache: "no-store" }).then((response) => response.json()).then((data) => setUploadConfig(data)).catch(() => setUploadConfig({ enabled: false, allowedMimeTypes: [], maxFileSizeBytes: null }));
  }, []);

  async function uploadFile(file: File) {
    if (!selectedType) { setNotice("Pilih tipe dokumen terlebih dahulu."); return; }
    const form = new FormData(); form.set("documentTypeCode", selectedType); form.set("file", file);
    setBusyType(selectedType); setNotice("");
    try {
      const response = await fetch("/api/student/documents", { method: "POST", body: form });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Dokumen gagal diunggah.");
      setNotice("Dokumen berhasil diunggah."); await refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Dokumen gagal diunggah."); }
    finally { setBusyType(""); if (fileInput.current) fileInput.current.value = ""; }
  }

  async function deleteFile(id: string) {
    if (!window.confirm("Hapus dokumen ini?")) return;
    setNotice("");
    try {
      const response = await fetch(`/api/student/documents/${encodeURIComponent(id)}`, { method: "DELETE" });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Dokumen gagal dihapus.");
      setNotice("Dokumen berhasil dihapus."); await refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Dokumen gagal dihapus."); }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/portal/siswa/formulir/review");
  }

  return (
    <form className="student-biodata-form student-documents-form" onSubmit={handleSubmit}>
      <section className="student-biodata-section" aria-labelledby="documents-title">
        <h2 id="documents-title">Dokumen Pendaftaran</h2>
        <p className="student-biodata-hint student-documents-hint">Daftar tipe dokumen dan kebijakan file mengikuti konfigurasi yang tersedia. Dokumen tidak menjadi syarat pengiriman aplikasi.</p>
        {(documentsError || typesError) && <p className="student-document-error" role="alert">{documentsError || typesError}</p>}
        {(documentsLoading || typesLoading) && <p className="student-document-pending" role="status">Memuat data dokumen...</p>}

        <div className="student-document-upload-list">
          {!documentsLoading && !typesLoading && documentTypes.length === 0 && (
            <div className="student-submission-empty"><p>Belum ada tipe dokumen yang dikonfigurasi.</p></div>
          )}
          {documentTypes.map((documentType) => {
            const records = documents.filter((document) => document.documentType.code === documentType.code);
            return (
              <div className="student-document-upload-row" key={documentType.code}>
                  <DocumentIcon tone="green" />
                <div className="student-document-upload-copy">
                  <h3>{documentType.name}</h3>
                  {documentType.description && <p>{documentType.description}</p>}
                  {records.length === 0
                    ? <p className="student-document-pending">Belum ada catatan dokumen</p>
                    : records.map((record) => (
                      <p className="student-document-file-meta" key={record.id}>
                        <a href={`/api/student/documents/${encodeURIComponent(record.id)}`} download>{record.fileName}</a> · {record.status} · {new Intl.DateTimeFormat("id-ID").format(new Date(record.uploadedAt))}
                        {record.canDelete && <button type="button" onClick={() => void deleteFile(record.id)}>Hapus</button>}
                      </p>
                    ))}
                </div>
                <div className="student-document-action-group">
                  <label className="student-document-file-action is-empty" htmlFor={`document-${documentType.code}`}>
                    <select aria-label={`Pilih tipe dokumen untuk diunggah`} value={selectedType} onChange={(event) => setSelectedType(event.target.value)}><option value="">Pilih tipe dokumen</option>{documentTypes.map((type) => <option value={type.code} key={type.code}>{type.name}</option>)}</select>
                    <button type="button" disabled={!uploadConfig.enabled || selectedType !== documentType.code || Boolean(busyType)} onClick={() => fileInput.current?.click()}>{busyType === documentType.code ? "Mengunggah…" : "Pilih file"}</button>
                    {selectedType === documentType.code && <input ref={fileInput} id={`document-${documentType.code}`} type="file" accept={uploadConfig.allowedMimeTypes.join(",")} hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(file); }} />}
                  </label>
                  {documentType.required && <span className="student-document-pending">Wajib untuk verifikasi</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="student-biodata-actions student-documents-actions">
        <p className="student-biodata-feedback" aria-live="polite">{notice || (!uploadConfig.enabled ? "Unggah belum aktif: konfigurasi storage, kebijakan file, dan tipe dokumen aktif diperlukan." : "Upload file tersimpan secara privat dan dapat diperiksa admin.")}</p>
        <Link className="student-parent-back" href="/portal/siswa/formulir/jurusan">Kembali ke Pilihan Jurusan</Link>
        <button className="student-biodata-next" type="submit">Lanjut ke Final Review <span aria-hidden="true">→</span></button>
      </div>
    </form>
  );
}
