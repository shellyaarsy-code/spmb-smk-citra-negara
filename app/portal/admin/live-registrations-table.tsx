"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AdminIcon } from "./admin-sidebar";
import { getApplicationStatusTone } from "./status-labels";

type Program = { code: string; name: string };
type ApplicantRow = { registrationNumber: string; status: string; submittedAt: string; name: string | null; nisn: string | null; programs: { priority: number; code: string; name: string }[] };
type Result = { applicants: ApplicantRow[]; pagination: { page: number; pageSize: number; total: number; totalPages: number }; filters: { programs: Program[] } };
const documentStatuses = { PENDING: "Menunggu verifikasi", VERIFIED: "Terverifikasi", REJECTED: "Ditolak", REVISION_REQUIRED: "Perlu revisi" } as const;

const statusLabels: Record<string, string> = {
  DRAFT: "Draf", SUBMITTED: "Dikirim", WAITING_DOCUMENT_VERIFICATION: "Menunggu verifikasi dokumen",
  DOCUMENT_REVISION_REQUIRED: "Perlu revisi dokumen", DOCUMENT_VERIFIED: "Dokumen terverifikasi",
  WAITING_PAYMENT: "Menunggu pembayaran", PAYMENT_VERIFIED: "Pembayaran terverifikasi",
  ELIGIBLE_FOR_TKA: "Memenuhi syarat TKA", TKA_STARTED: "TKA berlangsung", TKA_COMPLETED: "TKA selesai",
  WAITING_SELECTION: "Menunggu seleksi", PASSED: "Lulus", WAITLISTED: "Daftar tunggu", FAILED: "Tidak lulus",
  REJECTED: "Ditolak", CANCELLED: "Dibatalkan", WITHDRAWN: "Mengundurkan diri",
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default function LiveRegistrationsTable() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("");
  const [status, setStatus] = useState(() => {
    const initialStatus = searchParams.get("status") ?? "";
    return Object.hasOwn(statusLabels, initialStatus) ? initialStatus : "";
  });
  const [documentStatus, setDocumentStatus] = useState(() => {
    const initialStatus = searchParams.get("documentStatus") ?? "";
    return Object.hasOwn(documentStatuses, initialStatus) ? initialStatus : "";
  });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true); setError("");
      const params = new URLSearchParams({ page: String(page), pageSize: "10" });
      if (search.trim()) params.set("search", search.trim());
      if (program) params.set("program", program);
      if (status) params.set("status", status);
      if (documentStatus) params.set("documentStatus", documentStatus);
      try {
        const response = await fetch(`/api/admin/applications?${params}`, { cache: "no-store", signal: controller.signal });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || "Daftar pendaftar belum dapat dimuat.");
        setResult(data); setError("");
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Daftar pendaftar belum dapat dimuat.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [search, program, status, documentStatus, page]);

  const rows = result?.applicants ?? [];
  const pagination = result?.pagination;
  const totalPages = Math.max(pagination?.totalPages ?? 0, 1);

  return <>
    <header className="admin-dashboard-header admin-registrations-header">
      <div className="admin-dashboard-heading"><h1>Daftar Calon Siswa</h1><p>Data aplikasi yang sudah dikirim, diurutkan dari pengiriman terbaru.</p></div>
      <div className="admin-dashboard-header-actions"><label className="admin-dashboard-search"><AdminIcon name="search" /><input type="search" placeholder="Cari nomor, nama, atau NISN" aria-label="Cari nomor pendaftaran, nama, atau NISN" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label></div>
    </header>

    <section className="admin-registration-filters" aria-label="Filter daftar calon siswa">
      <label className="admin-filter-select"><span>Program:</span><select value={program} onChange={(event) => { setProgram(event.target.value); setPage(1); }}><option value="">Semua Program</option>{result?.filters.programs.map((item) => <option value={item.code} key={item.code}>{item.code} — {item.name}</option>)}</select></label>
      <label className="admin-filter-select"><span>Status:</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Semua Status</option>{Object.entries(statusLabels).filter(([key]) => key !== "DRAFT").map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
      <label className="admin-filter-select"><span>Status dokumen:</span><select value={documentStatus} onChange={(event) => { setDocumentStatus(event.target.value); setPage(1); }}><option value="">Semua dokumen</option>{Object.entries(documentStatuses).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
      <button className="admin-export-button" type="button" onClick={() => { setSearch(""); setProgram(""); setStatus(""); setDocumentStatus(""); setPage(1); }}>Reset filter</button>
    </section>

    <section className="admin-registrations-table-card" aria-label="Tabel daftar calon siswa">
      {error && <p className="admin-table-empty" role="alert">{error}</p>}
      {loading && <p className="admin-table-empty" role="status">Memuat daftar pendaftar…</p>}
      {!loading && !error && <>
        <div className="admin-table-toolbar"><span className="admin-table-count">{pagination?.total ? `Menampilkan ${(page - 1) * (pagination?.pageSize ?? 10) + 1}–${Math.min(page * (pagination?.pageSize ?? 10), pagination.total)} dari ${pagination.total} pendaftar` : "Belum ada aplikasi yang dikirim."}</span></div>
        <div className="admin-table-scroll"><table className="admin-registrations-table admin-live-registrations-table">
          <thead><tr><th>No. Pendaftaran</th><th>Nama Calon Siswa</th><th>NISN</th><th>Program Pilihan</th><th>Tgl Dikirim</th><th>Status Aplikasi</th><th>Aksi</th></tr></thead>
          <tbody>{rows.map((applicant) => <tr key={applicant.registrationNumber}>
            <td className="admin-registration-number">{applicant.registrationNumber}</td><td className="admin-applicant-name">{applicant.name || "Nama belum diisi"}</td><td className="admin-applicant-nisn">{applicant.nisn || "—"}</td>
            <td>{applicant.programs.length ? applicant.programs.map((item) => `${item.priority}. ${item.code}`).join(" · ") : "—"}</td><td className="admin-applicant-date">{dateLabel(applicant.submittedAt)}</td>
            <td><span className={`admin-applicant-status ${getApplicationStatusTone(applicant.status)}`}>{statusLabels[applicant.status] ?? applicant.status}</span></td><td><Link className="admin-detail-button" href={`/portal/admin/pendaftaran/${encodeURIComponent(applicant.registrationNumber)}`}>Detail</Link></td>
          </tr>)}{!rows.length && <tr><td className="admin-table-empty" colSpan={7}>Tidak ada pendaftar yang sesuai dengan filter.</td></tr>}</tbody>
        </table></div>
        <div className="admin-table-pagination"><button type="button" className="admin-page-button admin-page-edge" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Sebelumnya</button><span>Halaman {page} dari {totalPages}</span><button type="button" className="admin-page-button admin-page-edge" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Selanjutnya</button></div>
      </>}
    </section>
  </>;
}
