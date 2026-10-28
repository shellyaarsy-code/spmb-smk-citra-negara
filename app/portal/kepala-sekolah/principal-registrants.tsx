"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PrincipalSidebar from "./principal-sidebar";
import { demoPpdbMetrics, formatPpdbNumber } from "../demo-ppdb-data";

type Status = "Verifikasi" | "Lulus" | "Revisi Dokumen" | "Belum Lengkap";
type Applicant = { name: string; nisn: string; school: string; program: string; score: string; status: Status; registration: string };

const sampleApplicants: Applicant[] = [
  { name: "Rahman Aditya", nisn: "00987654321", school: "SMP Negeri 1 Depok", program: "PPLG", score: "88.40", status: "Verifikasi", registration: "CN260012" },
  { name: "Siti Aminah", nisn: "00911223344", school: "SMPN 2 Cibinong", program: "DKV", score: "92.15", status: "Lulus", registration: "CN260013" },
  { name: "Budi Santoso", nisn: "00944556677", school: "SMP Citra Negara", program: "TJKT", score: "84.20", status: "Lulus", registration: "CN260014" },
  { name: "Dewi Lestari", nisn: "00877889900", school: "MTs Negeri 1 Jakarta", program: "MPLB", score: "86.50", status: "Verifikasi", registration: "CN260015" },
  { name: "Aditya Pratama", nisn: "00933445566", school: "SMP Kartika Depok", program: "BDR", score: "82.00", status: "Lulus", registration: "CN260016" },
  { name: "Fajar Nugraha", nisn: "00789012345", school: "SMP Negeri 4 Depok", program: "PHT", score: "78.50", status: "Belum Lengkap", registration: "CN260017" },
  { name: "Nadia Putri", nisn: "00922334455", school: "SMP Negeri 3 Depok", program: "PPLG", score: "90.25", status: "Lulus", registration: "CN260018" },
  { name: "Rizky Firmansyah", nisn: "00866778899", school: "SMP PGRI 2 Bogor", program: "TJKT", score: "80.75", status: "Revisi Dokumen", registration: "CN260019" },
  { name: "Intan Permata", nisn: "00955667788", school: "SMP Negeri 6 Depok", program: "DKV", score: "91.00", status: "Lulus", registration: "CN260020" },
  { name: "Yoga Saputra", nisn: "00811223345", school: "SMP Bina Bangsa", program: "BDR", score: "76.80", status: "Verifikasi", registration: "CN260021" },
  { name: "Putri Maharani", nisn: "00999887766", school: "SMP Negeri 1 Cibinong", program: "MPLB", score: "87.60", status: "Lulus", registration: "CN260022" },
  { name: "Rafi Akbar", nisn: "00822334455", school: "SMP Negeri 8 Depok", program: "PHT", score: "79.30", status: "Revisi Dokumen", registration: "CN260023" },
  { name: "Citra Amelia", nisn: "00988776655", school: "SMP Tunas Harapan", program: "PPLG", score: "89.10", status: "Lulus", registration: "CN260024" },
  { name: "Bagas Maulana", nisn: "00833445566", school: "SMP Negeri 5 Bogor", program: "TJKT", score: "83.25", status: "Belum Lengkap", registration: "CN260025" },
  { name: "Aulia Rahma", nisn: "00944332211", school: "SMP Negeri 2 Depok", program: "DKV", score: "93.40", status: "Lulus", registration: "CN260026" },
];

const programs = ["PPLG", "TJKT", "DKV", "MPLB", "BDR", "PHT"];
const statuses: Status[] = ["Verifikasi", "Lulus", "Revisi Dokumen", "Belum Lengkap"];

function PrincipalIcon({ name }: { name: "search" | "download" | "close" }) {
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" /></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M4 17v3h16v-3" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function StatCard({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) {
  return <article className={`principal-list-stat ${tone}`}><span>{label}</span><div><strong>{value}</strong><small>{note}</small></div></article>;
}

export default function PrincipalRegistrants({ demo }: { demo: boolean }) {
  const [query, setQuery] = useState("");
  const [program, setProgram] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Applicant | null>(null);

  const filtered = useMemo(() => sampleApplicants.filter((applicant) => {
    const needle = query.trim().toLocaleLowerCase("id-ID");
    const matchesQuery = !needle || [applicant.name, applicant.nisn, applicant.school, applicant.registration].some((value) => value.toLocaleLowerCase("id-ID").includes(needle));
    return matchesQuery && (!program || applicant.program === program) && (!status || applicant.status === status);
  }), [query, program, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 5));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filtered.slice((currentPage - 1) * 5, currentPage * 5);
  const rangeStart = filtered.length ? (currentPage - 1) * 5 + 1 : 0;
  const rangeEnd = Math.min(currentPage * 5, filtered.length);

  function exportRows() {
    const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const rows = filtered.map((applicant) => `<tr><td>${escape(applicant.name)}</td><td>${escape(applicant.nisn)}</td><td>${escape(applicant.school)}</td><td>${escape(applicant.program)}</td><td>${escape(applicant.score)}</td><td>${escape(applicant.status)}</td></tr>`).join("");
    const html = `<html><head><meta charset="utf-8"></head><body><table><thead><tr><th>Nama Lengkap</th><th>NISN</th><th>Sekolah Asal</th><th>Program</th><th>Nilai Rapor</th><th>Status PPDB</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "data-pendaftar-kepala-sekolah.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function updateFilters(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  return <main className="principal-dashboard-outer">
    <div className="principal-dashboard-app">
      <PrincipalSidebar active="registrants" demo={demo} />
      <section className="principal-dashboard-main principal-registrants-main" aria-label="Data pendaftar siswa">
        <header className="principal-dashboard-header"><div><h1>Data Pendaftar (Siswa)</h1><p>Direktori dan status kelengkapan data administratif pendaftar PPDB SMK Citra Negara 2026/2027.</p></div><div className="principal-dashboard-header-meta"><span className="principal-live"><i />GELOMBANG 1 ACTIVE</span><span className="principal-school-year">▣ &nbsp;Tahun Ajaran 2026/2027</span></div></header>
        {demo && <div className="principal-demo-note" role="note"><strong>Pratinjau simulasi</strong><span>Angka ringkasan contoh; baris tabel adalah data fiktif untuk demonstrasi visual.</span><span>Data simulasi</span></div>}

        <section className="principal-list-toolbar" aria-label="Cari dan filter pendaftar">
          <label className="principal-list-search"><PrincipalIcon name="search" /><input type="search" value={query} onChange={(event) => updateFilters(setQuery, event.target.value)} placeholder="Cari pendaftar (Nama, NISN, Sekolah)…" aria-label="Cari nama, NISN, sekolah, atau nomor pendaftaran" /></label>
          <div className="principal-list-filter-group">
            <label className="principal-list-select"><span className="sr-only">Filter jurusan</span><select value={program} onChange={(event) => updateFilters(setProgram, event.target.value)}><option value="">Semua Jurusan</option>{programs.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label className="principal-list-select"><span className="sr-only">Filter status</span><select value={status} onChange={(event) => updateFilters(setStatus, event.target.value)}><option value="">Semua Status</option>{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <button className="principal-list-export" type="button" onClick={exportRows} disabled={!demo || filtered.length === 0}><PrincipalIcon name="download" />Ekspor Excel (XLS)</button>
          </div>
        </section>

        <section className="principal-list-stats" aria-label="Ringkasan status pendaftar">
          <StatCard label="TOTAL PENDAFTAR" value={demo ? formatPpdbNumber(demoPpdbMetrics.totalApplicants) : "—"} note="Akun Terdaftar" tone="forest" />
          <StatCard label="BELUM LENGKAP" value={demo ? formatPpdbNumber(demoPpdbMetrics.incompleteDocuments) : "—"} note="Perlu Melengkapi" tone="amber" />
          <StatCard label="LOLOS VERIFIKASI ADMIN" value={demo ? formatPpdbNumber(demoPpdbMetrics.verifiedApplicants) : "—"} note="Berkas Terverifikasi" tone="blue" />
          <StatCard label="BELUM MEMENUHI SYARAT" value={demo ? formatPpdbNumber(demoPpdbMetrics.notQualified) : "—"} note="Perlu Evaluasi" tone="rose" />
        </section>

        <section className="principal-list-table-card" aria-label="Daftar calon siswa">
          <div className="principal-list-table-wrap"><table className="principal-list-table"><thead><tr><th scope="col">Nama Lengkap</th><th scope="col">NISN</th><th scope="col">Sekolah Asal</th><th scope="col">Program</th><th scope="col">Nilai Rapor</th><th scope="col">Status PPDB</th><th scope="col">Aksi</th></tr></thead><tbody>
            {!demo ? <tr><td className="principal-list-empty" colSpan={7}>Data pendaftar akan tampil setelah sistem terhubung ke data PPDB.</td></tr> : visibleRows.length === 0 ? <tr><td className="principal-list-empty" colSpan={7}>Tidak ada pendaftar yang cocok dengan pencarian atau filter ini.</td></tr> : visibleRows.map((applicant) => <tr key={applicant.registration}><td><strong>{applicant.name}</strong></td><td>{applicant.nisn}</td><td>{applicant.school}</td><td><span className="principal-list-program">{applicant.program}</span></td><td><b className="principal-list-score">{applicant.score}</b></td><td><span className={`principal-list-status ${applicant.status === "Lulus" ? "passed" : applicant.status === "Verifikasi" ? "review" : applicant.status === "Revisi Dokumen" ? "revision" : "incomplete"}`}>STATUS: {applicant.status === "Verifikasi" ? "VERIFIKASI" : applicant.status === "Lulus" ? "LULUS" : applicant.status === "Revisi Dokumen" ? "REVISI" : "BELUM LENGKAP"}</span></td><td><button className="principal-list-detail-button" type="button" onClick={() => setSelected(applicant)}>Lihat Detail <span aria-hidden="true">›</span></button></td></tr>)}
          </tbody></table></div>
        </section>
        <div className="principal-list-pagination"><p>{demo ? `Menampilkan ${rangeStart}–${rangeEnd} dari ${filtered.length} baris contoh · ${formatPpdbNumber(demoPpdbMetrics.totalApplicants)} akun terdaftar` : "Belum ada data pendaftar."}</p><nav aria-label="Halaman daftar pendaftar"><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={!demo || currentPage <= 1}>Sebelumnya</button>{Array.from({ length: pageCount }, (_, index) => index + 1).slice(0, 5).map((pageNumber) => <button type="button" key={pageNumber} className={currentPage === pageNumber ? "active" : ""} aria-current={currentPage === pageNumber ? "page" : undefined} onClick={() => setPage(pageNumber)} disabled={!demo}>{pageNumber}</button>)}<button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={!demo || currentPage >= pageCount}>Berikutnya</button></nav></div>
      </section>
    </div>

    {selected && <div className="principal-list-modal-backdrop" onClick={() => setSelected(null)}><section className="principal-list-modal" role="dialog" aria-modal="true" aria-labelledby="principal-list-modal-title" onClick={(event) => event.stopPropagation()}><button type="button" className="principal-list-modal-close" aria-label="Tutup detail" onClick={() => setSelected(null)}><PrincipalIcon name="close" /></button><span className="principal-list-modal-kicker">AKSES MONITORING · HANYA BACA</span><h2 id="principal-list-modal-title">Detail Pendaftar</h2><p className="principal-list-modal-id">{selected.registration}</p><dl>{[["Nama Lengkap", selected.name], ["NISN", selected.nisn], ["Sekolah Asal", selected.school], ["Program Keahlian", selected.program], ["Nilai Rapor", selected.score], ["Status PPDB", selected.status]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><button className="principal-list-modal-done" type="button" onClick={() => setSelected(null)}>Tutup</button></section></div>}
  </main>;
}
