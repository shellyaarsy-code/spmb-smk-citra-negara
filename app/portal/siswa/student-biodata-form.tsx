"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCurrentStudentData, toStudentFormValues } from "./student-profile-client";

function PhotoPlaceholder() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="7" fill="#F1F4F1" />
      <circle cx="24" cy="18" r="8" fill="#A5B3AA" />
      <path d="M9 43c1.4-8.5 7.2-13 15-13s13.6 4.5 15 13" fill="#A5B3AA" />
    </svg>
  );
}

type SelectOption = { value: string; label: string };
type FieldProps = {
  label: string;
  name: string;
  value: string;
  className?: string;
  type?: "text" | "date";
  options?: SelectOption[];
  pattern?: string;
  patternMessage?: string;
  maxLength?: number;
  inputMode?: "text" | "numeric";
};

function DateField({ label, name, value }: { label: string; name: string; value: string }) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState(value);
  const [year, month, day] = date.split("-").map(Number);
  const formattedDate = date
    ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(year, month - 1, day))
    : "";

  function openPicker() {
    const picker = pickerRef.current;
    if (!picker) return;
    if (typeof picker.showPicker === "function") picker.showPicker();
    else picker.click();
  }

  return (
    <label className="student-biodata-field">
      <span>{label}<i aria-hidden="true">*</i></span>
      <span className="student-date-control">
        <input type="text" value={formattedDate} readOnly required aria-label={label} />
        <button className="student-date-button" type="button" onClick={openPicker} aria-label="Pilih tanggal lahir">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
        </button>
        <input ref={pickerRef} className="student-date-native" name={name} type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Kalender tanggal lahir" />
      </span>
    </label>
  );
}

function Field({ label, name, value, className = "", type = "text", options, pattern, patternMessage, maxLength, inputMode }: FieldProps) {
  if (type === "date") return <DateField label={label} name={name} value={value} />;

  return (
    <label className={`student-biodata-field ${className}`}>
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
          placeholder={label.startsWith("Nomor") || label.startsWith("No.") ? `Masukkan ${label.toLowerCase()}` : `Masukkan ${label.toLowerCase()}`}
          required
          pattern={pattern}
          title={patternMessage}
          maxLength={maxLength}
          inputMode={inputMode}
        />
      )}
    </label>
  );
}

export default function StudentBiodataForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, loading, error } = useCurrentStudentData();
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [pending, setPending] = useState(false);
  const values = data ? toStudentFormValues(data) : {};

  useEffect(() => {
    if (!photo) return;

    const objectUrl = URL.createObjectURL(photo);
    const timer = window.setTimeout(() => setPreview(objectUrl), 0);
    return () => { window.clearTimeout(timer); URL.revokeObjectURL(objectUrl); };
  }, [photo]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedPhoto = event.target.files?.[0];
    if (!selectedPhoto) return;
    setPhoto(selectedPhoto);
    setFeedback("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowValidation(true);
    if (!event.currentTarget.checkValidity()) {
      setFeedback("Periksa kolom bertanda * dan pastikan format NIK, NISN, nomor KK, serta kode pos sudah benar.");
      event.currentTarget.reportValidity();
      return;
    }
    const profile = Object.fromEntries(
      Array.from(new FormData(event.currentTarget).entries()).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );
    setPending(true);
    setFeedback("");

    try {
      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setFeedback(result?.error || "Data biodata belum dapat disimpan.");
        return;
      }
      router.push("/portal/siswa/formulir/orang-tua");
    } catch {
      setFeedback("Data biodata belum dapat disimpan. Periksa koneksi lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  const fileSize = photo ? `${Math.max(1, Math.round(photo.size / 1024))} KB` : "";
  const fileName = photo?.name ?? "Belum ada foto dipilih";
  const fileType = photo?.type === "image/png" ? "PNG" : "JPG";

  return (
    <form key={loading ? "loading" : "loaded"} className={`student-biodata-form ${showValidation ? "was-validated" : ""}`} aria-busy={loading || pending} onSubmit={handleSubmit}>
      <p className="privacy-note" role="note">Data biodata disimpan pada akun Anda dan dapat diperbarui kembali melalui formulir ini.</p>
      <section className="student-biodata-section" aria-labelledby="personal-info-title">
        <h2 id="personal-info-title">Informasi Identitas Pribadi</h2>
        <p className="student-biodata-hint">Pastikan NISN dan NIK divalidasi dengan baik untuk menghindari kesalahan sinkronisasi Dapodik.</p>

        <div className="student-biodata-grid student-biodata-grid-two">
          <Field label="Nomor Induk Kependudukan (NIK)" name="nik" value={values.nik ?? ""} pattern="[0-9]{16}" patternMessage="NIK harus terdiri dari 16 digit angka." maxLength={16} inputMode="numeric" />
          <Field label="Nomor Induk Siswa Nasional (NISN)" name="nisn" value={values.nisn ?? ""} pattern="[0-9]{10}" patternMessage="NISN harus terdiri dari 10 digit angka." maxLength={10} inputMode="numeric" />
          <Field label="Nama Lengkap Calon Siswa" name="fullName" value={values.fullName ?? ""} />
          <Field label="Jenis Kelamin" name="gender" value={values.gender ?? ""} options={[{ value: "male", label: "Laki-laki" }, { value: "female", label: "Perempuan" }]} />
        </div>

        <div className="student-biodata-grid student-biodata-grid-three">
          <Field label="Tempat Lahir" name="birthPlace" value={values.birthPlace ?? ""} />
          <Field label="Tanggal Lahir" name="birthDate" value={values.birthDate ?? ""} type="date" />
          <Field label="Agama" name="religion" value={values.religion ?? ""} options={[{ value: "islam", label: "Islam" }, { value: "kristen", label: "Kristen" }, { value: "katolik", label: "Katolik" }, { value: "hindu", label: "Hindu" }, { value: "buddha", label: "Buddha" }, { value: "konghucu", label: "Konghucu" }, { value: "lainnya", label: "Lainnya" }]} />
          <Field label="No. Kartu Keluarga (KK)" name="familyCardNumber" value={values.familyCardNumber ?? ""} pattern="[0-9]{16}" patternMessage="Nomor KK harus terdiri dari 16 digit angka." maxLength={16} inputMode="numeric" />
          <Field label="Status Dalam Keluarga" name="familyStatus" value={values.familyStatus ?? ""} options={[{ value: "anak-kandung", label: "Anak Kandung" }, { value: "anak-angkat", label: "Anak Angkat" }, { value: "anak-tiri", label: "Anak Tiri" }, { value: "lainnya", label: "Lainnya" }]} />
          <Field label="Kewarganegaraan" name="citizenship" value={values.citizenship ?? ""} options={[{ value: "wni", label: "Warga Negara Indonesia (WNI)" }, { value: "wna", label: "Warga Negara Asing (WNA)" }]} />
        </div>
      </section>

      <section className="student-biodata-section student-address-section" aria-labelledby="address-title">
        <h2 id="address-title">Alamat Tempat Tinggal Lengkap</h2>
        <div className="student-biodata-grid student-biodata-grid-one">
          <Field label="Alamat Jalan, RT/RW, Dusun" name="streetAddress" value={values.streetAddress ?? ""} />
        </div>
        <div className="student-biodata-grid student-biodata-grid-three">
          <Field label="Provinsi" name="province" value={values.province ?? ""} />
          <Field label="Kota/Kabupaten" name="city" value={values.city ?? ""} />
          <Field label="Kecamatan" name="district" value={values.district ?? ""} />
        </div>
        <div className="student-biodata-grid student-biodata-grid-two">
          <Field label="Kelurahan/Desa" name="village" value={values.village ?? ""} />
          <Field label="Kode Pos" name="postalCode" value={values.postalCode ?? ""} pattern="[0-9]{5}" patternMessage="Kode pos harus terdiri dari 5 digit angka." maxLength={5} inputMode="numeric" />
        </div>
      </section>

      <section className="student-biodata-section student-photo-section" aria-labelledby="photo-title">
        <h2 id="photo-title">Pas Foto Resmi Calon Siswa (3×4)</h2>
        <div className="student-photo-upload">
          <input ref={inputRef} className="student-photo-input" type="file" accept="image/jpeg,image/png" onChange={handlePhotoChange} aria-label="Pilih pas foto calon siswa" />
          <div className="student-photo-preview">
            {preview ? <Image src={preview} alt="Pratinjau pas foto yang dipilih" width={96} height={128} unoptimized /> : <PhotoPlaceholder />}
          </div>
          <div className="student-photo-details">
            <strong>{fileName}</strong>
            <span>{photo ? `${fileSize} | Format: ${fileType} | Pratinjau lokal` : "Format JPG atau PNG · Maksimal 2 MB"}</span>
          </div>
          <button className="student-photo-change" type="button" onClick={() => inputRef.current?.click()}>
            {photo ? "Ganti Foto" : "Pilih Foto"}
          </button>
        </div>
        <p className="student-photo-note">Gunakan foto terbaru dengan latar yang jelas.</p>
      </section>

      <div className="student-biodata-actions">
        <p className={`student-biodata-feedback ${feedback.startsWith("Periksa") || error ? "has-error" : ""}`} aria-live="polite">{feedback || (error && !loading ? error : "")}</p>
        <button className="student-biodata-next" type="submit" disabled={loading || pending}>{pending ? "Menyimpan..." : "Lanjut ke Data Orang Tua"} <span aria-hidden="true">→</span></button>
      </div>
    </form>
  );
}
