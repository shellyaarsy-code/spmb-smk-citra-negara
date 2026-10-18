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
import LiveTkaResults from "../live-tka-results";

const scores = [
  { label: "Matematika Logika & Algoritma Dasar", value: 90 },
  { label: "Bahasa Inggris Teknis", value: 85 },
  { label: "Pengetahuan Teknologi Informasi (Kejuruan)", value: 78 },
];

export default function StudentTkaResultPage() {
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
  const hasSubmission = Boolean(application && application.status !== "DRAFT");
  const program = values.primaryProgram?.trim() || (isDemoMode ? "PPLG" : "Belum dipilih");
  const examNumber = `TKA-${application?.registrationNumber || (isDemoMode ? "CN260012" : "Belum diterbitkan")}`;

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
            <span><strong>{studentName}</strong><small>No. Reg: {application?.registrationNumber || (isDemoMode ? "CN260012" : "Belum diterbitkan")}</small></span>
            <span className="verification-avatar" aria-hidden="true">{studentName.charAt(0).toUpperCase()}</span>
          </Link>
        </header>

        <div className="student-dashboard-app verification-app">
          <StudentSidebar active="exam" />
          <section className="student-dashboard-main verification-main tka-result-main" aria-label="Hasil Penilaian Akademik">
            <header className="student-dashboard-header verification-page-header">
              <div>
                <h1>Hasil Penilaian Akademik (TKA)</h1>
                <p>{studentName} <span aria-hidden="true">|</span> No. Ujian: {examNumber}</p>
              </div>
              <span className={`tka-result-status ${isDemoMode ? "" : hasSubmission ? "tka-result-pending" : "tka-result-unregistered"}`}>{isDemoMode ? "DEMO · Tes Selesai" : hasSubmission ? "Hasil Belum Tersedia" : "Belum Ada Pendaftaran"}</span>
            </header>

            <section className="student-progress verification-progress" aria-label="Tahapan pendaftaran">
              <StudentReviewProgress currentStage={isDemoMode ? 6 : hasSubmission ? 3 : 1} completedThrough={isDemoMode ? 5 : undefined} labels={["Registrasi", "Formulir", "Unggah Berkas", "Verifikasi", "Pembayaran", "Ujian TKA", "Hasil Seleksi"]} />
            </section>

            {!isDemoMode ? <>{hasSubmission ? <LiveTkaResults /> : <section className="tka-result-empty"><h2>Belum Ada Pendaftaran</h2><p>Kirim formulir pendaftaran terlebih dahulu sebelum mengikuti ujian.</p><Link className="student-dashboard-action" href="/portal/siswa/formulir">Mulai Isi Formulir →</Link></section>}<Link className="verification-preview-link" href="/portal/siswa/hasil-tka?mode=demo">Buka demo · Hasil TKA</Link></> : <div className="tka-results-layout">
              <section className="tka-score-card" aria-labelledby="tka-score-title">
                <div className="tka-score-card-header">
                  <h2 id="tka-score-title">Rincian Nilai Kompetensi Akademik</h2>
                  <span>Lulus Ambang Batas</span>
                </div>
                <div className="tka-score-summary">
                  <div className="tka-final-score"><span>Nilai Akhir</span><strong>84</strong><small>Skala 100</small></div>
                  <div className="tka-percentile"><strong>Peringkat Persentil: 92nd Percentile</strong><p>Nilai Anda lebih tinggi dari 92% seluruh pendaftar program keahlian {program}. Kompetensi Anda dalam ranah logika dasar sangat kuat.</p></div>
                </div>

                <h3 className="tka-score-detail-title">Detail Skor per Sub-Tes Kompetensi:</h3>
                <div className="tka-score-list">
                  {scores.map((score) => (
                    <div className="tka-score-row" key={score.label}>
                      <div><span>{score.label}</span><strong>{score.value} / 100</strong></div>
                      <div className="tka-score-track" role="img" aria-label={`${score.label}: ${score.value} dari 100`}><span style={{ width: `${score.value}%` }} /></div>
                    </div>
                  ))}
                </div>

                <div className="tka-result-actions">
                  <button className="tka-download-button" type="button" onClick={() => window.print()}>Unduh Sertifikat Hasil Ujian (PDF)</button>
                  <a className="tka-contact-button" href="https://wa.me/6281277889900" target="_blank" rel="noreferrer">Hubungi Bantuan Admisi</a>
                </div>
              </section>

              <aside className="tka-recommendation-card" aria-labelledby="career-title">
                <h2 id="career-title">Rekomendasi Karir &amp; Minat</h2>
                <p>Berdasarkan hasil analisis sub-tes pemrograman logika dasar, potensi Anda cenderung pada keahlian <strong>Software Engineering / Web Developer</strong>. Anda direkomendasikan memilih konsentrasi PPLG utama.</p>
              </aside>
            </div>}
          </section>
        </div>
      </div>
    </main>
  );
}
