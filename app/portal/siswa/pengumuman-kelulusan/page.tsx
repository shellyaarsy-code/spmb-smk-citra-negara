"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentSidebar from "../student-sidebar";
import { deferStudentDraftHydration, readStudentDraft } from "../student-application-draft";
import { toStudentFormValues, useCurrentStudentData } from "../student-profile-client";
import { useCurrentDraftApplication } from "../student-application-client";

type Outcome = "alternative";

export default function StudentGraduationAnnouncementPage() {
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const { data } = useCurrentStudentData();
  const { application } = useCurrentDraftApplication();

  useEffect(() => deferStudentDraftHydration(() => {
    const draft = readStudentDraft();
    setDraftValues(draft.values);
  }), []);

  const values: Record<string, string> = { ...draftValues, ...(application ? {
    primaryProgram: application.programChoices.find((choice) => choice.priority === 1)?.studyProgram.code ?? "",
  } : {}), ...(data ? toStudentFormValues(data) : {}) };

  const studentName = values.fullName?.trim() || (showSimulation ? "Rahman Aditya" : "Calon Siswa");
  const registrationNumber = application?.registrationNumber || (showSimulation ? "CN260012" : "Belum diterbitkan");
  const hasSubmission = application?.status === "SUBMITTED";
  const primaryChoice = application?.programChoices.find((choice) => choice.priority === 1)?.studyProgram;
  const primaryProgram = primaryChoice ? `${primaryChoice.name} (${primaryChoice.code})` : showSimulation ? "Pengembangan Perangkat Lunak dan Gim (PPLG)" : "Belum dipilih";

  const outcomeCopy = { title: "Simulasi Pindah Pilihan Studi", body: "Anda memilih alur simulasi alternatif. Pengajuan perubahan pilihan akan diproses setelah aturan dan kuota resmi ditetapkan sekolah." };

  return (
    <main className="student-dashboard-outer verification-outer">
      <div className="verification-shell">
        <header className="verification-topbar">
          <Link className="verification-topbar-brand" href="/portal">
            <span className="student-dashboard-brand-mark">CN</span>
            <span><strong>SPMB SMK CITRA NEGARA</strong><small>TAHUN AJARAN 2026/2027</small></span>
          </Link>
          <nav aria-label="Navigasi utama portal">
            <Link href="/portal/siswa">Portal Siswa</Link>
            <Link className="is-current" href="/portal/siswa/pengumuman-kelulusan" aria-current="page">Pengumuman Resmi</Link>
            <Link href="/#jadwal">Jadwal Gelombang</Link>
            <Link href="/#kontak">Hubungi SPMB</Link>
          </nav>
          <Link className="verification-account" href="/portal/siswa/profil">
            <span><strong>{studentName}</strong><small>No. Reg: {registrationNumber}</small></span>
            <span className="verification-avatar" aria-hidden="true">{studentName.charAt(0).toUpperCase()}</span>
          </Link>
        </header>

        <div className="student-dashboard-app verification-app">
          <StudentSidebar active="announcement" />
          <section className="student-dashboard-main verification-main graduation-main" aria-label="Dashboard Pengumuman Kelulusan">
            <header className="student-dashboard-header verification-page-header">
              <div>
                <h1>Dashboard Pengumuman Kelulusan</h1>
                <p>{studentName} <span aria-hidden="true">|</span> No. Reg: {registrationNumber}</p>
              </div>
              <span className="graduation-waiting-badge">Status: {showSimulation ? "Simulasi Hasil Seleksi" : hasSubmission ? "Menunggu Hasil Seleksi" : "Belum Ada Pendaftaran"}</span>
            </header>

            <section className="graduation-alert" aria-labelledby="graduation-alert-title">
              <h2 id="graduation-alert-title">{hasSubmission || showSimulation ? "Hasil Kelulusan Seleksi Belum Diumumkan" : "Belum Ada Pendaftaran"}</h2>
              <p>{hasSubmission || showSimulation ? <>Panitia SPMB SMK Citra Negara sedang merampungkan rekapitulasi nilai rapor, nilai tes TKA, dan kuota daya tampung masing-masing program studi keahlian. Pengumuman resmi dijadwalkan pada <strong>15 Maret 2026</strong>.</> : "Isi dan kirim formulir pendaftaran untuk melihat informasi hasil seleksi akun Anda di sini."}</p>
              {!hasSubmission && !showSimulation && <Link className="graduation-registration-link" href="/portal/siswa/formulir">Mulai isi formulir →</Link>}
            </section>

            <div className="graduation-simulation-toolbar">
              <h2 className="graduation-simulation-title">Hasil Seleksi Pendaftaran</h2>
              <button type="button" onClick={() => setShowSimulation((visible) => !visible)}>{showSimulation ? "Sembunyikan simulasi" : "Lihat simulasi hasil"}</button>
            </div>
            {showSimulation ? <div className="graduation-outcomes">
              <section className="graduation-outcome-card passed" aria-labelledby="graduation-passed-title">
                <div className="graduation-outcome-header">
                  <span className="graduation-outcome-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="1.7"/><path d="m9 12-1 9 4-2.5 4 2.5-1-9" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg></span>
                  <h3 id="graduation-passed-title">Simulasi: Lulus Seleksi</h3>
                  <span className="graduation-program-chip">PPLG Accepted</span>
                </div>
                <p>Selamat! Anda dinyatakan <strong>Lulus</strong> pada tahapan seleksi SPMB SMK Citra Negara 2026/2027 dan ditempatkan pada pilihan keahlian utama: <strong>{primaryProgram}</strong>.</p>
                <div className="graduation-action-copy">
                  <strong>Langkah Daftar Ulang:</strong>
                  <ul>
                    <li>Klik tombol daftar ulang di bawah.</li>
                    <li>Unduh Surat Pernyataan Lulus Resmi.</li>
                    <li>Bayar biaya pangkal administratif sebelum batas akhir.</li>
                  </ul>
                </div>
                <Link className="graduation-pass-button" href="/portal/siswa/surat-kelulusan?mode=demo">Lihat Surat Kelulusan Simulasi</Link>
              </section>

              <section className="graduation-outcome-card alternative" aria-labelledby="graduation-alternative-title">
                <div className="graduation-outcome-header">
                  <span className="graduation-outcome-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7"/><path d="M9 9l6 6m0-6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg></span>
                  <h3 id="graduation-alternative-title">Simulasi: Tidak Lulus</h3>
                </div>
                <p>Mohon maaf, berdasarkan hasil keputusan sidang pleno panitia admisi SPMB 2026/2027, nilai kualifikasi Anda belum memenuhi passing grade untuk program studi PPLG.</p>
                <div className="graduation-action-copy">
                  <strong>Rekomendasi Alternatif:</strong>
                  <ul>
                    <li>Anda dapat memindahkan pendaftaran Anda ke gelombang berikutnya.</li>
                    <li>Tersedia alternatif program studi yang masih terbuka: <strong>Bisnis Digital &amp; Ritel (BDR)</strong>.</li>
                  </ul>
                </div>
                <button className="graduation-transfer-button" type="button" onClick={() => setSelectedOutcome("alternative")}>Ajukan Pindah Pilihan Studi</button>
              </section>
            </div> : <p className="graduation-empty-note">Informasi hasil seleksi akan tampil setelah pengumuman resmi diterbitkan.</p>}
          </section>
        </div>
      </div>

      {selectedOutcome && <div className="tka-dialog-backdrop" role="presentation" onClick={() => setSelectedOutcome(null)}>
        <section className="tka-start-dialog graduation-dialog" role="dialog" aria-modal="true" aria-labelledby="graduation-dialog-title" onClick={(event) => event.stopPropagation()}>
          <span className="tka-dialog-icon" aria-hidden="true">i</span>
          <h2 id="graduation-dialog-title">{outcomeCopy.title}</h2>
          <p>{outcomeCopy.body}</p>
          <button type="button" onClick={() => setSelectedOutcome(null)}>Tutup</button>
        </section>
      </div>}
    </main>
  );
}
