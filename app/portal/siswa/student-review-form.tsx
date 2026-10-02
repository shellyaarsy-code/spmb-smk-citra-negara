"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deferStudentDraftHydration, readStudentDraft } from "./student-application-draft";
import { toStudentFormValues, useCurrentStudentData } from "./student-profile-client";
import { submitCurrentApplication, useCurrentDraftApplication } from "./student-application-client";
import { useAvailableDocumentTypes, useStudentDocuments } from "./student-documents-client";

const programs: Record<string, string> = {
  PPLG: "Pengembangan Perangkat Lunak dan Gim",
  TJKT: "Teknik Jaringan Komputer dan Telekomunikasi",
  DKV: "Desain Komunikasi Visual",
  MPLB: "Manajemen Perkantoran dan Layanan Bisnis",
  BDR: "Bisnis Digital dan Ritel",
  PHT: "Perhotelan",
};

const requiredFields = [
  "nik", "nisn", "fullName", "gender", "birthPlace", "birthDate", "religion", "familyCardNumber",
  "familyStatus", "citizenship", "streetAddress", "province", "city", "district", "village", "postalCode",
  "fatherName", "fatherOccupation", "fatherIncome", "motherName", "motherOccupation", "motherIncome",
  "parentWhatsapp", "schoolNpsn", "schoolName", "schoolType", "schoolStatus", "graduationYear",
  "semester1Average", "semester2Average", "semester3Average", "semester4Average", "primaryProgram", "backupProgram",
];

function ReviewSection({
  number,
  title,
  href,
  children,
}: {
  number: number;
  title: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section className="student-review-section">
      <div className="student-review-section-heading">
        <h3><span>{number}.</span> {title}</h3>
        <Link href={href}>Ubah Data</Link>
      </div>
      <dl className="student-review-values">{children}</dl>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return <div className="student-review-row"><dt>{label}</dt><dd>{value || "Belum diisi"}</dd></div>;
}

export default function StudentReviewForm() {
  const router = useRouter();
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [accepted, setAccepted] = useState(false);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data, loading: profileLoading, error: profileError } = useCurrentStudentData();
  const { application, setApplication, loading: applicationLoading, error: applicationError } = useCurrentDraftApplication();
  const { documents, loading: documentsLoading, error: documentsError } = useStudentDocuments();
  const { documentTypes, loading: documentTypesLoading, error: documentTypesError } = useAvailableDocumentTypes();

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

  function fieldValue(name: string) {
    return values[name]?.trim() || "Belum diisi";
  }

  const incompleteFields = requiredFields.filter((name) => !values[name]?.trim());
  const incompleteDocumentTypes = documentTypes.filter((documentType) =>
    documentType.required && !documents.some((document) => document.documentType.code === documentType.code),
  );
  const dataReady = !profileLoading && !applicationLoading && incompleteFields.length === 0;
  const documentsReady = !documentsLoading && !documentTypesLoading && incompleteDocumentTypes.length === 0;

  const primaryCode = values.primaryProgram ?? "";
  const backupCode = values.backupProgram ?? "";
  const programValue = (code: string) => !code.trim() ? "Belum diisi" : `${programs[code] ?? code} (${code})`;
  const savedBirthDate = values.birthDate?.trim();
  const birthDate = savedBirthDate
    ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${savedBirthDate}T00:00:00`))
    : "Belum diisi";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accepted) {
      setNotice("Centang pernyataan persetujuan sebelum melanjutkan.");
      return;
    }
    setSubmitting(true);
    setNotice("");
    try {
      const submittedApplication = await submitCurrentApplication();
      setApplication(submittedApplication);
      router.push("/portal/siswa/status-pendaftaran");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Formulir belum dapat dikirim. Coba kembali.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="student-review-form" onSubmit={handleSubmit}>
      <section className="student-review-intro">
        <h2>Ringkasan Formulir Pendaftaran Siswa</h2>
        <p>Periksa kembali ringkasan. Isian yang masih kosong akan ditandai “Belum diisi”.</p>
        <p className="privacy-note" role="note">Data profil dan draft aplikasi tersimpan pada akun Anda. Setelah dikirim, nomor pendaftaran akan diterbitkan.</p>
      </section>
      {(profileError || applicationError || documentsError || documentTypesError) && <p className="student-biodata-feedback has-error" role="alert">{profileError || applicationError || documentsError || documentTypesError}</p>}

      {(!dataReady || !documentsReady) && (
        <div className="student-review-warning" role="status">
          <strong>Data atau berkas masih belum lengkap.</strong>
          <span>
            {!dataReady && 'Isian kosong akan tampil sebagai “Belum diisi”. Pratinjau alur tetap bisa dilanjutkan. '}
            {!documentsReady && `Dokumen yang ditandai wajib belum tercatat: ${incompleteDocumentTypes.map((documentType) => documentType.name).join(", ")}.`}
          </span>
          <Link href="/portal/siswa/formulir/unggah-berkas">Periksa unggah berkas</Link>
        </div>
      )}

      <ReviewSection number={1} title="Data Profil & Identitas Calon Siswa" href="/portal/siswa/formulir">
        <ReviewRow label="Nama Lengkap" value={fieldValue("fullName")} />
        <ReviewRow label="NISN / NIK" value={`${fieldValue("nisn")} / ${fieldValue("nik")}`} />
        <ReviewRow label="Tempat, Tanggal Lahir" value={`${fieldValue("birthPlace")}, ${birthDate}`} />
      </ReviewSection>

      <ReviewSection number={2} title="Data Orang Tua & Riwayat Akademik" href="/portal/siswa/formulir/orang-tua">
        <ReviewRow label="Nama Ayah / Ibu" value={`${fieldValue("fatherName")} / ${fieldValue("motherName")}`} />
        <ReviewRow label="Sekolah Asal" value={fieldValue("schoolName")} />
      </ReviewSection>

      <ReviewSection number={3} title="Pilihan Program Keahlian" href="/portal/siswa/formulir/jurusan">
        <ReviewRow label="Pilihan 1 (Utama)" value={programValue(primaryCode)} />
        <ReviewRow label="Pilihan 2 (Cadangan)" value={programValue(backupCode)} />
      </ReviewSection>

      <label className="student-review-consent">
        <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
        <span>Saya menyatakan bahwa seluruh data yang saya masukkan adalah benar milik saya dan bersedia mengikuti segala tahapan dan aturan seleksi resmi dari SMK Citra Negara.</span>
      </label>

      <div className="student-review-actions">
        {!accepted && <p className="student-review-guidance">Centang pernyataan persetujuan untuk menjalankan simulasi finalisasi.</p>}
        <p className="student-review-notice" role="status">{notice}</p>
        <Link className="student-parent-back" href="/portal/siswa/formulir/unggah-berkas">Kembali ke Unggah Berkas</Link>
        <button className="student-biodata-next" type="submit" disabled={profileLoading || applicationLoading || submitting || application?.status === "SUBMITTED"}>
          {submitting ? "Mengirim..." : application?.status === "SUBMITTED" ? "Formulir Telah Dikirim" : "Kirim Formulir Pendaftaran"} <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
