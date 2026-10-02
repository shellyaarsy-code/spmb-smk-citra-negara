"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveCurrentDraftApplication, useCurrentDraftApplication } from "./student-application-client";
import { applyStudentFormValues, toStudentFormValues, useCurrentStudentData } from "./student-profile-client";

type Option = { value: string; label: string };

function ParentField({
  label,
  name,
  value,
  options,
  pattern,
  patternMessage,
  maxLength,
  type = "text",
  min,
  max,
  step,
  inputMode,
}: {
  label: string;
  name: string;
  value: string;
  options?: Option[];
  pattern?: string;
  patternMessage?: string;
  maxLength?: number;
  type?: "text" | "tel" | "number";
  min?: number;
  max?: number;
  step?: number;
  inputMode?: "text" | "numeric" | "tel";
}) {
  return (
    <label className="student-biodata-field">
      <span>{label}<i aria-hidden="true">*</i></span>
      {options ? (
        <select name={name} defaultValue={value} required>
          <option value="">Pilih {label.toLowerCase()}</option>
          {options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={value}
          placeholder={`Masukkan ${label.toLowerCase()}`}
          required
          pattern={pattern}
          title={patternMessage}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          inputMode={inputMode}
        />
      )}
    </label>
  );
}

const occupationOptions = [
  { value: "wiraswasta", label: "Wiraswasta" },
  { value: "pns", label: "PNS" },
  { value: "karyawan-swasta", label: "Karyawan Swasta" },
  { value: "guru-dosen", label: "Guru/Dosen" },
  { value: "tni-polri", label: "TNI/Polri" },
  { value: "petani-nelayan", label: "Petani/Nelayan" },
  { value: "ibu-rumah-tangga", label: "Ibu Rumah Tangga" },
  { value: "lainnya", label: "Lainnya" },
];

const incomeOptions = [
  { value: "none", label: "Tidak Ada/Ibu Rumah Tangga" },
  { value: "below-1", label: "Di bawah Rp 1.000.000" },
  { value: "1-to-2-5", label: "Rp 1.000.000 - Rp 2.500.000" },
  { value: "2-5-to-5", label: "Rp 2.500.000 - Rp 5.000.000" },
  { value: "5-to-7-5", label: "Rp 5.000.000 - Rp 7.500.000" },
  { value: "above-7-5", label: "Di atas Rp 7.500.000" },
];

export default function StudentParentForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);
  const { data, loading: profileLoading, error: profileError } = useCurrentStudentData();
  const { application, setApplication, loading: applicationLoading, error: applicationError } = useCurrentDraftApplication();

  useEffect(() => {
    if (formRef.current && data) applyStudentFormValues(formRef.current, toStudentFormValues(data));
  }, [data]);

  useEffect(() => {
    if (!formRef.current || !application) return;
    applyStudentFormValues(formRef.current, {
      semester1Average: application.semester1Average ?? "",
      semester2Average: application.semester2Average ?? "",
      semester3Average: application.semester3Average ?? "",
      semester4Average: application.semester4Average ?? "",
    });
  }, [application]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowValidation(true);
    if (!event.currentTarget.checkValidity()) {
      setFeedback("Periksa kolom bertanda * dan pastikan semua nilai rapor berada di antara 0 dan 100.");
      event.currentTarget.reportValidity();
      return;
    }
    const form = event.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    setFeedback("");

    try {
      const saved = await saveCurrentDraftApplication({
        profile: {
          parentWhatsapp: formData.get("parentWhatsapp"),
          schoolNpsn: formData.get("schoolNpsn"),
          schoolName: formData.get("schoolName"),
          schoolType: formData.get("schoolType"),
          schoolStatus: formData.get("schoolStatus"),
          graduationYear: formData.get("graduationYear"),
        },
        guardians: [
          {
            guardianType: "FATHER",
            guardianName: formData.get("fatherName"),
            occupation: formData.get("fatherOccupation"),
            incomeBracket: formData.get("fatherIncome"),
          },
          {
            guardianType: "MOTHER",
            guardianName: formData.get("motherName"),
            occupation: formData.get("motherOccupation"),
            incomeBracket: formData.get("motherIncome"),
          },
        ],
        semesterAverages: {
          semester1Average: formData.get("semester1Average"),
          semester2Average: formData.get("semester2Average"),
          semester3Average: formData.get("semester3Average"),
          semester4Average: formData.get("semester4Average"),
        },
      });
      setApplication(saved);
      router.push("/portal/siswa/formulir/jurusan");
    } catch {
      setFeedback("Data orang tua belum dapat disimpan. Periksa koneksi lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form ref={formRef} className={`student-biodata-form student-parent-form ${showValidation ? "was-validated" : ""}`} aria-busy={profileLoading || applicationLoading || pending} onSubmit={handleSubmit}>
      <section className="student-biodata-section" aria-labelledby="parents-info-title">
        <h2 id="parents-info-title">Data Orang Tua Kandung &amp; Wali</h2>
        <div className="student-biodata-grid student-biodata-grid-three student-parent-grid">
          <ParentField label="Nama Ayah Kandung" name="fatherName" value="" />
          <ParentField label="Pekerjaan Ayah" name="fatherOccupation" value="" options={occupationOptions} />
          <ParentField label="Penghasilan Bulanan" name="fatherIncome" value="" options={incomeOptions} />
          <ParentField label="Nama Ibu Kandung" name="motherName" value="" />
          <ParentField label="Pekerjaan Ibu" name="motherOccupation" value="" options={occupationOptions} />
          <ParentField label="Penghasilan Bulanan" name="motherIncome" value="" options={incomeOptions} />
        </div>
        <div className="student-biodata-grid student-biodata-grid-one student-parent-phone">
          <ParentField label="Nomor WhatsApp Orang Tua" name="parentWhatsapp" value="" type="tel" pattern="0[0-9]{9,13}" patternMessage="Masukkan nomor WhatsApp dengan 10 sampai 14 digit dan diawali angka 0." maxLength={14} inputMode="tel" />
        </div>
      </section>

      <section className="student-biodata-section student-parent-school" aria-labelledby="school-info-title">
        <h2 id="school-info-title">Informasi Pendidikan Asal Sekolah</h2>
        <div className="student-biodata-grid student-biodata-grid-two student-parent-school-first-row">
          <ParentField label="NPSN Sekolah Asal" name="schoolNpsn" value="" pattern="[0-9]{8}" patternMessage="NPSN harus terdiri dari 8 digit angka." maxLength={8} inputMode="numeric" />
          <ParentField label="Nama Sekolah Asal" name="schoolName" value="" />
        </div>
        <div className="student-biodata-grid student-biodata-grid-three student-parent-grid">
          <ParentField label="Jenis Sekolah" name="schoolType" value="" options={[{ value: "smp", label: "SMP" }, { value: "mts", label: "MTs" }, { value: "lainnya", label: "Lainnya" }]} />
          <ParentField label="Status Sekolah" name="schoolStatus" value="" options={[{ value: "negeri", label: "Negeri" }, { value: "swasta", label: "Swasta" }]} />
          <ParentField label="Tahun Lulus" name="graduationYear" value="" pattern="[0-9]{4}" patternMessage="Tahun lulus harus terdiri dari 4 digit angka." maxLength={4} inputMode="numeric" />
        </div>
      </section>

      <section className="student-biodata-section student-grades-section" aria-labelledby="grades-title">
        <h2 id="grades-title">Rata-Rata Nilai Rapor (Semester 1–4)</h2>
        <p className="student-biodata-hint">Nilai gabungan mata pelajaran Bahasa Indonesia, Matematika, IPA, dan Bahasa Inggris.</p>
        <div className="student-biodata-grid student-biodata-grid-four">
          {["", "", "", ""].map((value, index) => (
            <ParentField key={index} label={`Rerata Smt ${index + 1}`} name={`semester${index + 1}Average`} value={value} type="number" min={0} max={100} step={0.01} inputMode="numeric" />
          ))}
        </div>
      </section>

      <div className="student-biodata-actions student-parent-actions">
        <p className={`student-biodata-feedback ${feedback.startsWith("Periksa") || profileError || applicationError ? "has-error" : ""}`} aria-live="polite">{feedback || (profileError && !profileLoading ? profileError : applicationError && !applicationLoading ? applicationError : "")}</p>
        <Link className="student-parent-back" href="/portal/siswa/formulir">Kembali ke Biodata</Link>
        <button className="student-biodata-next" type="submit" disabled={profileLoading || applicationLoading || pending}>{pending ? "Menyimpan..." : "Lanjut ke Program Keahlian"} <span aria-hidden="true">→</span></button>
      </div>
    </form>
  );
}
