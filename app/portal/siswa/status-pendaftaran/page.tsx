"use client";

import Link from "next/link";
import StudentSidebar from "../student-sidebar";
import { useCurrentDraftApplication } from "../student-application-client";

export default function StudentRegistrationStatusPage() {
  const { application, loading, error } = useCurrentDraftApplication();
  const primaryProgram = application?.programChoices.find((choice) => choice.priority === 1)?.studyProgram;
  const isSubmitted = Boolean(application && application.status !== "DRAFT");
  const submittedAt = application?.submittedAt
    ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(application.submittedAt)) + " WIB"
    : null;

  return (
    <main className="student-dashboard-outer">
      <div className="student-dashboard-app">
        <StudentSidebar active="dashboard" />

        <section className="student-dashboard-main student-submission-main" aria-label="Status pendaftaran siswa">
          <header className="student-dashboard-header">
            <div>
              <h1>Status Pendaftaran</h1>
              <p>Periksa status dan ringkasan pengiriman formulir pendaftaran Anda.</p>
            </div>
            <span className="student-status-badge">{loading ? "Memuat status..." : `Status: ${application?.status ?? "Belum Ada Draft"}`}</span>
          </header>
          {error && <p className="student-biodata-feedback has-error" role="alert">{error}</p>}

          <section className="student-submission-card" aria-labelledby="submission-title">
            {loading ? (
              <div className="student-submission-empty"><h2>Memuat draft aplikasi</h2><p>Data draft sedang dimuat dari akun Anda.</p></div>
            ) : application ? (
              <>
                {isSubmitted && <span className="student-submission-check" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none"><path d="m12 24 8 8 17-18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>}
                <h2 id="submission-title">{isSubmitted ? "Pendaftaran Berhasil Dikirim" : "Draft Pendaftaran Tersimpan"}</h2>
                <p className="student-submission-description">{isSubmitted ? "Formulir Anda telah dikirim dan tersimpan pada akun Anda." : "Draft tersimpan pada akun Anda dan belum dikirim."}</p>

                <dl className="student-submission-summary">
                  <div><dt>Nomor Pendaftaran:</dt><dd className="student-submission-number">{application.registrationNumber ?? "Belum diterbitkan"}</dd></div>
                  {submittedAt && <div><dt>Waktu Pengiriman:</dt><dd>{submittedAt}</dd></div>}
                  <div><dt>Status:</dt><dd><span className="student-submission-status">{application.status}</span></dd></div>
                  <div><dt>Jurusan Terpilih (Utama):</dt><dd>{primaryProgram ? `${primaryProgram.name} (${primaryProgram.code})` : "Belum dipilih"}</dd></div>
                </dl>

                <div className="student-submission-actions">
                  {!isSubmitted && <Link className="student-parent-back" href="/portal/siswa/formulir">Lanjutkan Draft</Link>}
                  <Link className="student-parent-back" href="/portal/siswa">Kembali ke Dashboard</Link>
                </div>
              </>
            ) : (
              <div className="student-submission-empty">
                <h2 id="submission-title">Belum Ada Pengiriman Formulir</h2>
                <p>Lengkapi formulir pendaftaran untuk melihat status dan ringkasan pengiriman Anda di sini.</p>
                <Link className="student-biodata-next" href="/portal/siswa/formulir">Mulai Isi Formulir</Link>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
