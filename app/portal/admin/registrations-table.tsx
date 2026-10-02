"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminIcon } from "./admin-sidebar";
import { demoApplicants, type Applicant, type ApplicantStatus } from "./admin-applicant-data";

const programCodes = ["PPLG", "TJKT", "DKV", "MPLB", "BDR", "PHT"];
const statusClass: Record<ApplicantStatus, string> = {
  "Verifikasi Berkas": "verification",
  "Berkas Terverifikasi": "verified",
  "Berkas Lengkap": "complete",
  Diterima: "accepted",
  "Berkas Kurang": "incomplete",
  "Pendaftaran Akun": "account",
};

const columns = ["No. Pendaftaran", "Nama Calon Siswa", "NISN", "Program", "Tgl Daftar", "Status"];

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

function xmlEscape(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function exportSpreadsheet(rows: Applicant[]) {
  const spreadsheetRows = [columns, ...rows.map((row) => [row.registrationNumber, row.name, row.nisn, row.program, dateLabel(row.date), row.status])];
  const xmlRows = spreadsheetRows.map((row) => `<Row>${row.map((cell) => `<Cell><Data ss:Type="String">${xmlEscape(cell)}</Data></Cell>`).join("")}</Row>`).join("");
  const workbookXml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Daftar Siswa"><Table>${xmlRows}</Table></Worksheet></Workbook>`;
  const blob = new Blob(["\ufeff", workbookXml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "daftar-calon-siswa-simulasi.xls";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function RegistrationsTable({ demo }: { demo: boolean }) {
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("all");
  const [status, setStatus] = useState("all");
  const [period, setPeriod] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const pageSize = 6;
  const filtered = useMemo(() => (demo ? demoApplicants : []).filter((applicant) => {
    const term = search.trim().toLocaleLowerCase("id-ID");
    const matchesSearch = !term || [applicant.registrationNumber, applicant.name, applicant.nisn].some((value) => value.toLocaleLowerCase("id-ID").includes(term));
    const matchesProgram = program === "all" || applicant.program === program;
    const matchesStatus = status === "all" || applicant.status === status;
    const matchesPeriod = period === "all" || applicant.date.startsWith(period);
    return matchesSearch && matchesProgram && matchesStatus && matchesPeriod;
  }), [demo, search, program, status, period]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentPage = Math.min(page, Math.max(1, totalPages));
  const visibleRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstResult = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastResult = Math.min(currentPage * pageSize, filtered.length);
  const pageStart = totalPages <= 3 ? 1 : Math.max(1, Math.min(currentPage - 1, totalPages - 2));
  const pageNumbers = Array.from({ length: Math.min(totalPages, 3) }, (_, index) => pageStart + index);
  function resetFilters() {
    setSearch(""); setProgram("all"); setStatus("all"); setPeriod("all"); setPage(1); setSelected([]);
  }

  function toggleSelected(id: number) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function togglePageSelection() {
    const ids = visibleRows.map((row) => row.id);
    const areAllSelected = ids.every((id) => selected.includes(id));
    setSelected((current) => areAllSelected ? current.filter((id) => !ids.includes(id)) : Array.from(new Set([...current, ...ids])));
  }

  return (
    <>
      <header className="admin-dashboard-header admin-registrations-header">
        <div className="admin-dashboard-heading"><h1>Daftar Calon Siswa</h1><p>Kelola seluruh berkas pendaftaran calon siswa dengan sistem saring cerdas.</p></div>
        <div className="admin-dashboard-header-actions">
          <label className="admin-dashboard-search"><AdminIcon name="search" /><input type="search" placeholder="Cari No. Pendaftaran, Nama…" aria-label="Cari nomor pendaftaran, nama, atau NISN" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); setSelected([]); }} /></label>
          <div className="admin-dashboard-account"><span>AD</span><div><strong>Admin Admisi</strong><small>PANITIA PPDB</small></div></div>
        </div>
      </header>
      {demo && <div className="admin-demo-banner" role="note"><strong>Mode simulasi</strong><span>Daftar ini berisi contoh visual, termasuk baris yang dibuat untuk pratinjau filter dan halaman. Tidak ada data siswa sungguhan.</span><Link href="/portal/admin/pendaftaran">Lihat tampilan kosong</Link></div>}

      <section className="admin-registration-filters" aria-label="Filter daftar calon siswa">
        <label className="admin-dashboard-search admin-registration-mobile-search"><AdminIcon name="search" /><input type="search" placeholder="Cari No. Pendaftaran, Nama…" aria-label="Cari nomor pendaftaran, nama, atau NISN" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); setSelected([]); }} /></label>
        <label className="admin-filter-select"><span>Program:</span><select value={program} onChange={(event) => { setProgram(event.target.value); setPage(1); setSelected([]); }}><option value="all">Semua Program</option>{programCodes.map((code) => <option key={code} value={code}>{code}</option>)}</select></label>
        <label className="admin-filter-select"><span>Status:</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); setSelected([]); }}><option value="all">Semua Status</option>{Object.keys(statusClass).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="admin-filter-select"><span>Periode:</span><select value={period} onChange={(event) => { setPeriod(event.target.value); setPage(1); setSelected([]); }}><option value="all">Semua Periode</option><option value="2026-02">Februari 2026</option></select></label>
        <button className="admin-export-button" type="button" onClick={() => exportSpreadsheet(filtered)} disabled={!filtered.length}><AdminIcon name="file" /> Export XLS</button>
      </section>

      <section className="admin-registrations-table-card" aria-label="Tabel daftar calon siswa">
        <div className="admin-table-toolbar">
          <label className="admin-select-all"><input type="checkbox" checked={visibleRows.length > 0 && visibleRows.every((row) => selected.includes(row.id))} onChange={togglePageSelection} disabled={!visibleRows.length} /><span>Terpilih {selected.length} Calon Siswa</span></label>
          <span className="admin-table-count">{filtered.length ? `Menampilkan ${firstResult}–${lastResult} dari ${filtered.length.toLocaleString("id-ID")} pendaftar` : "Tidak ada calon siswa yang cocok"}</span>
        </div>

        <div className="admin-table-scroll">
          <table className="admin-registrations-table">
            <thead><tr><th className="admin-table-checkbox-heading"><span className="sr-only">Pilih</span></th>{columns.map((column) => <th key={column}>{column}</th>)}<th>Aksi</th></tr></thead>
            <tbody>
              {visibleRows.map((applicant) => (
                <tr key={applicant.id}>
                  <td className="admin-table-checkbox"><input type="checkbox" aria-label={`Pilih ${applicant.name}`} checked={selected.includes(applicant.id)} onChange={() => toggleSelected(applicant.id)} /></td>
                  <td className="admin-registration-number">{applicant.registrationNumber}</td>
                  <td className="admin-applicant-name">{applicant.name}</td>
                  <td className="admin-applicant-nisn">{applicant.nisn}</td>
                  <td><span className={`admin-applicant-program ${applicant.program.toLowerCase()}`}>{applicant.program}</span></td>
                  <td className="admin-applicant-date">{dateLabel(applicant.date)}</td>
                  <td><span className={`admin-applicant-status ${statusClass[applicant.status]}`}>{applicant.status}</span></td>
                  <td><Link className="admin-detail-button" href={`/portal/admin/pendaftaran/${applicant.registrationNumber}${demo ? "?mode=demo" : ""}`}>Detail</Link></td>
                </tr>
              ))}
              {!visibleRows.length && <tr><td className="admin-table-empty" colSpan={8}>{demo ? "Tidak ada data yang cocok. Coba ubah filter atau kata pencarian." : "Belum ada data calon siswa."}</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="admin-table-pagination">
          <button type="button" className="admin-page-button admin-page-edge" onClick={() => { setPage((value) => Math.max(1, value - 1)); setSelected([]); }} disabled={currentPage <= 1}>Sebelumnya</button>
          <div className="admin-page-numbers">{pageStart > 1 && <span>…</span>}{pageNumbers.map((number) => <button type="button" key={number} className={`admin-page-button ${currentPage === number ? "active" : ""}`} aria-current={currentPage === number ? "page" : undefined} onClick={() => { setPage(number); setSelected([]); }}>{number}</button>)}{pageStart + pageNumbers.length - 1 < totalPages && <span>…</span>}</div>
          <button type="button" className="admin-page-button admin-page-edge" onClick={() => { setPage((value) => Math.min(totalPages, value + 1)); setSelected([]); }} disabled={currentPage >= totalPages}>Selanjutnya</button>
        </div>
      </section>

      <p className="admin-list-footnote">{demo ? "Angka dan identitas pada mode simulasi bukan informasi resmi PPDB." : "Daftar akan terisi ketika data calon siswa tersedia."}<button type="button" onClick={resetFilters}>Reset filter</button></p>

    </>
  );
}
