"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentSidebar from "../student-sidebar";
import { deferStudentDraftHydration, readStudentDraft } from "../student-application-draft";
import { toStudentFormValues, useCurrentStudentData } from "../student-profile-client";
import { useCurrentDraftApplication } from "../student-application-client";

const profileGroups = [
  { title: "Identitas Siswa", fields: [["Nama lengkap", "fullName"], ["NISN", "nisn"], ["NIK", "nik"], ["Jenis kelamin", "gender"], ["Tempat, tanggal lahir", "birthPlace"], ["Agama", "religion"]] },
  { title: "Data Pendaftaran", fields: [["Program utama", "primaryProgram"], ["Program cadangan", "backupProgram"], ["Sekolah asal", "schoolName"], ["Tahun lulus", "graduationYear"]] },
  { title: "Kontak Keluarga", fields: [["Nama ayah", "fatherName"], ["Nama ibu", "motherName"], ["WhatsApp orang tua", "parentWhatsapp"]] },
];

export default function StudentProfilePage() {
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const { data, loading, error } = useCurrentStudentData();
  const { application, loading: applicationLoading, error: applicationError } = useCurrentDraftApplication();

  useEffect(() => deferStudentDraftHydration(() => {
    const draft = readStudentDraft();
    setDraftValues(draft.values);
  }), []);

  const values = { ...draftValues, ...(data ? toStudentFormValues(data) : {}) };

  return (
    <main className="student-dashboard-outer">
      <div className="student-dashboard-app">
        <StudentSidebar active="profile" />
        <section className="student-dashboard-main student-profile-main" aria-label="Profil siswa">
          <header className="student-dashboard-header">
            <div><h1>Profil Siswa</h1><p>Ringkasan data yang tersimpan pada formulir pendaftaran Anda.</p></div>
            <span className="student-status-badge">{loading || applicationLoading ? "Memuat profil..." : `Status: ${application?.status ?? "Draft belum tersedia"}`}</span>
          </header>
          {(error || applicationError) && <p className="student-biodata-feedback has-error" role="alert">{error || applicationError}</p>}
          {profileGroups.map((group) => (
            <section className="student-profile-card" key={group.title}>
              <h2>{group.title}</h2>
              <dl>{group.fields.map(([label, key]) => <div key={key}><dt>{label}</dt><dd>{values[key]?.trim() || "Belum diisi"}</dd></div>)}</dl>
            </section>
          ))}
          <Link className="student-dashboard-action" href="/portal/siswa/formulir">Ubah Data Pendaftaran →</Link>
        </section>
      </div>
    </main>
  );
}
