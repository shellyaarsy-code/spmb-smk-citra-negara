"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PrincipalSidebar from "./principal-sidebar";

type ScoreRow = { name: string; nisn: string; program: string; math: number; indonesia: number; english: number; average: string; result: "Lolos" | "Rekondisi" | "Gagal" };

const scoreRows: ScoreRow[] = [
  { name: "Siti Aminah", nisn: "00911223344", program: "DKV", math: 95, indonesia: 92, english: 90, average: "92.33", result: "Lolos" },
  { name: "Aditya Pratama", nisn: "00933445566", program: "BDR", math: 82, indonesia: 88, english: 85, average: "85.00", result: "Lolos" },
  { name: "Budi Santoso", nisn: "00944556677", program: "TJKT", math: 78, indonesia: 82, english: 80, average: "80.00", result: "Rekondisi" },
  { name: "Ahmad Dani", nisn: "00988112233", program: "PPLG", math: 60, indonesia: 75, english: 68, average: "67.67", result: "Gagal" },
];

const subjectScores = [
  { label: "Matematika & Logika Terapan", value: 76.5, tone: "red" },
  { label: "Bahasa Indonesia (Literasi)", value: 88.2, tone: "green" },
  { label: "Bahasa Inggris (Komunikasi)", value: 79.8, tone: "forest" },
  { label: "Pengetahuan Umum & Kejuruan", value: 82, tone: "blue" },
];

function PrincipalIcon({ name }: { name: "star" | "check" | "people" | "chart" | "search" }) {
  const paths = {
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    check: <><path d="M12 3 4.5 6v5.5c0 4.5 3.2 7.7 7.5 9.5 4.3-1.8 7.5-5 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 15a5 5 0 0 1 3.5 4.8" /></>,
    chart: <><path d="M4 20V5M4 20h17" /><path d="m7 15 4-4 3 2 6-7" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function ResultMetric({ icon, label, value, note, tone }: { icon: "star" | "check" | "people" | "chart"; label: string; value: string; note: string; tone: string }) {
  return <article className={`principal-result-metric ${tone}`}><div><span>{label}</span><i><PrincipalIcon name={icon} /></i></div><strong>{value}</strong><small>{note}</small></article>;
}

export default function PrincipalResults({ demo }: { demo: boolean }) {
  const [query, setQuery] = useState("");
  const visibleRows = useMemo(() => scoreRows.filter((row) => `${row.name} ${row.nisn} ${row.program}`.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID"))), [query]);

  return <main className="principal-dashboard-outer">
    <div className="principal-dashboard-app">
      <PrincipalSidebar active="testResults" demo={demo} />
      <section className="principal-dashboard-main principal-results-main" aria-label="Hasil tes dan seleksi akademik">
        <header className="principal-dashboard-header"><div><h1>Hasil Tes &amp; Seleksi Akademik</h1><p>Hasil Penilaian Akademik Tertulis (Tes Potensi Akademik) calon peserta didik baru.</p></div><div className="principal-dashboard-header-meta"><span className="principal-live"><i />GELOMBANG 1 ACTIVE</span><span className="principal-school-year">▣ &nbsp;Tahun Ajaran 2026/2027</span></div></header>
        {demo && <div className="principal-demo-note" role="note"><strong>Pratinjau simulasi</strong><span>Nilai dan hasil di halaman ini adalah data contoh, bukan keputusan seleksi sungguhan.</span><Link href="/portal/kepala-sekolah/hasil-seleksi">Tampilan kosong</Link></div>}

        <section className="principal-result-metrics" aria-label="Ringkasan hasil seleksi">
          <ResultMetric icon="star" label="Nilai Rata-Rata Tertinggi" value={demo ? "92.33" : "—"} note={demo ? "DKV · Siti Aminah" : "Data belum tersedia"} tone="green" />
          <ResultMetric icon="check" label="Nilai Rata-Rata Nasional KKM" value={demo ? "78.00" : "—"} note={demo ? "Tetap Standar Kelulusan" : "Data belum tersedia"} tone="mint" />
          <ResultMetric icon="people" label="Tuntas KKM Seleksi" value={demo ? "493" : "—"} note={demo ? "77,0% dari 640 terverifikasi" : "Data belum tersedia"} tone="blue" />
          <ResultMetric icon="chart" label="Rata-Rata Gabungan" value={demo ? "81.25" : "—"} note={demo ? "+3,4% Seluruh Peserta" : "Data belum tersedia"} tone="amber" />
        </section>

        <div className="principal-results-analysis">
          <section className="principal-results-panel principal-subject-panel" aria-labelledby="principal-subject-title">
            <h2 id="principal-subject-title">Rerata Skor Berdasarkan Materi Uji</h2>
            {demo ? <div className="principal-subject-list">{subjectScores.map((subject) => <div className="principal-subject-row" key={subject.label}><div><strong>{subject.label}</strong><span>{subject.value.toFixed(1)} / 100</span></div><div className="principal-subject-track"><i className={subject.tone} style={{ width: `${subject.value}%` }} /></div></div>)}</div> : <div className="principal-results-empty">Ringkasan skor materi akan tampil setelah nilai tes tersedia.</div>}
          </section>

          <section className="principal-results-panel principal-participation-panel" aria-labelledby="principal-participation-title">
            <h2 id="principal-participation-title">Status Partisipasi Tes Seleksi</h2>
            {demo ? <div className="principal-participation-content"><div className="principal-participation-ring" role="img" aria-label="92 persen siswa terverifikasi telah menyelesaikan tes"><strong>92,0%</strong><small>SELESAI</small></div><ul><li><i className="done" /><span>Sudah Ujian (589 siswa)</span></li><li><i className="progress" /><span>Sedang Menempuh (24 siswa)</span></li><li><i className="waiting" /><span>Belum Memulai (27 siswa)</span></li></ul></div> : <div className="principal-results-empty">Status partisipasi tes akan tampil setelah jadwal ujian dimulai.</div>}
          </section>
        </div>

        <section className="principal-results-table-panel" aria-labelledby="principal-results-table-title">
          <div className="principal-results-table-heading"><h2 id="principal-results-table-title">Daftar Hasil Ujian Terkini <span>(Read-Only)</span></h2>{demo && <label className="principal-results-search"><PrincipalIcon name="search" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama peserta…" aria-label="Cari nama, NISN, atau program peserta" /></label>}</div>
          <div className="principal-results-table-wrap"><table className="principal-results-table"><thead><tr><th scope="col">Nama Lengkap</th><th scope="col">NISN</th><th scope="col">Program</th><th scope="col">Matematika</th><th scope="col">B. Indo</th><th scope="col">B. Ing</th><th scope="col">Rerata</th><th scope="col">Keterangan</th></tr></thead><tbody>
            {!demo ? <tr><td className="principal-results-table-empty" colSpan={8}>Hasil ujian akan tampil setelah nilai seleksi tersedia.</td></tr> : visibleRows.length ? visibleRows.map((row) => <tr key={row.nisn}><td><strong>{row.name}</strong></td><td>{row.nisn}</td><td>{row.program}</td><td className={row.math < 70 ? "low" : ""}>{row.math}</td><td className={row.indonesia < 70 ? "low" : ""}>{row.indonesia}</td><td className={row.english < 70 ? "low" : ""}>{row.english}</td><td><strong className={`principal-result-average ${row.result.toLowerCase()}`}>{row.average}</strong></td><td><span className={`principal-result-outcome ${row.result.toLowerCase()}`}>{row.result.toUpperCase()}</span></td></tr>) : <tr><td className="principal-results-table-empty" colSpan={8}>Tidak ada peserta yang cocok dengan pencarian.</td></tr>}
          </tbody></table></div>
        </section>
      </section>
    </div>
  </main>;
}
