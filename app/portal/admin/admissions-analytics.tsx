"use client";

import { useMemo, useState } from "react";
import { AdminIcon } from "./admin-sidebar";
import { demoPpdbPrograms, demoPpdbWaves, formatPpdbNumber } from "../demo-ppdb-data";

type Transaction = { title: string; ref: string; amount: number };
const transactions: Transaction[] = [
  { title: "Pembayaran USM - Rahman Aditya", ref: "#TX-9921 • Terverifikasi Otomatis", amount: 150000 },
  { title: "Pembayaran USM - Siti Masitoh", ref: "#TX-9922 • Terverifikasi Otomatis", amount: 150000 },
  { title: "Pembayaran USM - Galih Prasetyo", ref: "#TX-9923 • Terverifikasi Otomatis", amount: 150000 },
  { title: "Uang Pangkal Ged. - Rahman Aditya", ref: "#TX-9924 • Terverifikasi Otomatis", amount: 3500000 },
  { title: "Uang Pangkal Ged. - Siti Masitoh", ref: "#TX-9925 • Terverifikasi Otomatis", amount: 3500000 },
];
function currency(value: number) { return `Rp ${value.toLocaleString("id-ID")}`; }

export default function AdmissionsAnalytics() {
  const [wave, setWave] = useState<keyof typeof demoPpdbWaves>("Semua Gelombang");
  const [curriculum, setCurriculum] = useState("Semua Kurikulum");
  const [notice, setNotice] = useState("");
  const report = demoPpdbWaves[wave];
  const displayedPrograms = useMemo(() => curriculum === "PPLG & TJKT" ? demoPpdbPrograms.slice(0, 2) : demoPpdbPrograms, [curriculum]);
  const maxProgramCount = Math.max(...displayedPrograms.map((item) => item.count));
  const totalRevenue = 148250000;

  function exportReport() {
    const summaryRows = [
      ["Laporan & Analitik Admisi - Simulasi", ""], ["Gelombang", wave], ["Kurikulum", curriculum], [""],
      ["Total Pendaftar Akun", report.applicants], ["Berkas Lengkap", report.complete], ["Lolos Verifikasi Admin", report.verified], ["Lulus Seleksi", report.admitted], ["Belum Lengkap", report.incomplete], ["Kuota Terisi", `${report.quota}%`], [""],
      ["Distribusi Program Keahlian", "Jumlah Pendaftar"], ...displayedPrograms.map((item) => [item.code, item.count]), [""],
      ["Rasio Pendaftar Laki-laki / Perempuan", "54% / 46%"], ["Rata-rata Nilai Matematika USM", "81.42 / 100"], ["Serapan Asal Sekolah Terbanyak", "SMPN 1 Depok & SMPN 2 Depok"], [""],
      ["Log Transaksi Kas Keuangan PPDB", "Nominal"], ...transactions.map((item) => [item.title, currency(item.amount)]), ["Total Akumulasi Terkumpul", currency(totalRevenue)],
    ];
    const table = `<table>${summaryRows.map((row) => `<tr>${row.map((cell) => `<td>${String(cell).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</td>`).join("")}</tr>`).join("")}</table>`;
    const blob = new Blob([`<html><meta charset="utf-8"><body>${table}</body></html>`], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "laporan-admisi-simulasi.xls"; link.click(); URL.revokeObjectURL(url);
    setNotice("Laporan simulasi berhasil diunduh dalam format XLS.");
  }

  return <>
    <header className="admin-dashboard-header admin-bank-header"><div className="admin-dashboard-heading"><h1>Laporan &amp; Analitik Admisi</h1><p>Statistik perbandingan pendaftar, monitoring capaian target gelombang, serta penandatanganan rekap laporan</p></div><div className="admin-dashboard-header-actions"><button type="button" className="admin-bank-bell" aria-label="Notifikasi"><AdminIcon name="bell" /></button><div className="admin-dashboard-account"><span>AD</span><div><strong>Administrator</strong><small>Panitia PPDB 2026</small></div></div></div></header>
    <div className="admin-analytics-toolbar"><div className="admin-analytics-filters"><label><span className="admin-analytics-filter-icon">▣</span><select value={wave} onChange={(event) => setWave(event.target.value as keyof typeof demoPpdbWaves)} aria-label="Pilih gelombang">{Object.keys(demoPpdbWaves).map((item) => <option key={item}>{item}</option>)}</select></label><label><span className="admin-analytics-filter-icon">▤</span><select value={curriculum} onChange={(event) => setCurriculum(event.target.value)} aria-label="Pilih kurikulum"><option>Semua Kurikulum</option><option>PPLG &amp; TJKT</option></select></label></div><div className="admin-analytics-actions"><button type="button" className="admin-bank-button secondary" onClick={() => { window.print(); setNotice("Gunakan opsi Simpan sebagai PDF pada dialog cetak browser."); }}><AdminIcon name="file" /> Cetak PDF / Laporan</button><button type="button" className="admin-bank-button primary" onClick={exportReport}><AdminIcon name="file" /> Ekspor Laporan XLS</button></div></div>

    <section className="admin-analytics-metrics" aria-label="Ringkasan admisi">
      <article className="admin-analytics-metric"><span>TOTAL PENDAFTAR AKUN</span><strong>{formatPpdbNumber(report.applicants)} Calon Siswa</strong><small className="positive">Akun pada {wave.toLocaleLowerCase("id-ID")}</small></article>
      <article className="admin-analytics-metric"><span>BERKAS LENGKAP</span><strong>{formatPpdbNumber(report.complete)} Siswa</strong><small className="positive">{((report.complete / report.applicants) * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 })}% dari total</small></article>
      <article className="admin-analytics-metric"><span>LOLOS VERIFIKASI ADMIN</span><strong>{formatPpdbNumber(report.verified)} Siswa</strong><small className="positive">{((report.verified / report.complete) * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 })}% dari berkas lengkap</small></article>
      <article className="admin-analytics-metric"><span>LULUS SELEKSI</span><strong>{formatPpdbNumber(report.admitted)} Siswa</strong><small className="positive">Kuota terisi {report.quota}%</small></article>
    </section>

    <div className="admin-analytics-layout">
      <div className="admin-analytics-left-column">
        <section className="admin-analytics-card admin-analytics-chart-card" aria-labelledby="analytics-chart-title"><div className="admin-analytics-card-heading"><h2 id="analytics-chart-title">Grafik Distribusi Program Keahlian</h2><span>UPDATE TERBARU</span></div><div className="admin-analytics-chart" role="img" aria-label="Grafik jumlah pendaftar pada tiap program keahlian">{displayedPrograms.map((item) => { const height = Math.max(16, item.count / maxProgramCount * 100); return <div className="admin-analytics-bar-column" key={item.code}><div className="admin-analytics-bar-track"><span style={{ height: `${height}%` }} title={`${item.count} siswa`} /></div><b>{item.code}</b><small>{item.count}</small></div>; })}</div></section>
        <section className="admin-analytics-card admin-analytics-outcomes" aria-labelledby="analytics-outcomes-title"><h2 id="analytics-outcomes-title">Rangkuman Outcome Admisi Terapan</h2><dl><div><dt>Rasio Pendaftar Laki-laki / Perempuan</dt><dd>54% / 46%</dd></div><div><dt>Rata-rata Nilai Matematika USM</dt><dd>81.42 / 100</dd></div><div><dt>Serapan Asal Sekolah (Terbanyak)</dt><dd>SMPN 1 Depok &amp; SMPN 2 Depok</dd></div></dl></section>
      </div>
      <section className="admin-analytics-card admin-analytics-finance" aria-labelledby="analytics-finance-title"><h2 id="analytics-finance-title">Log Transaksi Kas Keuangan PPDB</h2><div className="admin-analytics-transactions">{transactions.map((transaction) => <article key={transaction.ref}><div><strong>{transaction.title}</strong><small>{transaction.ref}</small></div><b>{currency(transaction.amount)}</b></article>)}</div><div className="admin-analytics-total"><strong>Total Akumulasi Terkumpul</strong><b>{currency(totalRevenue)}</b></div></section>
    </div>
    {notice && <p className="admin-analytics-notice" role="status">{notice}</p>}
    <p className="admin-analytics-disclaimer">Data pada halaman ini merupakan data simulasi untuk pratinjau desain, bukan laporan keuangan atau statistik resmi.</p>
  </>;
}
