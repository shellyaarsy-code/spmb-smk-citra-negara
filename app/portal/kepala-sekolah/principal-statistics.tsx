import PrincipalSidebar from "./principal-sidebar";
import Link from "next/link";
import { demoPpdbMetrics, formatPpdbNumber } from "../demo-ppdb-data";

const funnel = [
  { step: "1", name: "Pendaftaran Akun", count: formatPpdbNumber(demoPpdbMetrics.totalApplicants), note: "Akun terdaftar", percent: 100, tone: "forest" },
  { step: "2", name: "Berkas Lengkap", count: formatPpdbNumber(demoPpdbMetrics.completeDocuments), note: "Dokumen lengkap", percent: 79.1, tone: "teal" },
  { step: "3", name: "Lolos Verifikasi", count: formatPpdbNumber(demoPpdbMetrics.verifiedApplicants), note: "Berkas valid", percent: 51.6, tone: "blue" },
  { step: "4", name: "Lulus Seleksi", count: formatPpdbNumber(demoPpdbMetrics.admittedApplicants), note: "Penerima SPMB", percent: 39.8, tone: "purple" },
];

const weekly = [
  { label: "Minggu 1", value: 120 }, { label: "Minggu 2", value: 240 }, { label: "Minggu 3", value: 310 },
  { label: "Minggu 4", value: 450 }, { label: "Minggu 5", value: 680 }, { label: "Minggu 6", value: 820 }, { label: "Minggu 7", value: demoPpdbMetrics.completeDocuments },
];

const schools = [
  { name: "SMP Negeri 1 Depok", students: 142, percent: "22,2%" },
  { name: "SMP Negeri 2 Depok", students: 98, percent: "15,3%" },
  { name: "SMP Negeri 4 Depok", students: 84, percent: "13,1%" },
  { name: "MTs Negeri Depok", students: 62, percent: "9,7%" },
  { name: "SMP Citra Bangsa", students: 48, percent: "7,5%" },
];

function StatsCard({ label, value, note, tone, icon }: { label: string; value: string; note: string; tone: string; icon: string }) {
  return <article className={`principal-statistics-card ${tone}`}><div><span>{label}</span><i aria-hidden="true">{icon}</i></div><strong>{value}</strong><small>{note}</small></article>;
}

function DistrictMap() {
  return <div className="principal-map-wrap">
    <svg className="principal-district-map" viewBox="0 0 340 200" role="img" aria-label="Peta skematis sebaran calon siswa di area Depok dan sekitarnya">
      <path d="M54 27 104 18 127 32 153 21 188 32 217 22 247 39 280 42 290 72 278 96 292 123 275 151 249 157 231 183 197 173 174 186 144 173 116 180 93 156 66 151 57 125 40 105 47 75Z" fill="#edf1d8" stroke="#728f6f" strokeWidth="2" />
      <path d="m54 27 50-9 11 37-29 26-39-6Z" fill="#cbe2b1" stroke="#fff" strokeWidth="3" /><path d="m104 18 49 3-3 40-40-6Z" fill="#a7cf98" stroke="#fff" strokeWidth="3" />
      <path d="m153 21 35 11 4 39-42-10Z" fill="#73b67f" stroke="#fff" strokeWidth="3" /><path d="m188 32 29-10 30 17-7 35-48-3Z" fill="#bddb9f" stroke="#fff" strokeWidth="3" />
      <path d="m47 75 39 6 13 36-42 8-17-20Z" fill="#9ec98d" stroke="#fff" strokeWidth="3" /><path d="m86 81 29-26 40 6-5 42-51 14Z" fill="#63ac79" stroke="#fff" strokeWidth="3" />
      <path d="m150 61 42 10 1 37-43-5Z" fill="#24845d" stroke="#fff" strokeWidth="3" /><path d="m192 71 48 3 18 32-29 26-36-27Z" fill="#8dc77f" stroke="#fff" strokeWidth="3" />
      <path d="m57 125 42-8 17 39-23 0-27-5Z" fill="#c3dc9f" stroke="#fff" strokeWidth="3" /><path d="m99 117 51-14 0 37-34 16Z" fill="#77b77a" stroke="#fff" strokeWidth="3" />
      <path d="m150 103 43 5 36 24 2 24-34 17-47-33Z" fill="#3e9866" stroke="#fff" strokeWidth="3" /><path d="m229 132 29-26 34 17-17 28-26 6Z" fill="#d8e7b7" stroke="#fff" strokeWidth="3" />
      <g fill="#345b45" fontFamily="inherit" fontSize="8" textAnchor="middle"><text x="77" y="57">Sawangan</text><text x="132" y="43">Bojongsari</text><text x="173" y="48">Cipayung</text><text x="221" y="56">Cimanggis</text><text x="72" y="105">Limo</text><text x="121" y="91">Pancoran Mas</text><text x="171" y="87" fill="white">Beji</text><text x="224" y="95">Sukmajaya</text><text x="135" y="132">Cinere</text><text x="184" y="140" fill="white">Depok</text><text x="263" y="137">Bogor</text></g>
      <circle cx="187" cy="122" r="5" fill="#f6c84d" stroke="#fff" strokeWidth="2" />
    </svg>
    <div className="principal-map-legend"><span><i />Area dengan pendaftar terbanyak</span><small>Ilustrasi area, bukan peta batas administratif resmi.</small></div>
  </div>;
}

export default function PrincipalStatistics({ demo }: { demo: boolean }) {
  return <main className="principal-dashboard-outer"><div className="principal-dashboard-app">
    <PrincipalSidebar active="statistics" demo={demo} />
    <section className="principal-dashboard-main principal-statistics-main" aria-label="Grafik dan analisis statistik PPDB">
      <header className="principal-dashboard-header"><div><h1>Grafik &amp; Analisis Statistik PPDB</h1><p>Laporan menyeluruh mengenai tren pendaftaran, verifikasi berkas, dan minat program keahlian.</p></div><span className="principal-live"><i />MONITORING AKTIF</span></header>
      {demo && <div className="principal-demo-note" role="note"><strong>Pratinjau simulasi</strong><span>Statistik, tren, dan asal sekolah di halaman ini adalah data contoh.</span><Link href="/portal/kepala-sekolah/statistik">Tampilan kosong</Link></div>}

      <section className="principal-statistics-metrics" aria-label="Ringkasan statistik PPDB">
        <StatsCard label="Total Pendaftar (Akun)" value={demo ? formatPpdbNumber(demoPpdbMetrics.totalApplicants) : "—"} note={demo ? "Akun terdaftar pada tahun ajaran ini" : "Data belum tersedia"} tone="green" icon="♙" />
        <StatsCard label="Konversi Berkas Lengkap" value={demo ? "79,1%" : "—"} note={demo ? `${formatPpdbNumber(demoPpdbMetrics.completeDocuments)} dari ${formatPpdbNumber(demoPpdbMetrics.totalApplicants)} akun` : "Data belum tersedia"} tone="mint" icon="✓" />
        <StatsCard label="Lolos Verifikasi Admin" value={demo ? "65,1%" : "—"} note={demo ? `${formatPpdbNumber(demoPpdbMetrics.verifiedApplicants)} dari ${formatPpdbNumber(demoPpdbMetrics.completeDocuments)} berkas lengkap` : "Data belum tersedia"} tone="blue" icon="◎" />
        <StatsCard label="Pendaftar Terverifikasi Harian" value={demo ? "+42" : "—"} note={demo ? "Perubahan dalam 24 jam" : "Data belum tersedia"} tone="teal" icon="↗" />
      </section>

      <div className="principal-statistics-analysis">
        <section className="principal-statistics-panel principal-funnel-panel" aria-labelledby="principal-funnel-title"><div className="principal-statistics-panel-heading"><div><h2 id="principal-funnel-title">Corong Konversi Pendaftaran (Funnel)</h2><p>Perjalanan calon siswa dari pendaftaran akun hingga keputusan seleksi.</p></div></div>
          {demo ? <div className="principal-funnel-list">{funnel.map((stage) => <article key={stage.step}><span className="principal-funnel-step">{stage.step}</span><strong>{stage.name}</strong><b>{stage.count}</b><small>{stage.note}<br />{stage.percent}% dari pendaftar awal</small><i className={stage.tone} style={{ width: `${stage.percent}%` }} /></article>)}</div> : <div className="principal-results-empty">Data per tahap pendaftaran akan tampil setelah ada pendaftar.</div>}
        </section>

        <section className="principal-statistics-panel principal-weekly-panel" aria-labelledby="principal-weekly-title"><div className="principal-statistics-panel-heading"><div><h2 id="principal-weekly-title">Tren Pendaftaran Mingguan (Akun)</h2><p>Jumlah akun terdaftar secara akumulatif.</p></div><span>7 MINGGU</span></div>
          {demo ? <div className="principal-weekly-chart" role="img" aria-label={`Pendaftar kumulatif tujuh minggu: ${weekly.map((week) => week.value).join(", ")}.`}>{weekly.map((week) => <div className="principal-weekly-bar" key={week.label}><b>{week.value}</b><i style={{ height: `${week.value / demoPpdbMetrics.completeDocuments * 110}px` }} /><small>{week.label}</small></div>)}</div> : <div className="principal-results-empty">Tren mingguan akan tampil saat data tersedia.</div>}
        </section>

        <section className="principal-statistics-panel principal-schools-panel" aria-labelledby="principal-schools-title"><div className="principal-statistics-panel-heading"><div><h2 id="principal-schools-title">Asal Sekolah Terbanyak (SMP / Sederajat)</h2><p>Asal sekolah dari calon siswa yang telah lolos verifikasi.</p></div></div>
          {demo ? <ol className="principal-school-ranking">{schools.map((school, index) => <li key={school.name}><b>{index + 1}</b><span>{school.name}</span><strong>{school.students} Calon Siswa</strong><small>{school.percent}</small></li>)}</ol> : <div className="principal-results-empty">Asal sekolah belum tersedia.</div>}
        </section>

        <section className="principal-statistics-panel principal-map-panel" aria-labelledby="principal-map-title"><div className="principal-statistics-panel-heading"><div><h2 id="principal-map-title">Distribusi Pemetaan Geografis Pendaftar</h2><p>Ilustrasi sebaran pendaftar di Depok dan sekitarnya.</p></div></div>{demo ? <DistrictMap /> : <div className="principal-results-empty">Peta sebaran akan tampil setelah data domisili tersedia.</div>}</section>
      </div>
    </section>
  </div></main>;
}
