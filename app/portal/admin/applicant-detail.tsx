"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { AdminIcon } from "./admin-sidebar";
import { programNames, type Applicant, type ApplicantStatus } from "./admin-applicant-data";

type DetailTab = "student" | "parents" | "academic";
type PreviewStatus = ApplicantStatus | "Berkas Terverifikasi" | "Lolos Seleksi Berkas" | "Perlu Revisi Berkas";

function StatusPill({ status }: { status: PreviewStatus }) {
  const tone = status === "Diterima" || status === "Berkas Terverifikasi" || status === "Lolos Seleksi Berkas" ? "success" : status === "Berkas Kurang" || status === "Perlu Revisi Berkas" ? "danger" : status === "Pendaftaran Akun" ? "info" : "pending";
  return <span className={`admin-detail-status ${tone}`}>STATUS: {status.toUpperCase()}</span>;
}

function DataField({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return <div className={`admin-detail-field ${wide ? "wide" : ""}`}><dt>{label}</dt><dd>{children}</dd></div>;
}

export default function ApplicantDetail({ applicant, demo }: { applicant: Applicant; demo: boolean }) {
  const [tab, setTab] = useState<DetailTab>("student");
  const [status, setStatus] = useState<PreviewStatus>(applicant.status);
  const [notice, setNotice] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [notes, setNotes] = useState([{ author: "PANITIA ADMISI", date: "04 FEB, 15:30", message: "Scan Kartu Keluarga buram. Mohon tinjau kembali dan arahkan calon siswa jika perlu mengunggah ulang." }]);
  const [showStateReminder, setShowStateReminder] = useState(false);
  const initials = applicant.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const average = (applicant.semesterGrades.reduce((total, grade) => total + Number(grade), 0) / applicant.semesterGrades.length).toFixed(2);

  function simulateDecision(nextStatus: PreviewStatus, message: string) {
    setStatus(nextStatus);
    setNotice(message);
    setShowStateReminder(true);
  }

  function addNote() {
    const message = noteDraft.trim();
    if (!message) return;
    setNotes((current) => [{ author: "ADMIN ADMISI", date: "BARU SAJA", message }, ...current]);
    setNoteDraft("");
    setNotice("Catatan ditambahkan untuk pratinjau sesi ini saja.");
    setShowStateReminder(true);
  }

  return (
    <>
      <header className="admin-dashboard-header admin-detail-page-header">
        <div className="admin-dashboard-heading"><h1>Detail Calon Siswa</h1><p>{applicant.email} <span aria-hidden="true">•</span> ID: {applicant.registrationNumber}</p></div>
        <div className="admin-dashboard-header-actions">
          <label className="admin-dashboard-search"><AdminIcon name="search" /><input type="search" placeholder="Cari No. Pendaftaran, Nama…" aria-label="Pencarian daftar calon siswa" disabled /></label>
          <div className="admin-dashboard-account"><span>AD</span><div><strong>Admin Admisi</strong><small>PANITIA PPDB</small></div></div>
        </div>
      </header>

      <div className="admin-demo-banner admin-detail-demo-banner" role="note"><strong>Mode simulasi</strong><span>Data ini hanya contoh. Pilihan verifikasi dan catatan tidak disimpan atau dikirim ke sistem sekolah.</span><Link href="/portal/admin/pendaftaran?mode=demo">Kembali ke daftar</Link></div>

      <div className="admin-applicant-detail-grid">
        <div className="admin-applicant-detail-main">
          <section className="admin-applicant-identity" aria-label="Identitas calon siswa">
            <span className="admin-applicant-avatar">{initials}</span>
            <div className="admin-applicant-identity-copy"><h2>{applicant.name}</h2><p>NISN: {applicant.nisn} <span aria-hidden="true">•</span> {applicant.schoolName}</p></div>
            <StatusPill status={status} />
          </section>

          <section className="admin-applicant-data-card" aria-label="Data calon siswa">
            <div className="admin-detail-tabs" role="tablist" aria-label="Kelompok detail calon siswa">
              <button type="button" role="tab" id="detail-tab-student" aria-selected={tab === "student"} aria-controls="detail-panel" className={tab === "student" ? "active" : ""} onClick={() => setTab("student")}>Biodata Siswa</button>
              <button type="button" role="tab" id="detail-tab-parents" aria-selected={tab === "parents"} aria-controls="detail-panel" className={tab === "parents" ? "active" : ""} onClick={() => setTab("parents")}>Data Orang Tua / Wali</button>
              <button type="button" role="tab" id="detail-tab-academic" aria-selected={tab === "academic"} aria-controls="detail-panel" className={tab === "academic" ? "active" : ""} onClick={() => setTab("academic")}>Nilai Akademik &amp; Rapor</button>
            </div>

            <div className="admin-detail-tab-panel" id="detail-panel" role="tabpanel" aria-labelledby={`detail-tab-${tab}`}>
              {tab === "student" && <>
                <dl className="admin-detail-fields">
                  <DataField label="Tempat, Tanggal Lahir">{applicant.birthPlace}, {applicant.birthDate}</DataField>
                  <DataField label="Jenis Kelamin">{applicant.gender}</DataField>
                  <DataField label="Alamat Email">{applicant.email}</DataField>
                  <DataField label="Nomor WhatsApp">{applicant.whatsapp}</DataField>
                  <DataField label="Alamat Tempat Tinggal" wide>{applicant.address}</DataField>
                </dl>
                <section className="admin-detail-programs" aria-labelledby="detail-program-title">
                  <h3 id="detail-program-title">Program Studi yang Dipilih</h3>
                  <div className="admin-detail-program-grid">
                    <article><span>PILIHAN (UTAMA)</span><strong>{applicant.program} ({programNames[applicant.program] ?? applicant.program})</strong></article>
                    <article><span>PILIHAN 2 (CADANGAN)</span><strong>{applicant.backupProgram} ({programNames[applicant.backupProgram] ?? applicant.backupProgram})</strong></article>
                  </div>
                </section>
              </>}

              {tab === "parents" && <dl className="admin-detail-fields">
                <DataField label="Nama Ayah Kandung">{applicant.fatherName}</DataField>
                <DataField label="Pekerjaan Ayah">{applicant.fatherOccupation}</DataField>
                <DataField label="Nama Ibu Kandung">{applicant.motherName}</DataField>
                <DataField label="Pekerjaan Ibu">{applicant.motherOccupation}</DataField>
                <DataField label="Nomor WhatsApp Orang Tua">{applicant.parentWhatsapp}</DataField>
                <DataField label="NPSN Sekolah Asal">{applicant.schoolNpsn}</DataField>
                <DataField label="Nama Sekolah Asal">{applicant.schoolName}</DataField>
                <DataField label="Jenis & Status Sekolah">{applicant.schoolType} {applicant.schoolStatus}</DataField>
                <DataField label="Tahun Lulus">{applicant.graduationYear}</DataField>
              </dl>}

              {tab === "academic" && <>
                <div className="admin-academic-summary"><span>RATA-RATA RAPOR SEMESTER 1–4</span><strong>{average}</strong><small>Nilai gabungan Bahasa Indonesia, Matematika, IPA, dan Bahasa Inggris.</small></div>
                <div className="admin-academic-grades">{applicant.semesterGrades.map((grade, index) => <div key={index}><span>Rerata Semester {index + 1}</span><strong>{grade}</strong></div>)}</div>
                <div className="admin-academic-school"><span>Sekolah Asal</span><strong>{applicant.schoolName}</strong><small>{applicant.schoolType} Negeri · Lulus {applicant.graduationYear}</small></div>
              </>}
            </div>
          </section>
        </div>

        <aside className="admin-applicant-detail-side">
          <section className="admin-verification-decision" aria-labelledby="decision-title">
            <h2 id="decision-title">Keputusan Verifikasi</h2>
            <p>Lakukan tinjauan dokumen pendaftaran siswa sebelum menyetujui atau menolak berkas calon siswa.</p>
            <div className="admin-verification-actions">
              <Link className="admin-verification-action review" href={`/portal/admin/verifikasi-berkas/${applicant.registrationNumber}${demo ? "?mode=demo" : ""}`}><AdminIcon name="check" /> Verifikasi Dokumen Berkas</Link>
              <button type="button" className="admin-verification-action pass" onClick={() => simulateDecision("Lolos Seleksi Berkas", "Status pratinjau diubah menjadi Lolos Seleksi Berkas. Perubahan ini tidak tersimpan.")}><span aria-hidden="true">✓</span> Loloskan Seleksi Berkas</button>
              <button type="button" className="admin-verification-action reject" onClick={() => simulateDecision("Perlu Revisi Berkas", "Status pratinjau diubah menjadi Perlu Revisi Berkas. Perubahan ini tidak tersimpan.")}><span aria-hidden="true">⊗</span> Tolak / Kirim Revisi Berkas</button>
            </div>
            {showStateReminder && <p className="admin-detail-action-notice" role="status">{notice}</p>}
          </section>

          <section className="admin-verifier-notes" aria-labelledby="verifier-notes-title">
            <h2 id="verifier-notes-title">Catatan Verifikator</h2>
            <form className="admin-verifier-note-form" onSubmit={(event) => { event.preventDefault(); addNote(); }}>
              <input value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} aria-label="Catatan internal verifikator" placeholder="Tambahkan catatan internal mengenai pendaftar ini…" />
              <button type="submit" disabled={!noteDraft.trim()}>Tambah</button>
            </form>
            <ul className="admin-verifier-note-list">{notes.map((note, index) => <li key={`${note.date}-${index}`}><span>{note.author} <i aria-hidden="true">•</i> {note.date}</span><p>{note.message}</p></li>)}</ul>
          </section>
        </aside>
      </div>
    </>
  );
}
