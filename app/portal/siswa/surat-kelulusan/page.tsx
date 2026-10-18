"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BrandLogo from "../../../components/brand-logo";
import StudentSidebar from "../student-sidebar";
import { deferStudentDraftHydration, readStudentDraft } from "../student-application-draft";
import { useStudentDemoMode } from "../student-demo-mode";
import { toStudentFormValues, useCurrentStudentData } from "../student-profile-client";
import { useCurrentDraftApplication } from "../student-application-client";

export default function OfficialGraduationLetterPage() {
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
  const nisn = values.nisn?.trim() || (isDemoMode ? "00987654321" : "Belum diisi");
  const schoolName = values.schoolName?.trim() || (isDemoMode ? "SMP Negeri 1 Depok" : "Belum diisi");
  const program = values.primaryProgram?.trim() || (isDemoMode ? "Pengembangan Perangkat Lunak dan Gim (PPLG)" : "Belum dipilih");
  const registrationNumber = application?.registrationNumber || (isDemoMode ? "CN260012" : "Belum diterbitkan");

  return (
    <main className="student-dashboard-outer verification-outer">
      <div className="verification-shell">
        <header className="verification-topbar official-letter-topbar">
          <Link className="verification-topbar-brand" href="/portal">
            <BrandLogo className="student-dashboard-brand-mark" />
            <span><strong>SPMB SMK CITRA NEGARA</strong><small>TAHUN AJARAN 2026/2027</small></span>
          </Link>
          <nav aria-label="Navigasi utama portal">
            <Link href="/portal/siswa">Portal Siswa</Link>
            <Link className="is-current" href="/portal/siswa/pengumuman-kelulusan" aria-current="location">Pengumuman Resmi</Link>
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
          <section className="student-dashboard-main verification-main official-letter-main" aria-label="Surat Keputusan Kelulusan Resmi">
            <header className="student-dashboard-header verification-page-header">
              <div>
                <h1>Surat Keputusan Kelulusan Resmi</h1>
                <p>SMK Citra Negara Depok <span aria-hidden="true">|</span> Tahun Ajaran 2026/2027</p>
              </div>
              <span className={`official-letter-status ${isDemoMode ? "official-letter-demo-status" : ""}`}>{isDemoMode ? "Simulasi: Lulus Seleksi" : "Surat Belum Tersedia"}</span>
            </header>

            {isDemoMode ? <div className="official-letter-layout">
              <article className="official-letter-card" aria-labelledby="official-letter-title">
                <h2 id="official-letter-title">Surat Pengumuman Penerimaan Calon Siswa Baru</h2>
                <p className="official-letter-meta">Diterbitkan pada 15 Maret 2026 <span aria-hidden="true">|</span> No. SK. 421.5/098/CN/PPDB/2026</p>
                <div className="official-letter-rule" />

                <p className="official-letter-body">Berdasarkan keputusan rapat pleno panitia pelaksana Sistem Penerimaan Murid Baru (SPMB) SMK Citra Negara Depok Tahun Ajaran 2026/2027, dengan ini menyatakan bahwa: Nama: <strong>{studentName.toUpperCase()}</strong> NISN: <strong>{nisn}</strong> Asal Sekolah: <strong>{schoolName}</strong> dinyatakan <strong className="official-letter-pass-word">LULUS SELEKSI AKADEMIK</strong> dan diterima sebagai siswa SMK Citra Negara pada Program Studi Keahlian <strong>{program}</strong> Gelombang 1.</p>

                <section className="official-reenrollment-box" aria-labelledby="reenrollment-title">
                  <h3 id="reenrollment-title"><span aria-hidden="true">▤</span> Alur &amp; Dokumen Daftar Ulang Calon Siswa:</h3>
                  <ol>
                    <li>Nominal, metode, tujuan, dan batas pembayaran akan ditampilkan setelah dikonfirmasi resmi oleh sekolah. Periksa halaman pembayaran sebelum melakukan transaksi.</li>
                    <li>Isi Surat Pernyataan Siswa Baru setelah dokumen resmi dan petunjuk pengumpulan tersedia.</li>
                  </ol>
                </section>

                <div className="official-letter-footer">
                  <strong>Informasi tenggat daftar ulang menunggu konfirmasi sekolah.</strong>
                  <button type="button" onClick={() => window.print()}>Unduh Surat Kelulusan (PDF)</button>
                </div>
              </article>

              <aside className="official-archive-card" aria-labelledby="official-archive-title">
                <h2 id="official-archive-title">Arsip Pengumuman SPMB</h2>
                <Link href="/portal/siswa/ujian-tka"><strong>Jadwal Ujian USM Gelombang 1</strong><span>05 Februari 2026</span></Link>
                <Link href="/portal/siswa/pengumuman-kelulusan"><strong>Panduan Pengisian Surat Pernyataan</strong><span>01 Februari 2026</span></Link>
              </aside>
            </div> : <section className="official-letter-empty">
              <h2>Surat kelulusan belum tersedia</h2>
              <p>Surat resmi akan tampil setelah sekolah mengumumkan hasil seleksi dan menerbitkan keputusan untuk pendaftar.</p>
              <Link className="student-dashboard-action" href="/portal/siswa/pengumuman-kelulusan">Kembali ke Pengumuman →</Link>
              <Link className="verification-preview-link" href="/portal/siswa/surat-kelulusan?mode=demo">Buka demo · Surat kelulusan</Link>
            </section>}
          </section>
        </div>
      </div>
    </main>
  );
}
