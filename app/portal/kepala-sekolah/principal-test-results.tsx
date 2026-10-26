"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PrincipalSidebar from "./principal-sidebar";
import type { getPrincipalTkaOverview } from "../../../services/principal/principal-service";

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

type TkaOverview = Awaited<ReturnType<typeof getPrincipalTkaOverview>>;

export default function PrincipalResults({ demo, overview }: { demo: boolean; overview: TkaOverview | null }) {
  const [query, setQuery] = useState("");
  const visibleRows = useMemo(() => scoreRows.filter((row) => `${row.name} ${row.nisn} ${row.program}`.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID"))), [query]);

  return <main className="principal-dashboard-outer">
    <div className="principal-dashboard-app">
      <PrincipalSidebar active="testResults" demo={demo} />
      <section className="principal-dashboard-main principal-results-main" aria-label="Hasil tes dan seleksi akademik">
        <header className="principal-dashboard-header"><div><h1>Hasil Tes &amp; Seleksi Akademik</h1><p>Hasil Penilaian Akademik Tertulis (Tes Potensi Akademik) calon peserta didik baru.</p></div><div className="principal-dashboard-header-meta"><span className="principal-live"><i />GELOMBANG 1 ACTIVE</span><span className="principal-school-year">▣ &nbsp;Tahun Ajaran 2026/2027</span></div></header>
        {demo && <div className="principal-demo-note" role="note"><strong>Pratinjau simulasi</strong><span>Nilai dan hasil di halaman ini adalah data contoh, bukan keputusan seleksi sungguhan.</span><Link href="/portal/kepala-sekolah/hasil-seleksi">Tampilan kosong</Link></div>}

        <section className="principal-result-metrics" aria-label="Ringkasan hasil seleksi">
          <ResultMetric icon="star" label="Nilai Tertinggi Terpublikasi" value={demo ? "92.33" : overview?.highestScore?.toLocaleString("id-ID") ?? "—"} note={demo ? "Contoh simulasi" : overview ? `${overview.publishedCount} nilai dipublikasikan` : "Data belum dapat dimuat"} tone="green" />
          <ResultMetric icon="check" label={demo ? "Sampel Nilai Ditampilkan" : "Nilai Terpublikasi"} value={demo ? scoreRows.length.toLocaleString("id-ID") : overview?.publishedCount.toLocaleString("id-ID") ?? "—"} note={demo ? "Baris contoh pada tabel" : "Nilai TKA tanpa keputusan lulus"} tone="mint" />
          <ResultMetric icon="people" label="Attempt Selesai" value={demo ? "493" : overview?.completedAttempts.toLocaleString("id-ID") ?? "—"} note={demo ? "Contoh simulasi" : "Seluruh attempt yang selesai"} tone="blue" />
          <ResultMetric icon="chart" label="Rata-Rata Nilai Terpublikasi" value={demo ? "81.25" : overview?.averageScore?.toLocaleString("id-ID") ?? "—"} note={demo ? "Contoh simulasi" : "Tidak menetapkan kelulusan"} tone="amber" />
        </section>

        <div className="principal-results-analysis">
          <section className="principal-results-panel principal-subject-panel" aria-labelledby="principal-subject-title">
            <h2 id="principal-subject-title">Ringkasan Nilai TKA</h2>
            {demo ? <div className="principal-subject-list">{subjectScores.map((subject) => <div className="principal-subject-row" key={subject.label}><div><strong>{subject.label}</strong><span>{subject.value.toFixed(1)} / 100</span></div><div className="principal-subject-track"><i className={subject.tone} style={{ width: `${subject.value}%` }} /></div></div>)}</div> : <div className="principal-results-empty">Perincian per materi belum tersedia pada model soal saat ini.</div>}
          </section>

          <section className="principal-results-panel principal-participation-panel" aria-labelledby="principal-participation-title">
            <h2 id="principal-participation-title">Status Partisipasi Tes Seleksi</h2>
            {demo ? <div className="principal-participation-content"><div className="principal-participation-ring" role="img" aria-label="92 persen siswa terverifikasi telah menyelesaikan tes"><strong>92,0%</strong><small>SELESAI</small></div><ul><li><i className="done" /><span>Sudah Ujian (589 siswa)</span></li><li><i className="progress" /><span>Sedang Menempuh (24 siswa)</span></li><li><i className="waiting" /><span>Belum Memulai (27 siswa)</span></li></ul></div> : overview ? <div className="principal-results-empty">{overview.completedAttempts} attempt selesai dan {overview.activeAttempts} attempt sedang berlangsung. Sistem belum memiliki daftar peserta terjadwal untuk menghitung yang belum memulai.</div> : <div className="principal-results-empty">Status partisipasi tes belum dapat dimuat.</div>}
          </section>
        </div>

        <section className="principal-results-table-panel" aria-labelledby="principal-results-table-title">
          <div className="principal-results-table-heading"><h2 id="principal-results-table-title">Daftar Nilai TKA yang Dipublikasikan <span>(Read-Only)</span></h2>{demo && <label className="principal-results-search"><PrincipalIcon name="search" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama peserta…" aria-label="Cari nama peserta" /></label>}</div>
          <div className="principal-results-table-wrap"><table className="principal-results-table"><thead><tr><th scope="col">No. Pendaftaran</th><th scope="col">Nama</th><th scope="col">Tes</th><th scope="col">Nilai</th><th scope="col">Dipublikasikan</th></tr></thead><tbody>
            {demo ? visibleRows.length ? visibleRows.map((row) => <tr key={row.nisn}><td>Simulasi</td><td><strong>{row.name}</strong></td><td>TKA</td><td>{row.average}</td><td>Data contoh</td></tr>) : <tr><td className="principal-results-table-empty" colSpan={5}>Tidak ada peserta yang cocok dengan pencarian.</td></tr> : overview?.results.length ? overview.results.map((row) => <tr key={row.id}><td>{row.registrationNumber ?? "—"}</td><td><strong>{row.name ?? "Nama belum tersedia"}</strong></td><td>{row.testName}</td><td>{row.score ?? "—"}</td><td>{row.publishedAt ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(row.publishedAt)) : "—"}</td></tr>) : <tr><td className="principal-results-table-empty" colSpan={5}>{overview ? "Belum ada nilai TKA yang dipublikasikan." : "Nilai belum dapat dimuat."}</td></tr>}
          </tbody></table></div>
        </section>
      </section>
    </div>
  </main>;
}
