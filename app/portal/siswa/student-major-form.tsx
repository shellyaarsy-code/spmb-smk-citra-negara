"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  saveCurrentDraftApplication,
  useAvailableStudyPrograms,
  useCurrentDraftApplication,
  type StudentApplicationDraft,
  type StudentStudyProgram,
} from "./student-application-client";

type Program = StudentStudyProgram;

function ProgramField({
  label,
  name,
  value,
  onChange,
  programs,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  programs: Program[];
}) {
  return (
    <label className="student-biodata-field student-major-field">
      <span>{label}</span>
      <select name={name} value={value} onChange={(event) => onChange(event.target.value)} required>
        <option value="">Pilih program keahlian</option>
        {programs.map((program) => (
          <option key={program.code} value={program.code}>
            {program.name} ({program.code})
          </option>
        ))}
      </select>
    </label>
  );
}

function ProgramInfo({ program, priority }: { program: Program; priority: "utama" | "cadangan" }) {
  return (
    <article className={`student-major-info ${priority === "utama" ? "is-primary" : "is-backup"}`}>
      <h3>{program.code} ({program.name})</h3>
      <p>Informasi kapasitas belum tersedia.</p>
      <p className="student-major-requirement">Persyaratan khusus belum tersedia.</p>
    </article>
  );
}

export default function StudentMajorForm() {
  const router = useRouter();
  const [primaryCode, setPrimaryCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);
  const { application, setApplication, loading: applicationLoading, error: applicationError } = useCurrentDraftApplication();
  const { programs, loading: programsLoading, error: programsError } = useAvailableStudyPrograms();

  const [syncedApplication, setSyncedApplication] = useState<StudentApplicationDraft | null>(null);
  if (application && application !== syncedApplication) {
    setSyncedApplication(application);
    const choices = [...application.programChoices].sort((left, right) => left.priority - right.priority);
    setPrimaryCode(choices.find((choice) => choice.priority === 1)?.studyProgram.code ?? "");
    setBackupCode(choices.find((choice) => choice.priority === 2)?.studyProgram.code ?? "");
  }

  const primary = programs.find((program) => program.code === primaryCode);
  const backup = programs.find((program) => program.code === backupCode);

  function changePrimary(nextCode: string) {
    if (nextCode === backupCode) setBackupCode(primaryCode);
    setPrimaryCode(nextCode);
    setFeedback("");
  }

  function changeBackup(nextCode: string) {
    if (nextCode === primaryCode) setPrimaryCode(backupCode);
    setBackupCode(nextCode);
    setFeedback("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const extraChoices = (application?.programChoices ?? [])
      .filter((choice) => choice.priority > 2)
      .map((choice) => ({ code: choice.studyProgram.code, priority: choice.priority }));
    const programChoices = [
      ...(primaryCode ? [{ code: primaryCode, priority: 1 }] : []),
      ...(backupCode ? [{ code: backupCode, priority: 2 }] : []),
      ...extraChoices,
    ];

    setPending(true);
    setFeedback("");
    try {
      const saved = await saveCurrentDraftApplication({ programChoices });
      setApplication(saved);
      router.push("/portal/siswa/formulir/unggah-berkas");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Pilihan program belum dapat disimpan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="student-biodata-form student-major-form" aria-busy={applicationLoading || programsLoading || pending} onSubmit={handleSubmit}>
      <section className="student-biodata-section" aria-labelledby="major-selection-title">
        <h2 id="major-selection-title">Pemilihan Program Keahlian (Jurusan)</h2>
        <p className="student-biodata-hint student-major-hint">Anda diwajibkan memilih 2 Pilihan Program Keahlian yang berbeda sebagai cadangan prioritas kedua.</p>
        <div className="student-biodata-grid student-biodata-grid-two student-major-fields">
          <ProgramField label="Pilihan Program Keahlian Utama (Pilihan 1)" name="primaryProgram" value={primaryCode} onChange={changePrimary} programs={programs} />
          <ProgramField label="Pilihan Program Keahlian Cadangan (Pilihan 2)" name="backupProgram" value={backupCode} onChange={changeBackup} programs={programs} />
        </div>
      </section>

      <section className="student-biodata-section student-major-capacity" aria-labelledby="major-capacity-title">
        <h2 id="major-capacity-title">Informasi Kapasitas Pendaftar &amp; Persyaratan Khusus</h2>
        <div className="student-biodata-grid student-biodata-grid-two student-major-cards">
          {primary ? <ProgramInfo program={primary} priority="utama" /> : <article className="student-major-info is-primary"><p>Pilih program utama untuk melihat informasi kapasitas dan persyaratan.</p></article>}
          {backup ? <ProgramInfo program={backup} priority="cadangan" /> : <article className="student-major-info is-backup"><p>Pilih program cadangan untuk melihat informasi kapasitas dan persyaratan.</p></article>}
        </div>
      </section>

      <div className="student-biodata-actions student-parent-actions student-major-actions">
        <p className="student-biodata-feedback" role={feedback || applicationError || programsError || (!programsLoading && programs.length === 0) ? "alert" : undefined} aria-live="polite">{feedback || applicationError || programsError || (!programsLoading && programs.length === 0 ? "Belum ada program yang tersedia." : "")}</p>
        <Link className="student-parent-back" href="/portal/siswa/formulir/orang-tua">Kembali ke Data Akademik</Link>
        <button className="student-biodata-next" type="submit" disabled={applicationLoading || programsLoading || pending || Boolean(applicationError) || Boolean(programsError)}>{pending ? "Menyimpan..." : "Lanjut ke Unggah Berkas"} <span aria-hidden="true">→</span></button>
      </div>
    </form>
  );
}
