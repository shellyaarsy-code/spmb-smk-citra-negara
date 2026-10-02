"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentSidebar from "../student-sidebar";
import { deferStudentDraftHydration, readStudentDraft } from "../student-application-draft";
import { useStudentDemoMode } from "../student-demo-mode";
import { toStudentFormValues, useCurrentStudentData } from "../student-profile-client";
import { useCurrentDraftApplication } from "../student-application-client";

const paymentSteps = [
  { number: "1", title: "Konfirmasi rincian", description: "Pastikan nominal, metode, dan tujuan pembayaran berasal dari sekolah." },
  { number: "2", title: "Lakukan pembayaran", description: "Bayar sesuai instruksi resmi yang telah dikonfirmasi." },
  { number: "3", title: "Simpan bukti", description: "Simpan bukti transaksi yang jelas dan dapat dibaca." },
  { number: "4", title: "Kirim untuk verifikasi", description: "Unggah bukti ketika fitur telah diaktifkan oleh sekolah." },
];

const paymentStates = [
  { name: "Belum Dibayar", tone: "unpaid", description: "Pembayaran belum tercatat. Periksa informasi resmi sebelum melakukan pembayaran." },
  { name: "Menunggu Verifikasi", tone: "pending", description: "Bukti pembayaran telah dikirim dan sedang ditinjau oleh panitia." },
  { name: "Lunas", tone: "paid", description: "Pembayaran telah terverifikasi dan akses ujian dapat dibuka." },
  { name: "Perlu Perbaikan", tone: "revision", description: "Data atau bukti pembayaran perlu diperbaiki sesuai catatan panitia." },
];

function getProgramCode(program: string) {
  const normalized = program.trim().toLowerCase();
  const codeByName: Record<string, string> = {
    pplg: "PPLG",
    "pengembangan perangkat lunak dan gim": "PPLG",
    tjkt: "TJKT",
    "teknik jaringan komputer dan telekomunikasi": "TJKT",
    dkv: "DKV",
    "desain komunikasi visual": "DKV",
    mplb: "MPLB",
    "manajemen perkantoran dan layanan bisnis": "MPLB",
    bdr: "BDR",
    "bisnis digital dan ritel": "BDR",
    pht: "PHT",
    perhotelan: "PHT",
  };
  if (codeByName[normalized]) return codeByName[normalized];
  const matchedProgram = Object.entries(codeByName).find(([name]) => normalized.includes(name));
  if (matchedProgram) return matchedProgram[1];
  return program || "Belum dipilih";
}

export default function StudentFormPaymentPage() {
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
    backupProgram: application.programChoices.find((choice) => choice.priority === 2)?.studyProgram.code ?? "",
  } : {}), ...(data ? toStudentFormValues(data) : {}) };

  const studentName = values.fullName?.trim() || (isDemoMode ? "Rahman Aditya" : "Belum diisi");
  const nisn = values.nisn?.trim() || (isDemoMode ? "00987654321" : "Belum diisi");
  const program = getProgramCode(values.primaryProgram?.trim() || (isDemoMode ? "PPLG" : ""));
  const registrationNumber = application?.registrationNumber || (isDemoMode ? "CN260012" : "Belum diterbitkan");
  const hasApplication = Boolean(application) || isDemoMode;

  return (
    <main className="student-dashboard-outer verification-outer">
      <div className="verification-shell">
        <header className="verification-topbar payment-topbar">
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
            <span><strong>{values.fullName?.trim() || (isDemoMode ? "Rahman Aditya" : "Calon Siswa")}</strong><small>No. Reg: {registrationNumber}</small></span>
            <span className="verification-avatar" aria-hidden="true">{studentName.charAt(0).toUpperCase()}</span>
          </Link>
        </header>

        <div className="student-dashboard-app verification-app">
          <StudentSidebar active="payment" />
          <section className="student-dashboard-main verification-main payment-main" aria-label="Pembayaran Formulir">
            <header className="student-dashboard-header verification-page-header">
              <div>
                <h1>Pembayaran Formulir</h1>
                <p>{hasApplication || isDemoMode ? "Periksa rincian pembayaran dan status verifikasi formulir pendaftaran Anda." : "Lengkapi dan kirim formulir pendaftaran terlebih dahulu untuk melanjutkan ke tahap pembayaran."}</p>
              </div>
              <span className={`payment-status-badge ${!hasApplication && !isDemoMode ? "payment-status-empty" : ""}`}>{isDemoMode ? "DEMO · Pembayaran" : hasApplication ? "Informasi Pembayaran Belum Tersedia" : "Belum Ada Pendaftaran"}</span>
            </header>
            <div className="payment-preview-row">
              <span>{isDemoMode ? "MODE DEMO · Contoh tampilan dan data simulasi, bukan status pembayaran resmi." : "Rincian pembayaran akan muncul setelah dikonfirmasi sekolah."}</span>
              {!isDemoMode && <Link href="/portal/siswa/pembayaran-formulir?mode=demo">Buka demo · Pembayaran</Link>}
              {!isDemoMode && <Link href="/portal/siswa/ujian-tka?mode=demo">Buka demo · Ujian TKA</Link>}
            </div>

            <section className="payment-access-notice" aria-label="Informasi akses ujian">
              <span className="payment-notice-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3 4.5 6v5.5c0 4.5 3.2 7.7 7.5 9.5 4.3-1.8 7.5-5 7.5-9.5V6L12 3Z" stroke="currentColor" strokeWidth="1.8"/><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              <div><h2>Akses ujian terbuka setelah pembayaran terverifikasi</h2><p>Panitia akan membuka akses ujian hanya setelah status pembayaran berubah menjadi Lunas. Jadwal ujian perlu dikonfirmasi sekolah.</p></div>
            </section>

            <div className="payment-main-grid">
              <div className="payment-primary-column">
                <section className="payment-unavailable-card" aria-labelledby="payment-info-title">
                  <div className="payment-unavailable-heading">
                    <span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M3.5 9h17M8 14h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span>
                    <h2 id="payment-info-title">{hasApplication ? "Informasi pembayaran belum tersedia" : "Belum ada pendaftaran"}</h2>
                    <strong>{hasApplication ? "Perlu dikonfirmasi sekolah" : "Isi formulir terlebih dahulu"}</strong>
                  </div>
                  <p>{hasApplication ? "Informasi nominal dan tujuan pembayaran belum dikonfirmasi. Jangan melakukan pembayaran sebelum menerima informasi resmi dari sekolah." : "Kirim formulir pendaftaran terlebih dahulu. Informasi pembayaran akan ditampilkan setelah tahapan pendaftaran dan ketentuan sekolah dikonfirmasi."}</p>
                  <div className="payment-unavailable-actions">
                    {hasApplication ? <button type="button" disabled aria-disabled="true">⇧ &nbsp;Unggah Bukti Pembayaran</button> : <Link href="/portal/siswa/formulir">Mulai Isi Formulir →</Link>}
                    <a href="https://wa.me/6281277889900" target="_blank" rel="noreferrer">☎ &nbsp;Hubungi Panitia</a>
                  </div>
                </section>

                <section className="payment-fee-card" aria-labelledby="payment-fee-title">
                  <h2 id="payment-fee-title">Rincian Biaya</h2>
                  <p>Rincian berikut menunggu konfirmasi resmi dari sekolah.</p>
                  <dl>
                    <div><dt>Biaya formulir</dt><dd>Perlu dikonfirmasi sekolah</dd></div>
                    <div><dt>Metode pembayaran</dt><dd>Perlu dikonfirmasi sekolah</dd></div>
                    <div><dt>Nomor rekening / tujuan</dt><dd>Perlu dikonfirmasi sekolah</dd></div>
                    <div><dt>Batas pembayaran</dt><dd>Perlu dikonfirmasi sekolah</dd></div>
                    <div><dt>Total pembayaran</dt><dd>Perlu dikonfirmasi sekolah</dd></div>
                  </dl>
                </section>
              </div>

              <div className="payment-secondary-column">
                <section className="payment-applicant-card" aria-labelledby="payment-applicant-title">
                  <h2 id="payment-applicant-title">Ringkasan Pendaftar</h2>
                  <dl>
                    <div><dt>Nama</dt><dd>{studentName}</dd></div>
                    <div><dt>NISN</dt><dd>{nisn}</dd></div>
                    <div><dt>No. Pendaftaran</dt><dd>{registrationNumber}</dd></div>
                    <div><dt>Program utama</dt><dd>{program}</dd></div>
                  </dl>
                </section>

                <section className="payment-instructions-card" aria-labelledby="payment-instructions-title">
                  <h2 id="payment-instructions-title">Instruksi Pembayaran</h2>
                  <p>Ikuti informasi resmi dan hindari tujuan pembayaran yang tidak terverifikasi.</p>
                  <ol>
                    {paymentSteps.map((step) => <li key={step.number}><span>{step.number}</span><div><strong>{step.title}</strong><p>{step.description}</p></div></li>)}
                  </ol>
                </section>
              </div>
            </div>

            <section className="payment-status-guide" aria-labelledby="payment-status-guide-title">
              <h2 id="payment-status-guide-title">Panduan Status Pembayaran</h2>
              <p>Gunakan status ini untuk mengetahui tindakan berikutnya dan kesiapan akses ujian.</p>
              <div className="payment-state-grid">
                {paymentStates.map((state) => <article className={`payment-state-card ${state.tone}`} key={state.name}>
                  <h3><span aria-hidden="true" />{state.name}</h3><p>{state.description}</p>
                </article>)}
              </div>
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}
