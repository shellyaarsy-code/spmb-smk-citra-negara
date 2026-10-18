"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import StudentSidebar from "./student-sidebar";
import { deferStudentDraftHydration, readStudentDraft } from "./student-application-draft";
import { toStudentFormValues, useCurrentStudentData } from "./student-profile-client";
import { useCurrentDraftApplication } from "./student-application-client";
import { useAvailableDocumentTypes, useStudentDocuments } from "./student-documents-client";
import StudentAnnouncements from "./student-announcements";

const requiredFormFields = ["nik", "nisn", "fullName", "gender", "birthPlace", "birthDate", "religion", "familyCardNumber", "familyStatus", "citizenship", "streetAddress", "province", "city", "district", "village", "postalCode", "fatherName", "fatherOccupation", "fatherIncome", "motherName", "motherOccupation", "motherIncome", "parentWhatsapp", "schoolNpsn", "schoolName", "schoolType", "schoolStatus", "graduationYear", "semester1Average", "semester2Average", "semester3Average", "semester4Average", "primaryProgram", "backupProgram"];

function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    home: <><path d="m3.5 10 8.5-7 8.5 7" /><path d="M5.5 9v11h13V9M9 20v-6h6v6" /></>,
    form: <><path d="M7 3.5h7l4 4V20H7z" /><path d="M14 3.5v5h5M9.5 12h6M9.5 15.5h6" /><path d="M4.5 6.5v15h12" /></>,
    upload: <><path d="M12 15V3m0 0L8 7m4-4 4 4" /><path d="M5 13v6h14v-6" /></>,
    clipboard: <><rect x="5" y="5" width="14" height="16" rx="2" /><path d="M9 5V3h6v2M8.5 10h7M8.5 14h7M8.5 18h4" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    logout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.3 2.3 0 1 1 3.8 1.7c-1 .8-1.6 1.2-1.6 2.8M12 17h.01" /></>,
  };

  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function StudentDashboardPage() {
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const { data, loading, error } = useCurrentStudentData();
  const { application, loading: applicationLoading, error: applicationError } = useCurrentDraftApplication();
  const { documents, loading: documentsLoading } = useStudentDocuments();
  const { documentTypes, loading: documentTypesLoading } = useAvailableDocumentTypes();

  useEffect(() => deferStudentDraftHydration(() => {
    const draft = readStudentDraft();
    setDraftValues(draft.values);
  }), []);

  const applicationValues: Record<string, string> = application ? {
    semester1Average: application.semester1Average ?? "",
    semester2Average: application.semester2Average ?? "",
    semester3Average: application.semester3Average ?? "",
    semester4Average: application.semester4Average ?? "",
    primaryProgram: application.programChoices.find((choice) => choice.priority === 1)?.studyProgram.code ?? "",
    backupProgram: application.programChoices.find((choice) => choice.priority === 2)?.studyProgram.code ?? "",
  } : {};
  const values: Record<string, string> = { ...draftValues, ...applicationValues, ...(data ? toStudentFormValues(data) : {}) };

  const formComplete = requiredFormFields.every((field) => Boolean(values[field]?.trim()));
  const requiredTypes = documentTypes.filter((documentType) => documentType.required);
  const requiredDocsComplete = !documentsLoading && !documentTypesLoading && requiredTypes.every((documentType) =>
    documents.some((document) => document.documentType.code === documentType.code),
  );
  // Keep the current global stage on registration until final review is
  // submitted; verification starts only after that submission.
  const nextStage = !formComplete ? 1 : 2;
  const stages = ["Pendaftaran Akun", "Isi Formulir", "Unggah Berkas", "Verifikasi", "Pembayaran", "Ujian TKA", "Hasil Seleksi"].map((label, index) => {
    const completed = index === 0 || (index === 1 && formComplete) || (index === 2 && formComplete && requiredDocsComplete);
    return {
      label,
      state: index === nextStage ? "current" : index < nextStage ? completed ? "complete" : "incomplete" : "upcoming",
    };
  });
  const programs: Record<string, string> = { PPLG: "Pengembangan Perangkat Lunak dan Gim", TJKT: "Teknik Jaringan Komputer dan Telekomunikasi", DKV: "Desain Komunikasi Visual", MPLB: "Manajemen Perkantoran dan Layanan Bisnis", BDR: "Bisnis Digital dan Ritel", PHT: "Perhotelan" };
  const averageValues = [1, 2, 3, 4].map((semester) => Number(values[`semester${semester}Average`]));
  const averageSummary = averageValues.every((value) => Number.isFinite(value) && value > 0) ? (averageValues.reduce((sum, value) => sum + value, 0) / 4).toFixed(2) : "Belum diisi";
  const documentRows: [string, string][] = [
    ["Pilihan Program Keahlian Utama", values.primaryProgram ? `${values.primaryProgram} (${programs[values.primaryProgram] ?? values.primaryProgram})` : "Belum dipilih"],
    ["Sekolah Asal", values.schoolName?.trim() || "Belum diisi"],
    ["Nilai Rata-rata Rapor Smt 1–4", averageSummary],
    ...documents.map((document): [string, string] => [`${document.documentType.name} · ${document.status}`, document.fileName]),
  ];
  if (documents.length === 0) documentRows.push(["Dokumen", "Belum ada catatan dokumen"]);
  const hasDraft = Object.keys(draftValues).length > 0 || documents.length > 0;
  const activities = application
    ? [["Draft aplikasi tersimpan", "Belum dikirim"]]
    : hasDraft
      ? [["Data aplikasi sementara tersedia", "Belum dikirim ke database aplikasi"]]
      : [["Belum ada aktivitas pendaftaran", "Mulai dengan mengisi formulir siswa"]];

  return (
    <main className="student-dashboard-outer">
      <div className="student-dashboard-app">
        <StudentSidebar active="dashboard" />

        <section className="student-dashboard-main" aria-label="Ringkasan dashboard siswa">
          <header className="student-dashboard-header">
            <div>
              <h1>Selamat Datang{values.fullName?.trim() ? `, ${values.fullName.trim()}` : ", Calon Siswa"}</h1>
              <p>NISN: {values.nisn?.trim() || "Belum diisi"} <span aria-hidden="true">|</span> No. Pendaftaran: {application?.registrationNumber || "Belum diterbitkan"}</p>
            </div>
            <span className="student-status-badge">{loading || applicationLoading ? "Memuat profil..." : `Status: ${application?.status ?? "Belum ada draft"}`}</span>
          </header>
          {(error || applicationError) && <p className="student-biodata-feedback has-error" role="alert">{error || applicationError}</p>}

          <section className="student-progress" aria-label="Tahapan pendaftaran">
            {stages.map((stage, index) => (
              <div className={`student-progress-stage ${stage.state}`} key={stage.label}>
                <span className="student-progress-marker" aria-hidden="true">{stage.state === "complete" ? "✓" : index + 1}</span>
                <span className="student-progress-label">{stage.label}</span>
                {index < stages.length - 1 && <span className="student-progress-line" aria-hidden="true" />}
              </div>
            ))}
          </section>

          <div className="student-dashboard-grid">
            <div className="student-dashboard-primary-column">
              <section className="student-next-step" aria-labelledby="student-next-step-title">
                <div className="student-card-title-row">
                  <Icon name="help" />
                  <h2 id="student-next-step-title">Langkah Anda Selanjutnya</h2>
                </div>
                <p>{!formComplete ? "Lengkapi formulir pendaftaran agar ringkasan dapat diperbarui." : !requiredDocsComplete ? "Unggah berkas tersedia pada tahap berikutnya, setelah fitur dokumen diaktifkan." : "Draft aplikasi tersimpan dan belum dikirim."}</p>
                <div className="student-deadline"><strong>Langkah selanjutnya:</strong><span>{!formComplete ? "Isi formulir pendaftaran" : !requiredDocsComplete ? "Unggah berkas" : "Tinjau draft"}</span></div>
                <Link className="student-dashboard-action" href={!formComplete ? "/portal/siswa/formulir" : !requiredDocsComplete ? "/portal/siswa/formulir/unggah-berkas" : "/portal/siswa/formulir/review"}>Lanjutkan draft →</Link>
              </section>

              <section className="student-dashboard-card student-documents-card" aria-labelledby="student-documents-title">
                <h2 id="student-documents-title">Ringkasan Berkas Pendaftaran</h2>
                <dl className="student-document-list">
                  {documentRows.map(([label, value]) => (
                    <div className="student-document-row" key={label}>
                      <dt>{label}</dt>
                      <dd className={value.includes("Diterima") ? "is-accepted" : ""}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>

            <div className="student-dashboard-secondary-column">
              <section className="student-dashboard-card student-announcements-card" aria-labelledby="student-announcements-title">
                <div className="student-card-title-row student-announcement-heading">
                  <h2 id="student-announcements-title">Pengumuman Terbaru</h2>
                  <Icon name="bell" />
                </div>
                <StudentAnnouncements />
              </section>

              <section className="student-dashboard-card student-activity-card" aria-labelledby="student-activity-title">
                <h2 id="student-activity-title">Log Aktivitas Akun</h2>
                <ol className="student-activity-list">
                  {activities.map(([title, date]) => (
                    <li key={title}><span className="student-activity-dot" aria-hidden="true" /><div><h3>{title}</h3><time>{date}</time></div></li>
                  ))}
                </ol>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
