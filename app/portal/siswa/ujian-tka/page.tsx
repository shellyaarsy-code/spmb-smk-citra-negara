"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BrandLogo from "../../../components/brand-logo";
import StudentSidebar from "../student-sidebar";
import StudentReviewProgress from "../student-review-progress";
import { deferStudentDraftHydration, readStudentDraft } from "../student-application-draft";
import { useStudentDemoMode } from "../student-demo-mode";
import { toStudentFormValues, useCurrentStudentData } from "../student-profile-client";
import { useCurrentDraftApplication } from "../student-application-client";
import LiveTkaSession from "../live-tka-session";

export default function StudentTkaPage() {
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [showStartDialog, setShowStartDialog] = useState(false);
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
  const hasSubmission = Boolean(application && application.status !== "DRAFT");
  const tkaEligible = application?.status === "ELIGIBLE_FOR_TKA" || application?.status === "TKA_STARTED";
  const initials = studentName === "Calon Siswa" ? "S" : studentName.charAt(0).toUpperCase();
  const nisn = values.nisn?.trim() || (isDemoMode ? "00987654321" : "Belum diisi");
  const program = values.primaryProgram?.trim() || (isDemoMode ? "PPLG (Pengembangan Perangkat Lunak)" : "Belum dipilih");
  const registrationNumber = application?.registrationNumber || (isDemoMode ? "CN260012" : "Belum diterbitkan");

  return (
    <main className="student-dashboard-outer verification-outer">
      <div className="verification-shell">
        <header className="verification-topbar">
          <Link className="verification-topbar-brand" href="/portal">
            <BrandLogo className="student-dashboard-brand-mark" />
            <span><strong>SPMB SMK CITRA NEGARA</strong><small>TAHUN AJARAN 2026/2027</small></span>
          </Link>
          <nav aria-label="Navigasi utama portal">
            <Link className="is-current" href="/portal/siswa" aria-current="location">Portal Siswa</Link>
            <Link href="/portal/siswa/pengumuman-kelulusan">Pengumuman Resmi</Link>
            <Link href="/#jadwal">Jadwal Gelombang</Link>
            <Link href="/#kontak">Hubungi SPMB</Link>
          </nav>
          <Link className="verification-account" href="/portal/siswa/profil">
            <span><strong>{studentName}</strong><small>No. Reg: {registrationNumber}</small></span>
            <span className="verification-avatar" aria-hidden="true">{initials}</span>
          </Link>
        </header>

        <div className="student-dashboard-app verification-app">
          <StudentSidebar active="exam" />
          <section className="student-dashboard-main verification-main tka-main" aria-label="Pusat Ujian Seleksi">
            <header className="student-dashboard-header verification-page-header">
              <div>
                <h1>Pusat Ujian Seleksi (TKA)</h1>
                <p>Nomor Peserta: TKA-{registrationNumber} <span aria-hidden="true">|</span> {program}</p>
              </div>
              <span className={`tka-status-badge ${isDemoMode ? "" : tkaEligible ? "" : "tka-status-locked"}`}>{isDemoMode ? "DEMO · Mengikuti Tes" : tkaEligible ? "Akses TKA tersedia sesuai jadwal" : hasSubmission ? `Status aplikasi: ${application?.status.replaceAll("_", " ")}` : "Belum Ada Pendaftaran"}</span>
            </header>

            <section className="student-progress verification-progress" aria-label="Tahapan pendaftaran">
              <StudentReviewProgress currentStage={isDemoMode ? 5 : hasSubmission ? 3 : 1} completedThrough={isDemoMode ? 4 : undefined} labels={["Registrasi", "Formulir", "Unggah Berkas", "Verifikasi", "Pembayaran", "Ujian TKA", "Hasil Seleksi"]} />
            </section>

            {!isDemoMode ? <><LiveTkaSession /><p className="verification-preview-link"><Link href="/portal/siswa/ujian-tka?mode=demo">Buka demo · Pusat ujian</Link></p></> : <div className="tka-layout">
              <section className="tka-exam-card" aria-labelledby="tka-title">
                <div className="tka-exam-title-row">
                  <span className="tka-exam-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="12" height="17" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span>
                  <h2 id="tka-title">Tes Kemampuan Akademik (TKA) Mandiri</h2>
                  <span className="tka-cbt-badge"><span aria-hidden="true" />CBT Online Active</span>
                </div>
                <p className="tka-description">Ujian saringan masuk akademik diselenggarakan secara daring menggunakan sistem Computer Based Test (CBT). Pastikan Anda berada dalam ruangan yang kondusif dengan koneksi internet yang stabil sebelum memulai tes.</p>

                <div className="tka-countdown" aria-label="Informasi waktu ujian">
                  <span>WAKTU MULAI TES DIJADWALKAN</span>
                  <strong>00 Hari : 01 Jam : 14 Menit : 22 Detik</strong>
                </div>

                <div className="tka-session-details">
                  <p><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg><span>Jadwal Ujian: <strong>Selasa, 10 Maret 2026 (10:00 – 12:00 WIB)</strong></span></p>
                  <p><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.6 13.4a4 4 0 0 0 5.7 0l2.1-2.1a4 4 0 0 0-5.7-5.7l-1.2 1.2M13.4 10.6a4 4 0 0 0-5.7 0l-2.1 2.1a4 4 0 0 0 5.7 5.7l1.2-1.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg><span>Akses Ujian: <strong className="tka-access-link">Portal CBT Citra Negara (Online)</strong></span></p>
                </div>

                <div className="tka-rules">
                  <h3>Aturan &amp; Tata Tertib Ujian:</h3>
                  <ol>
                    <li>Wajib menggunakan laptop/komputer berkamera aktif.</li>
                    <li>Tidak diperkenankan membuka tab peramban lain selama ujian berlangsung.</li>
                    <li>Sistem secara berkala akan mengambil tangkapan layar guna mencegah kecurangan.</li>
                  </ol>
                </div>

                <button className="tka-start-button" type="button" onClick={() => setShowStartDialog(true)}>Mulai Ujian CBT Sekarang</button>
              </section>

              <aside className="tka-card-panel" aria-labelledby="tka-card-title">
                <h2 id="tka-card-title">Kartu Peserta Ujian</h2>
                <div className="tka-candidate-card">
                  <div className="tka-card-brand"><BrandLogo width={26} className="tka-card-logo" /><strong>SPMB SMK CITRA NEGARA</strong></div>
                  <div className="tka-card-student">
                    <span className="tka-student-photo" aria-hidden="true">{initials}</span>
                    <div><strong>{studentName}</strong><span>NISN: {nisn}</span></div>
                  </div>
                  <div className="tka-card-program"><span>PROGRAM STUDI PILIHAN</span><strong>{program}</strong></div>
                </div>
              </aside>
            </div>}
          </section>
        </div>
      </div>

      {showStartDialog && <div className="tka-dialog-backdrop" role="presentation" onClick={() => setShowStartDialog(false)}>
        <section className="tka-start-dialog" role="dialog" aria-modal="true" aria-labelledby="tka-dialog-title" onClick={(event) => event.stopPropagation()}>
          <span className="tka-dialog-icon" aria-hidden="true">!</span>
          <h2 id="tka-dialog-title">Siap memulai ujian?</h2>
          <p>Pastikan perangkat dan koneksi internet Anda siap. Ini pratinjau alur; sesi CBT belum terhubung.</p>
          <div className="tka-dialog-actions"><button type="button" onClick={() => setShowStartDialog(false)}>Kembali</button><Link href="/portal/siswa/hasil-tka?mode=demo">Lanjut ke hasil pratinjau</Link></div>
        </section>
      </div>}
    </main>
  );
}
