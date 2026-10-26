import PrincipalSidebar from "./principal-sidebar";
import Link from "next/link";
import { demoPpdbMetrics, demoPpdbPrograms, demoPpdbSelectionSummary, formatPpdbNumber } from "../demo-ppdb-data";
import type { getPrincipalSelectionOverview } from "../../../services/principal/principal-service";

const quotas = demoPpdbPrograms.map((program) => ({ code: program.code, label: program.name, filled: program.admitted, capacity: program.capacity, color: program.quotaColor }));

const decisions = [
  { number: "CN-DEMO-0001", name: "Alya Rahma", program: "PPLG", score: "88.40", outcome: "Lulus" },
  { number: "CN-DEMO-0002", name: "Rafi Nugraha", program: "DKV", score: "86.15", outcome: "Lulus" },
  { number: "CN-DEMO-0003", name: "Bima Pratama", program: "TJKT", score: "84.90", outcome: "Lulus" },
  { number: "CN-DEMO-0004", name: "Keisha Putri", program: "MPLB", score: "78.20", outcome: "Cadangan" },
  { number: "CN-DEMO-0005", name: "Arga Saputra", program: "PHT", score: "72.40", outcome: "Tidak Lulus" },
  { number: "CN-DEMO-0006", name: "Nisa Ramadhani", program: "BDR", score: "81.50", outcome: "Lulus" },
];

function Stat({ label, value, foot, tone }: { label: string; value: string; foot: string; tone: string }) {
  return <article className={`principal-grad-stat ${tone}`}><div><span>{label}</span><i aria-hidden="true">{tone === "forest" ? "✓" : tone === "amber" ? "◷" : tone === "rose" ? "!" : "♧"}</i></div><strong>{value}</strong><small>{foot}</small></article>;
}

type SelectionOverview = Awaited<ReturnType<typeof getPrincipalSelectionOverview>>;

export default function PrincipalResults({ demo, overview }: { demo: boolean; overview: SelectionOverview | null }) {
  return <main className="principal-dashboard-outer"><div className="principal-dashboard-app">
    <PrincipalSidebar active="results" demo={demo} />
    <section className="principal-dashboard-main principal-grad-main" aria-label="Laporan hasil seleksi dan kelulusan">
      <header className="principal-dashboard-header"><div><h1>Laporan Hasil Seleksi &amp; Kelulusan</h1><p>{overview?.demoMode ? "Keputusan contoh untuk menunjukkan alur hasil seleksi; seluruh isi hanya simulasi." : "Keputusan penerimaan siswa berdasarkan hasil seleksi dan evaluasi administrasi."}</p></div><span className="principal-live"><i />MONITORING AKTIF</span></header>
      {demo && <div className="principal-demo-note" role="note"><strong>Pratinjau simulasi</strong><span>Ringkasan, status, dan hasil pada halaman ini merupakan data contoh.</span><Link href="/portal/kepala-sekolah/hasil-seleksi">Tampilan kosong</Link></div>}

      <section className="principal-grad-stats" aria-label="Ringkasan hasil penerimaan">
        <Stat label="Lulus Seleksi" value={demo ? `${formatPpdbNumber(demoPpdbSelectionSummary.passed)} Siswa` : overview ? overview.counts.passed.toLocaleString("id-ID") : "—"} foot={demo ? "Keputusan simulasi" : overview?.published ? "Keputusan yang dipublikasikan" : "Belum dipublikasikan"} tone="forest" />
        <Stat label="Daftar Tunggu" value={demo ? `${formatPpdbNumber(demoPpdbSelectionSummary.waitlisted)} Siswa` : overview ? overview.counts.waitlisted.toLocaleString("id-ID") : "—"} foot={demo ? "Keputusan simulasi" : overview?.published ? "Keputusan yang dipublikasikan" : "Belum dipublikasikan"} tone="amber" />
        <Stat label="Tidak Lulus" value={demo ? `${formatPpdbNumber(demoPpdbSelectionSummary.failed)} Siswa` : overview ? overview.counts.failed.toLocaleString("id-ID") : "—"} foot={demo ? "Keputusan simulasi" : overview?.published ? "Keputusan yang dipublikasikan" : "Belum dipublikasikan"} tone="rose" />
        <Stat label="Total Keputusan" value={demo ? formatPpdbNumber(demoPpdbSelectionSummary.totalDecisions) : overview ? (overview.counts.passed + overview.counts.waitlisted + overview.counts.failed).toLocaleString("id-ID") : "—"} foot={demo ? `${demoPpdbSelectionSummary.passRate} lulus · ${formatPpdbNumber(demoPpdbSelectionSummary.pending)} masih menunggu` : overview?.published ? "Status final tersimpan" : "Belum dipublikasikan"} tone="blue" />
      </section>

      <div className="principal-grad-analysis">
        <section className="principal-grad-panel principal-grad-quota" aria-labelledby="principal-grad-quota-title"><div className="principal-grad-panel-heading"><div><h2 id="principal-grad-quota-title">Keterisian Kuota per Program Keahlian</h2><p>Jumlah siswa lulus dibandingkan daya tampung program.</p></div></div>
          {demo ? <div className="principal-grad-quota-list">{quotas.map((quota) => { const percent = Math.round(quota.filled / quota.capacity * 100); return <div className="principal-grad-quota-row" key={quota.code}><div><strong>{quota.code}</strong><span>{quota.filled} / {quota.capacity} Kuota ({percent}%)</span></div><i className={quota.color} style={{ width: `${percent}%` }} /></div>; })}</div> : overview?.published ? <div className="principal-grad-quota-list">{overview.programs.map((program) => { const capacity = program.capacity; const percent = capacity && capacity > 0 ? Math.min(100, Math.round(program.passed / capacity * 100)) : 0; return <div className="principal-grad-quota-row" key={program.code}><div><strong>{program.code}</strong><span>{program.passed} lulus / {capacity ?? "kapasitas belum diatur"}{capacity ? ` (${percent}%)` : ""}</span></div><i className="forest" style={{ width: `${percent}%` }} /></div>; })}</div> : <div className="principal-results-empty">Kapasitas dan hasil akan tampil setelah aturan disetujui dan hasil dipublikasikan.</div>}
        </section>

        <section className="principal-grad-panel principal-grad-demographics" aria-labelledby="principal-grad-demo-title"><h2 id="principal-grad-demo-title">Pemerataan &amp; Demografi Lulusan</h2><p>Ringkasan pemerataan peserta yang dinyatakan lulus.</p>
          {demo ? <div className="principal-grad-demo-groups"><div><div className="principal-grad-demo-heading"><strong>Komposisi Gender</strong><span>Laki-laki 55% <b>·</b> Perempuan 45%</span></div><div className="principal-grad-segmented gender"><i /><i /></div></div><div><div className="principal-grad-demo-heading"><strong>Domisili Asal Pendaftar</strong><span>Depok 68% <b>·</b> Wilayah lain 32%</span></div><div className="principal-grad-segmented domicile"><i /><i /></div></div><small>Distribusi diringkas dari calon siswa yang lulus.</small></div> : <div className="principal-results-empty">Data demografi belum tersedia pada model seleksi.</div>}
        </section>
      </div>

      <section className="principal-grad-table-panel"><div className="principal-grad-table-heading"><div><h2>Daftar Hasil Keputusan Calon Siswa <span>(Read-Only)</span></h2><p>{demo ? `Enam baris contoh dari ${formatPpdbNumber(demoPpdbSelectionSummary.totalDecisions)} keputusan simulasi; ${formatPpdbNumber(demoPpdbSelectionSummary.pending)} masih menunggu keputusan.` : overview?.demoMode ? "Hasil contoh dari database demo; hanya simulasi." : "Keputusan dari database hanya ditampilkan setelah publikasi resmi."}</p></div><span className="principal-grad-readonly">◉ Mode Pemantauan</span></div>
        <div className="principal-grad-table-wrap"><table><thead><tr><th>No. Pendaftaran</th><th>Nama Lengkap</th><th>Program</th><th>Peringkat</th><th>Status Keputusan</th></tr></thead><tbody>{demo ? decisions.map((student) => <tr key={student.number}><td>{student.number}</td><td><strong>{student.name}</strong></td><td>{student.program}</td><td>—</td><td><span className={`principal-grad-outcome ${student.outcome === "Lulus" ? "passed" : student.outcome === "Cadangan" ? "waiting" : "failed"}`}>{student.outcome.toUpperCase()}</span></td></tr>) : overview?.published ? overview.results.map((row, index) => <tr key={`${row.registrationNumber}-${row.program}-${index}`}><td>{row.registrationNumber ?? "—"}</td><td><strong>{row.name ?? "Nama belum tersedia"}</strong></td><td>{row.program} · {row.programName}</td><td>{row.rank ?? "—"}</td><td>{row.status}</td></tr>) : <tr><td colSpan={5} className="principal-results-table-empty">{overview ? "Aturan belum disetujui atau hasil belum dipublikasikan." : "Data hasil seleksi belum dapat dimuat."}</td></tr>}</tbody></table></div>
      </section>
    </section>
  </div></main>;
}
