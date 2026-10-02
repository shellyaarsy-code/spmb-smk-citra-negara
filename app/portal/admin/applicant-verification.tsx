"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminIcon } from "./admin-sidebar";
import { demoApplicants, type Applicant } from "./admin-applicant-data";

type DocumentKey = "photo" | "birth" | "family" | "school";
type DocumentStatus = "Diterima" | "Sedang Ditinjau" | "Belum Diunggah" | "Perlu Revisi";
type DocumentItem = { key: DocumentKey; title: string; fileName: string; status: DocumentStatus };
const initialDocuments: DocumentItem[] = [
  { key: "photo", title: "Pas Foto Berwarna", fileName: "PAS_FOTO_RAHMAN.jpg", status: "Diterima" },
  { key: "birth", title: "Scan Akta Kelahiran", fileName: "AKTA_KELAHIRAN_RAHMAN.pdf", status: "Diterima" },
  { key: "family", title: "Kartu Keluarga", fileName: "KARTU_KELUARGA_RAHMAN.pdf", status: "Sedang Ditinjau" },
  { key: "school", title: "Surat Keterangan Lulus / Rapor", fileName: "Belum ada berkas", status: "Belum Diunggah" },
];
const rejectionReasons = ["Scan dokumen terpotong / buram", "Nama tidak sesuai NISN Dapodik", "Format berkas salah (gunakan PDF)"];

function DocumentStatusPill({ status }: { status: DocumentStatus }) {
  const tone = status === "Diterima" ? "ok" : status === "Sedang Ditinjau" ? "waiting" : status === "Perlu Revisi" ? "bad" : "empty";
  return <span className={`admin-verification-doc-status ${tone}`}>{status}</span>;
}

function MockDocumentPreview({ applicant, document, zoom }: { applicant: Applicant; document: DocumentItem; zoom: number }) {
  return (
    <div className="admin-document-preview-stage">
      <article className="admin-mock-document" style={{ transform: `scale(${zoom})` }} aria-label={`Pratinjau contoh ${document.title}`}>
        <div className="admin-mock-document-head"><span className="admin-mock-document-emblem">CN</span><div><b>SPMB SMK CITRA NEGARA</b><small>CONTOH DOKUMEN — BUKAN BERKAS ASLI</small></div><span className="admin-mock-document-code">SIMULASI</span></div>
        <div className="admin-mock-document-title">{document.title.toUpperCase()}</div>
        <div className="admin-mock-document-body">
          <div className="admin-mock-document-photo">PRATINJAU<br />CONTOH</div>
          <div className="admin-mock-document-lines">
            <span>Nama calon siswa</span><b>{applicant.name.toUpperCase()}</b>
            <span>Nomor pendaftaran</span><b>{applicant.registrationNumber}</b>
            <span>Sekolah asal</span><b>{applicant.schoolName}</b>
            <span>Program pilihan</span><b>{applicant.program}</b>
          </div>
        </div>
        <div className="admin-mock-document-grid"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
        <div className="admin-mock-document-watermark">SIMULASI</div>
        <footer>Pratinjau ilustratif • Data contoh • Tidak mewakili dokumen identitas resmi</footer>
      </article>
    </div>
  );
}

export default function ApplicantVerification({ applicant }: { applicant: Applicant }) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [selected, setSelected] = useState<DocumentKey>("family");
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const [zoom, setZoom] = useState(1);
  const [activity, setActivity] = useState(["Pas foto disetujui oleh admisi admin • Hari ini, 10:45 WIB"]);
  const activeDocument = useMemo(() => documents.find((item) => item.key === selected) ?? documents[0], [documents, selected]);
  const previewAvailable = activeDocument.status !== "Belum Diunggah";

  function log(message: string) {
    setActivity((current) => [`${message} • Baru saja`, ...current]);
  }

  function approve() {
    if (!previewAvailable) {
      setNotice("Berkas ini belum diunggah, jadi belum dapat diverifikasi.");
      return;
    }
    setDocuments((current) => current.map((item) => item.key === selected ? { ...item, status: "Diterima" } : item));
    setNotice(`${activeDocument.title} ditandai diterima untuk pratinjau sesi ini. Perubahan tidak tersimpan.`);
    log(`${activeDocument.title} disetujui oleh admin`);
  }

  function reject() {
    if (!previewAvailable) {
      setNotice("Berkas ini belum diunggah, jadi belum dapat diminta revisi.");
      return;
    }
    if (!reason) {
      setNotice("Pilih alasan revisi terlebih dahulu.");
      return;
    }
    setDocuments((current) => current.map((item) => item.key === selected ? { ...item, status: "Perlu Revisi" } : item));
    setNotice(`${activeDocument.title} ditandai perlu revisi: ${reason}. Perubahan tidak tersimpan.`);
    log(`${activeDocument.title} diminta revisi`);
  }

  function nextApplicant() {
    const currentIndex = demoApplicants.findIndex((item) => item.registrationNumber === applicant.registrationNumber);
    const next = demoApplicants[(currentIndex + 1) % demoApplicants.length];
    router.push(`/portal/admin/verifikasi-berkas/${next.registrationNumber}?mode=demo`);
  }

  return (
    <>
      <header className="admin-dashboard-header admin-detail-page-header">
        <div className="admin-dashboard-heading"><h1>Verifikasi Berkas</h1><p>{applicant.name} <span aria-hidden="true">•</span> {applicant.registrationNumber}</p></div>
        <div className="admin-dashboard-header-actions">
          <label className="admin-dashboard-search"><AdminIcon name="search" /><input type="search" placeholder="Cari No. Pendaftaran, Nama…" aria-label="Pencarian pendaftar" disabled /></label>
          <div className="admin-dashboard-account"><span>AD</span><div><strong>Admin Admisi</strong><small>PANITIA PPDB</small></div></div>
        </div>
      </header>
      <div className="admin-demo-banner admin-detail-demo-banner" role="note"><strong>Mode simulasi</strong><span>Pratinjau berkas, persetujuan, dan catatan hanya untuk contoh visual. Tidak ada dokumen asli atau data yang disimpan.</span><Link href={`/portal/admin/pendaftaran/${applicant.registrationNumber}?mode=demo`}>Kembali ke detail</Link></div>

      <div className="admin-verification-workspace">
        <div className="admin-verification-left-column">
          <section className="admin-verification-card admin-verification-doc-list" aria-labelledby="verification-doc-list-title">
            <h2 id="verification-doc-list-title">Daftar Dokumen Calon Siswa</h2>
            <div className="admin-verification-doc-items">
              {documents.map((document) => <button type="button" key={document.key} className={`admin-verification-doc-item ${selected === document.key ? "selected" : ""}`} onClick={() => { setSelected(document.key); setNotice(""); }} aria-pressed={selected === document.key}>
                <span className="admin-verification-file-icon"><AdminIcon name="file" /></span><span className="admin-verification-doc-copy"><strong>{document.title}</strong><small>{document.fileName}</small></span><DocumentStatusPill status={document.status} />
              </button>)}
            </div>
          </section>
          <section className="admin-verification-card admin-verification-activity" aria-labelledby="verification-activity-title">
            <h2 id="verification-activity-title">Riwayat Aktivitas Dokumen</h2>
            <ul>{activity.map((item, index) => <li key={`${item}-${index}`}><span className="admin-verification-activity-dot" /><p>{item}</p></li>)}</ul>
          </section>
        </div>

        <section className="admin-verification-card admin-verification-preview-card" aria-labelledby="verification-preview-title">
          <div className="admin-verification-preview-heading"><h2 id="verification-preview-title"><AdminIcon name="file" /> Pratinjau Berkas: {activeDocument.title}</h2><p>{activeDocument.fileName}</p></div>
          <div className="admin-verification-preview-tools" aria-label="Kontrol pratinjau"><button type="button" onClick={() => setZoom((current) => Math.max(.8, Number((current - .1).toFixed(1))))} aria-label="Perkecil pratinjau">−</button><span>{previewAvailable ? `Fit Page (${Math.round(zoom * 100)}%)` : "Tidak ada pratinjau"}</span><button type="button" onClick={() => setZoom((current) => Math.min(1.2, Number((current + .1).toFixed(1))))} aria-label="Perbesar pratinjau">+</button><button type="button" onClick={() => setZoom(1)} aria-label="Sesuaikan pratinjau">↗</button></div>
          {previewAvailable ? <MockDocumentPreview applicant={applicant} document={activeDocument} zoom={zoom} /> : <div className="admin-verification-empty-preview"><AdminIcon name="file" /><strong>Berkas belum diunggah</strong><span>Pratinjau akan muncul setelah calon siswa mengirim dokumen.</span></div>}
        </section>

        <aside className="admin-verification-card admin-verification-actions-card" aria-labelledby="verification-actions-title">
          <h2 id="verification-actions-title">Verifikasi Dokumen Ini</h2>
          <p className="admin-verification-action-context">{activeDocument.title}<span>{applicant.name} · {applicant.registrationNumber}</span></p>
          <div className="admin-verification-review-actions">
            <button type="button" className="admin-verification-action pass" onClick={approve} disabled={!previewAvailable}>✓ <span>Setujui Dokumen</span></button>
            <button type="button" className="admin-verification-action destructive" onClick={reject} disabled={!previewAvailable}>⊗ <span>Tolak / Minta Revisi</span></button>
          </div>
          <div className="admin-verification-reasons"><h3>Alasan Penolakan Preset</h3>{rejectionReasons.map((item) => <button type="button" key={item} className={reason === item ? "selected" : ""} onClick={() => { setReason(item); setNotice(""); }} aria-pressed={reason === item}>{item}</button>)}</div>
          {notice && <p className="admin-verification-notice" role="status">{notice}</p>}
          <button type="button" className="admin-verification-next" onClick={nextApplicant}>Lanjut ke Pendaftar Berikutnya <AdminIcon name="arrow" /></button>
        </aside>
      </div>
    </>
  );
}
