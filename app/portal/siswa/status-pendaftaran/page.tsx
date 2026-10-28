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

  const statusCopy: Record<string, { label: string; title: string; description: string }> = {
    DRAFT: { label: "Draft", title: "Draft Pendaftaran Tersimpan", description: "Draft tersimpan pada akun Anda dan belum dikirim." },
    SUBMITTED: { label: "Terkirim", title: "Pendaftaran Berhasil Dikirim", description: "Formulir Anda telah dikirim dan tersimpan pada akun Anda." },
    WAITING_DOCUMENT_VERIFICATION: { label: "Menunggu Verifikasi Berkas", title: "Berkas Sedang Diverifikasi", description: "Admin sedang memeriksa dokumen pendaftaran Anda." },
    DOCUMENT_REVISION_REQUIRED: { label: "Perlu Perbaikan Berkas", title: "Perlu Perbaikan Dokumen", description: "Periksa catatan verifikasi dan unggah ulang dokumen yang diminta." },
    DOCUMENT_VERIFIED: { label: "Berkas Terverifikasi", title: "Dokumen Terverifikasi", description: "Tahap verifikasi dokumen telah selesai." },
    WAITING_PAYMENT: { label: "Menunggu Pembayaran", title: "Menunggu Pembayaran", description: "Periksa informasi pembayaran resmi yang tersedia pada portal." },
    PAYMENT_VERIFIED: { label: "Pembayaran Terverifikasi", title: "Pembayaran Terverifikasi", description: "Pembayaran Anda telah dikonfirmasi." },
    ELIGIBLE_FOR_TKA: { label: "Siap Mengikuti TKA", title: "Siap Mengikuti TKA", description: "Periksa jadwal ujian dan instruksi pada portal." },
    TKA_STARTED: { label: "TKA Berlangsung", title: "Ujian TKA Berlangsung", description: "Selesaikan ujian sesuai instruksi yang diberikan." },
    TKA_COMPLETED: { label: "TKA Selesai", title: "Ujian TKA Selesai", description: "Ujian telah selesai. Pantau informasi tahap berikutnya." },
    WAITING_SELECTION: { label: "Menunggu Seleksi", title: "Menunggu Hasil Seleksi", description: "Pantau pengumuman resmi hasil seleksi melalui portal." },
    PASSED: { label: "Lulus Seleksi", title: "Dinyatakan Lulus Seleksi", description: "Periksa pengumuman dan informasi lanjutan dari sekolah." },
    WAITLISTED: { label: "Daftar Tunggu", title: "Masuk Daftar Tunggu", description: "Pantau informasi lanjutan dari sekolah mengenai status daftar tunggu." },
    FAILED: { label: "Hasil Seleksi Tersedia", title: "Hasil Seleksi Tersedia", description: "Periksa hasil dan informasi resmi yang tersedia pada portal." },
    REJECTED: { label: "Ditolak", title: "Pendaftaran Ditolak", description: "Periksa status dan informasi yang tersedia pada portal. Hubungi admin sekolah jika membutuhkan penjelasan." },
    CANCELLED: { label: "Dibatalkan", title: "Pendaftaran Dibatalkan", description: "Status pendaftaran tercatat dibatalkan." },
    WITHDRAWN: { label: "Ditarik", title: "Pendaftaran Ditarik", description: "Status pendaftaran tercatat ditarik." },
  };
  const currentStatusCopy = application ? statusCopy[application.status] : undefined;
  const showProgressMark = Boolean(isSubmitted && application && !["DOCUMENT_REVISION_REQUIRED", "WAITLISTED", "FAILED", "REJECTED", "CANCELLED", "WITHDRAWN"].includes(application.status));

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
            <span className="student-status-badge">{loading ? "Memuat status..." : `Status: ${application ? currentStatusCopy?.label ?? application.status : "Belum Ada Draft"}`}</span>
          </header>
          {error && <p className="student-biodata-feedback has-error" role="alert">{error}</p>}

          <section className="student-submission-card" aria-labelledby="submission-title">
            {loading ? (
              <div className="student-submission-empty"><h2>Memuat draft aplikasi</h2><p>Data draft sedang dimuat dari akun Anda.</p></div>
            ) : application ? (
              <>
                {showProgressMark && <span className="student-submission-check" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none"><path d="m12 24 8 8 17-18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>}
                <h2 id="submission-title">{currentStatusCopy?.title ?? "Status Pendaftaran"}</h2>
                <p className="student-submission-description">{currentStatusCopy?.description ?? "Periksa status pendaftaran Anda pada portal."}</p>

                <dl className="student-submission-summary">
                  <div><dt>Nomor Pendaftaran:</dt><dd className="student-submission-number">{application.registrationNumber ?? "Belum diterbitkan"}</dd></div>
                  {submittedAt && <div><dt>Waktu Pengiriman:</dt><dd>{submittedAt}</dd></div>}
                  <div><dt>Status:</dt><dd><span className="student-submission-status">{currentStatusCopy?.label ?? application.status}</span></dd></div>
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
