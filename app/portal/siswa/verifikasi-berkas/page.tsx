"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentSidebar from "../student-sidebar";
import StudentReviewProgress from "../student-review-progress";
import { deferStudentDraftHydration, readStudentDraft } from "../student-application-draft";
import { useStudentDemoMode } from "../student-demo-mode";
import { toStudentFormValues, useCurrentStudentData } from "../student-profile-client";
import { useCurrentDraftApplication } from "../student-application-client";

const verifiedItems = [
  { label: "Scan Ijazah/SKL", status: "Terverifikasi", state: "verified" },
  { label: "Nilai Rapor Smt 1–4 (Data Akademik)", status: "Terverifikasi", state: "verified" },
  { label: "Scan Akta Kelahiran", status: "Terverifikasi", state: "verified" },
  { label: "Scan Kartu Keluarga", status: "Ditolak (Revisi)", state: "rejected" },
];

export default function StudentDocumentVerificationPage() {
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const isDemoMode = useStudentDemoMode();
  const { data } = useCurrentStudentData();
  const { application } = useCurrentDraftApplication();

  useEffect(() => deferStudentDraftHydration(() => {
    const draft = readStudentDraft();
    setDraftValues(draft.values);
  }), []);

  const values: Record<string, string> = { ...draftValues, ...(application ? {
    primaryProgram: application.programChoices.find((choice) => choice.priority === 1)?.studyProgram.code ?? "",
  } : {}), ...(data ? toStudentFormValues(data) : {}) };

  const studentName = values.fullName?.trim() || (isDemoMode ? "Rahman Aditya" : "Calon Siswa");
  const nisn = values.nisn?.trim() || "Belum diisi";
  const primaryChoice = application?.programChoices.find((choice) => choice.priority === 1)?.studyProgram;
  const primaryProgram = primaryChoice ? `${primaryChoice.name} (${primaryChoice.code})` : "Belum dipilih";
  const applicationNumber = application?.registrationNumber;
  const hasSubmission = application?.status === "SUBMITTED";
  const waitingItems = ["Scan Ijazah/SKL", "Nilai Rapor Smt 1–4 (Data Akademik)", "Scan Akta Kelahiran", "Scan Kartu Keluarga"].map((label) => ({ label, status: hasSubmission ? "Menunggu Verifikasi" : "Belum dikirim", state: "pending" }));
  const pageStatus = isDemoMode ? "Ditolak / Perlu Revisi" : hasSubmission ? "Menunggu Verifikasi" : "Belum dikirim";

  return (
    <main className="student-dashboard-outer verification-outer">
      <div className="verification-shell">
        <header className="verification-topbar">
          <Link className="verification-topbar-brand" href="/portal">
            <span className="student-dashboard-brand-mark">CN</span>
            <span><strong>SPMB SMK CITRA NEGARA</strong><small>TAHUN AJARAN 2026/2027</small></span>
          </Link>
          <nav aria-label="Navigasi utama portal">
            <Link className="is-current" href="/portal/siswa" aria-current="location">Portal Siswa</Link>
            <Link href="/portal/siswa/pengumuman-kelulusan">Pengumuman Resmi</Link>
            <Link href="/#jadwal">Jadwal Gelombang</Link>
            <Link href="/#kontak">Hubungi SPMB</Link>
          </nav>
          <Link className="verification-account" href="/portal/siswa/profil">
            <span><strong>{studentName}</strong><small>No. Reg: {applicationNumber || (isDemoMode ? "CN260012" : "Belum tersedia")}</small></span>
            <span className="verification-avatar" aria-hidden="true">{studentName === "Calon Siswa" ? "S" : studentName.charAt(0).toUpperCase()}</span>
          </Link>
        </header>

        <div className="student-dashboard-app verification-app">
          <StudentSidebar active="upload" />

          <section className="student-dashboard-main verification-main" aria-label="Status verifikasi berkas">
            <header className="student-dashboard-header verification-page-header">
              <div>
                <h1>Status Verifikasi Berkas</h1>
                <p>NISN: {nisn} <span aria-hidden="true">|</span> Program Utama: {primaryProgram}</p>
              </div>
              <span className={`verification-status-badge ${isDemoMode ? "" : "verification-status-pending"}`}>{isDemoMode ? "DEMO · " : "Status: "}{pageStatus}</span>
            </header>

            <section className="student-progress verification-progress" aria-label="Tahapan pendaftaran">
              <StudentReviewProgress currentStage={isDemoMode || hasSubmission ? 3 : 0} completedThrough={isDemoMode || hasSubmission ? 2 : undefined} labels={["Registrasi", "Formulir", "Unggah Berkas", "Verifikasi", "Pembayaran", "Ujian TKA", "Hasil Seleksi"]} />
            </section>

            {!isDemoMode && !hasSubmission ? <section className="verification-empty-card">
              <h2>Belum Ada Pengiriman Formulir</h2>
              <p>Status verifikasi berkas akan tampil setelah Anda mengirim formulir pendaftaran.</p>
              <Link className="student-dashboard-action" href="/portal/siswa/formulir">Mulai Isi Formulir →</Link>
              <Link className="verification-preview-link" href="/portal/siswa/verifikasi-berkas?mode=demo">Buka demo · Status revisi berkas</Link>
            </section> : !isDemoMode && hasSubmission ? <div className="verification-waiting-card">
              <strong>Pengiriman formulir diterima</strong>
              <p>Berkas Anda masih menunggu peninjauan panitia. Hasil verifikasi akan muncul di sini setelah diperiksa.</p>
              <ul>{waitingItems.map((item) => <li key={item.label}><span>{item.label}</span><strong>{item.status}</strong></li>)}</ul>
            </div> : <div className="verification-layout">
              <div className="verification-primary-column">
                <section className="verification-revision-card" aria-labelledby="revision-title">
                  <div className="verification-revision-heading">
                    <span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="m9 9 6 6m0-6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span>
                    <h2 id="revision-title">Pendaftaran Anda Memerlukan Perbaikan Berkas</h2>
                  </div>
                  <p>Setelah diverifikasi oleh panitia, dokumen Scan Kartu Keluarga Anda ditolak karena hasil scan buram, terpotong, dan tidak dapat terbaca secara jelas untuk proses validasi data kependudukan.</p>
                  <Link className="verification-upload-again" href="/portal/siswa/formulir/unggah-berkas">Unggah Ulang Kartu Keluarga</Link>
                </section>

                <section className="verification-guide-card" aria-labelledby="verification-guide-title">
                  <h2 id="verification-guide-title">Panduan &amp; Arti Status Verifikasi</h2>
                  <dl>
                    <div><dt className="guide-pending">Menunggu Verifikasi</dt><dd>Berkas pendaftaran telah dikunci secara permanen dan sedang berada dalam antrean peninjauan oleh Panitia Admisi SPMB. Proses ini memerlukan waktu maksimal 2–3 hari kerja.</dd></div>
                    <div><dt className="guide-verified">Terverifikasi</dt><dd>Seluruh berkas administrasi dan data akademik telah dinyatakan lengkap dan valid. Anda berhak mendapatkan Kartu Peserta Ujian Seleksi untuk mengikuti TKA.</dd></div>
                    <div><dt className="guide-rejected">Ditolak / Revisi</dt><dd>Ditemukan berkas yang tidak valid, buram, atau tidak sesuai kriteria. Calon siswa diberikan kesempatan mengunggah ulang sebelum batas akhir gelombang berakhir.</dd></div>
                  </dl>
                </section>
              </div>

              <section className="verification-checklist-card" aria-labelledby="verification-checklist-title">
                <h2 id="verification-checklist-title">Review Data &amp; Kelengkapan Berkas</h2>
                <ul>
                  {verifiedItems.map((item) => (
                    <li key={item.label}>
                      <span>{item.label}</span>
                      <strong className={`verification-item-status ${item.state}`}>{item.status}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            </div>}
          </section>
        </div>
      </div>
    </main>
  );
}
