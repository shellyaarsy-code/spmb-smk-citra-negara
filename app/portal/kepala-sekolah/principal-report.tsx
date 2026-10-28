"use client";

import { useState } from "react";
import Link from "next/link";
import PrincipalSidebar from "./principal-sidebar";
import { demoPpdbPrograms, demoPpdbWaves, formatPpdbNumber } from "../demo-ppdb-data";
import { downloadCsv } from "../csv-export";
import BrandLogo from "../../components/brand-logo";

const programs = demoPpdbPrograms.map((program) => ({
  name: program.name,
  code: program.code,
  capacity: program.capacity,
  admitted: program.admitted,
  percentage: `${((program.admitted / program.capacity) * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`,
}));

export default function PrincipalReport({ demo }: { demo: boolean }) {
  const [period, setPeriod] = useState<keyof typeof demoPpdbWaves>("Semua Gelombang");
  const periodMetrics = demoPpdbWaves[period];

  function exportReport() {
    const rows = [
      ["YAYASAN CITRA NEGARA"],
      ["SMK CITRA NEGARA"],
      ["LAPORAN EKSEKUTIF PENERIMAAN PESERTA DIDIK BARU (PPDB)"],
      ["TAHUN AJARAN 2026/2027"],
      ["Periode", period],
      [],
      ["Ringkasan PPDB", "Jumlah"],
      ["Total Pendaftar Akun", periodMetrics.applicants],
      ["Berkas Lengkap", periodMetrics.complete],
      ["Lolos Verifikasi Admin", periodMetrics.verified],
      ["Lulus Seleksi", periodMetrics.admitted],
      ["Belum Berkas Lengkap", periodMetrics.incomplete],
      [],
      ["Program Keahlian", "Kode Jurusan", "Daya Tampung", "Lulus Seleksi", "Persentase Terpenuhi"],
      ...programs.map((program) => [program.name, program.code, program.capacity, program.admitted, program.percentage]),
    ];
    downloadCsv("laporan-ppdb-smk-citra-negara-2026-2027.csv", rows);
  }

  return <main className="principal-dashboard-outer">
    <div className="principal-dashboard-app">
      <PrincipalSidebar active="reports" demo={demo} />
      <section className="principal-dashboard-main principal-report-main" aria-label="Laporan eksekutif PPDB">
        <header className="principal-dashboard-header"><div><h1>Laporan Eksekutif &amp; Unduhan Dokumen</h1><p>Kompilasi data monitoring PPDB dan keputusan penerimaan untuk kebutuhan pimpinan.</p></div><span className="principal-live"><i />MONITORING AKTIF</span></header>
        {demo && <div className="principal-demo-note" role="note"><strong>Pratinjau simulasi</strong><span>Laporan ini berisi data contoh untuk tahun pelajaran 2026/2027.</span><span>Data simulasi</span></div>}

        <section className="principal-report-toolbar" aria-label="Filter dan tindakan laporan">
          <label className="principal-report-filter"><span>Tahun Pelajaran</span><select defaultValue="2026/2027" aria-label="Tahun pelajaran"><option>2026/2027</option></select></label>
          <label className="principal-report-filter"><span>Periode</span><select value={period} onChange={(event) => setPeriod(event.target.value as keyof typeof demoPpdbWaves)} aria-label="Periode laporan"><option>Semua Gelombang</option><option>Gelombang 1</option><option>Gelombang 2</option><option>Gelombang 3</option></select></label>
          <div className="principal-report-actions"><button type="button" onClick={() => window.print()} disabled={!demo}><span aria-hidden="true">▤</span>Cetak Laporan PDF</button><button type="button" onClick={exportReport} disabled={!demo}><span aria-hidden="true">⇩</span>Ekspor ke Excel</button></div>
        </section>

        <article className="principal-report-document" aria-label="Pratinjau dokumen laporan eksekutif">
          <header className="principal-report-document-header"><BrandLogo width={72} /><div><strong>YAYASAN CITRA NEGARA</strong><h2>SMK CITRA NEGARA</h2><p>LAPORAN EKSEKUTIF PENERIMAAN PESERTA DIDIK BARU (PPDB)</p><b>TAHUN AJARAN 2026/2027</b></div></header>
          {demo ? <>
            <div className="principal-report-document-meta"><span>Periode laporan: <strong>{period}</strong></span><span>Status: <strong>Data simulasi</strong></span></div>
            <section className="principal-report-section"><h3>1. Ringkasan Eksekutif</h3><p>Proses Penerimaan Peserta Didik Baru (PPDB) SMK Citra Negara tahun ajaran 2026/2027 berjalan berdasarkan data pendaftaran, verifikasi administrasi, serta hasil seleksi calon peserta didik. Pada {period.toLocaleLowerCase("id-ID")}, tercatat {formatPpdbNumber(periodMetrics.applicants)} akun pendaftar, {formatPpdbNumber(periodMetrics.complete)} berkas lengkap, {formatPpdbNumber(periodMetrics.verified)} pendaftar lolos verifikasi, dan {formatPpdbNumber(periodMetrics.admitted)} calon peserta didik dinyatakan lulus seleksi. Data ini menjadi bahan pemantauan pimpinan terhadap keterisian daya tampung dan pemerataan penerimaan pada setiap program keahlian.</p></section>
            <section className="principal-report-section"><h3>2. Keterisian Pendaftaran &amp; Program Keahlian</h3><div className="principal-report-table-wrap"><table><thead><tr><th>Program Keahlian</th><th>Kode Jurusan</th><th>Daya Tampung</th><th>Lulus Seleksi</th><th>Persentase Terpenuhi</th></tr></thead><tbody>{programs.map((program) => <tr key={program.code}><td>{program.name}</td><td>{program.code}</td><td>{program.capacity}</td><td>{program.admitted}</td><td>{program.percentage}</td></tr>)}</tbody></table></div></section>
            <footer className="principal-report-signatures"><div><span>Mengetahui,</span><strong>Ketua Panitia PPDB</strong><i>(........................................)</i></div><div><span>Depok, 2026</span><strong>Kepala Sekolah</strong><i>(........................................)</i></div></footer>
            <div className="principal-report-document-footer">SMK Citra Negara · Tahun Pelajaran 2026/2027</div>
          </> : <p className="principal-report-empty" role="status">Data laporan belum tersedia. Ringkasan dan dokumen akan tampil setelah sumber data PPDB terhubung.</p>}
        </article>
      </section>
    </div>
  </main>;
}
