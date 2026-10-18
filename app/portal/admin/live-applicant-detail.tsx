"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ApplicantDetail = {
  registrationNumber: string; status: string; submittedAt: string; admissionPeriod: string | null; admissionWave: string | null;
  student: { email: string; name: string | null; nisn: string | null; gender: string | null; birthPlace: string | null; birthDate: string | null; phoneNumber: string | null; address: string | null; province: string | null; city: string | null; district: string | null; village: string | null; postalCode: string | null; religion: string | null; schoolOrigin: string | null; schoolNpsn: string | null; schoolType: string | null; schoolStatus: string | null; graduationYear: string | null; parentWhatsapp: string | null };
  guardians: { guardianType: string; guardianName: string | null; relationship: string | null; occupation: string | null }[];
  programs: { priority: number; code: string; name: string }[]; semesterAverages: (string | null)[]; documentCount: number;
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draf", SUBMITTED: "Dikirim", WAITING_DOCUMENT_VERIFICATION: "Menunggu verifikasi dokumen",
  DOCUMENT_REVISION_REQUIRED: "Perlu revisi dokumen", DOCUMENT_VERIFIED: "Dokumen terverifikasi",
  WAITING_PAYMENT: "Menunggu pembayaran", PAYMENT_VERIFIED: "Pembayaran terverifikasi",
  ELIGIBLE_FOR_TKA: "Memenuhi syarat TKA", TKA_STARTED: "TKA berlangsung", TKA_COMPLETED: "TKA selesai",
  WAITING_SELECTION: "Menunggu seleksi", PASSED: "Lulus", WAITLISTED: "Daftar tunggu", FAILED: "Tidak lulus",
  REJECTED: "Ditolak", CANCELLED: "Dibatalkan", WITHDRAWN: "Mengundurkan diri",
};

function value(item: string | null | undefined) { return item?.trim() || "Belum diisi"; }
function Field({ label, value: item, wide = false }: { label: string; value: string | null | undefined; wide?: boolean }) { return <div className={`admin-detail-field ${wide ? "wide" : ""}`}><dt>{label}</dt><dd>{value(item)}</dd></div>; }

export default function LiveApplicantDetail({ registrationNumber }: { registrationNumber: string }) {
  const [applicant, setApplicant] = useState<ApplicantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/admin/applications/${encodeURIComponent(registrationNumber)}`, { cache: "no-store", signal: controller.signal });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || "Detail pendaftar belum dapat dimuat.");
        setApplicant(data);
      } catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Detail pendaftar belum dapat dimuat."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [registrationNumber]);

  if (loading) return <p role="status" className="admin-table-empty">Memuat detail pendaftar…</p>;
  if (error || !applicant) return <div className="admin-detail-not-found"><h1>{error || "Pendaftar tidak ditemukan"}</h1><Link className="button button-mini" href="/portal/admin/pendaftaran">Kembali ke daftar calon siswa</Link></div>;
  const student = applicant.student;

  return <>
    <header className="admin-dashboard-header admin-detail-page-header"><div className="admin-dashboard-heading"><h1>Detail Calon Siswa</h1><p>No. pendaftaran: {applicant.registrationNumber}</p></div></header>
    <div className="admin-applicant-detail-grid"><div className="admin-applicant-detail-main">
      <section className="admin-applicant-identity" aria-label="Identitas calon siswa"><span className="admin-applicant-avatar">{(student.name || "S").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><div className="admin-applicant-identity-copy"><h2>{value(student.name)}</h2><p>NISN: {value(student.nisn)}</p></div><span className="admin-detail-status pending">STATUS: {statusLabels[applicant.status] ?? applicant.status}</span></section>
      <section className="admin-applicant-data-card"><h2>Biodata Siswa</h2><dl className="admin-detail-fields">
        <Field label="Email akun" value={student.email} /><Field label="Nomor WhatsApp" value={student.phoneNumber} /><Field label="Tempat lahir" value={student.birthPlace} /><Field label="Tanggal lahir" value={student.birthDate ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(student.birthDate)) : null} /><Field label="Jenis kelamin" value={student.gender} /><Field label="Agama" value={student.religion} /><Field label="Alamat" value={[student.address, student.village, student.district, student.city, student.province, student.postalCode].filter(Boolean).join(", ")} wide />
      </dl></section>
      <section className="admin-applicant-data-card"><h2>Orang Tua / Wali</h2><dl className="admin-detail-fields"><Field label="WhatsApp orang tua" value={student.parentWhatsapp} />{applicant.guardians.map((guardian) => <div className="admin-detail-field" key={guardian.guardianType}><dt>{guardian.guardianType === "FATHER" ? "Ayah" : guardian.guardianType === "MOTHER" ? "Ibu" : "Wali"}</dt><dd>{[guardian.guardianName, guardian.relationship, guardian.occupation].filter(Boolean).join(" · ") || "Belum diisi"}</dd></div>)}</dl></section>
      <section className="admin-applicant-data-card"><h2>Sekolah dan Nilai Akademik</h2><dl className="admin-detail-fields"><Field label="Sekolah asal" value={student.schoolOrigin} /><Field label="NPSN" value={student.schoolNpsn} /><Field label="Jenis/status sekolah" value={[student.schoolType, student.schoolStatus].filter(Boolean).join(" · ")} /><Field label="Tahun lulus" value={student.graduationYear} />{applicant.semesterAverages.map((average, index) => <Field key={index} label={`Rata-rata semester ${index + 1}`} value={average} />)}</dl></section>
      <section className="admin-applicant-data-card"><h2>Pilihan Program</h2><ol>{applicant.programs.map((program) => <li key={program.priority}>{program.priority}. {program.code} — {program.name}</li>)}</ol></section>
    </div><aside className="admin-applicant-detail-side"><section className="admin-verification-decision"><h2>Dokumen Pendaftaran</h2><p>{applicant.documentCount} dokumen tercatat</p><Link className="admin-verification-action review" href={`/portal/admin/verifikasi-berkas/${encodeURIComponent(applicant.registrationNumber)}`}>Buka review dokumen</Link></section><section className="admin-verification-decision"><h2>Status aplikasi</h2><p>{statusLabels[applicant.status] ?? applicant.status}</p><p>Dikirim: {new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(applicant.submittedAt))}</p><p>Periode: {value(applicant.admissionPeriod)}</p><p>Gelombang: {value(applicant.admissionWave)}</p></section></aside></div>
  </>;
}
