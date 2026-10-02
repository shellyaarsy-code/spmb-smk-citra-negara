"use client";

import { useState } from "react";
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
  const { documents, loading: documentsLoading, error: documentsError } = useStudentDocuments();
  const { documentTypes, loading: typesLoading, error: typesError } = useAvailableDocumentTypes();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/portal/siswa/formulir/review");
  }

  return (
    <form className="student-biodata-form student-documents-form" onSubmit={handleSubmit}>
      <section className="student-biodata-section" aria-labelledby="documents-title">
        <h2 id="documents-title">Dokumen Pendaftaran</h2>
        <p className="student-biodata-hint student-documents-hint">Daftar tipe dokumen mengikuti konfigurasi yang tersedia. Unggah file belum tersedia.</p>
        {(documentsError || typesError) && <p className="student-document-error" role="alert">{documentsError || typesError}</p>}
        {(documentsLoading || typesLoading) && <p className="student-document-pending" role="status">Memuat data dokumen...</p>}

        <div className="student-document-upload-list">
          {!documentsLoading && !typesLoading && documentTypes.length === 0 && (
            <div className="student-submission-empty"><p>Belum ada tipe dokumen yang dikonfigurasi.</p></div>
          )}
          {documentTypes.map((documentType, index) => {
            const records = documents.filter((document) => document.documentType.code === documentType.code);
            return (
              <div className="student-document-upload-row" key={documentType.code}>
                <DocumentIcon tone={index % 2 === 0 ? "green" : "neutral"} />
                <div className="student-document-upload-copy">
                  <h3>{documentType.name}</h3>
                  {documentType.description && <p>{documentType.description}</p>}
                  {records.length === 0
                    ? <p className="student-document-pending">Belum ada catatan dokumen</p>
                    : records.map((record, recordIndex) => (
                      <p className="student-document-file-meta" key={`${record.documentType.code}-${record.uploadedAt}-${recordIndex}`}>
                        {record.fileName} · {record.status} · {new Intl.DateTimeFormat("id-ID").format(new Date(record.uploadedAt))}
                      </p>
                    ))}
                </div>
                <div className="student-document-action-group">
                  <button className="student-document-file-action is-empty" type="button" disabled>Unggah belum tersedia</button>
                  {documentType.required && <span className="student-document-pending">Ditandai wajib</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="student-biodata-actions student-documents-actions">
        <p className="student-biodata-feedback" aria-live="polite">Penyimpanan dokumen privat belum dikonfigurasi; unggah file dinonaktifkan.</p>
        <Link className="student-parent-back" href="/portal/siswa/formulir/jurusan">Kembali ke Pilihan Jurusan</Link>
        <button className="student-biodata-next" type="submit">Lanjut ke Final Review <span aria-hidden="true">→</span></button>
      </div>
    </form>
  );
}
