import Link from "next/link";
import type { ReactNode } from "react";
import PrincipalSidebar from "./principal-sidebar";
import { demoPpdbMetrics, formatPpdbNumber } from "../demo-ppdb-data";

type IconName = "grid" | "users" | "cap" | "user" | "shield" | "file" | "bell" | "calendar" | "logout" | "clock" | "trend";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.8M17 15a5 5 0 0 1 4 5" /></>,
    cap: <><path d="m2 9 10-5 10 5-10 5L2 9Z" /><path d="M6 11v5c3.5 3 8.5 3 12 0v-5M22 9v6" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
    shield: <><path d="M12 3 4.5 6v5.5c0 4.5 3.2 7.7 7.5 9.5 4.3-1.8 7.5-5 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></>,
    file: <><path d="M6 3.5h8l4 4V20H6z" /><path d="M14 3.5v5h5M9 13h6M9 16h6" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    logout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    trend: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 6-7" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const programs = [
  { code: "PPLG", name: "Pengembangan Perangkat Lunak dan Gim", students: 124, quota: 144, color: "forest" },
  { code: "TJKT", name: "Teknik Jaringan Komputer dan Telekomunikasi", students: 108, quota: 108, color: "teal" },
  { code: "DKV", name: "Desain Komunikasi Visual", students: 92, quota: 108, color: "blue" },
  { code: "MPLB", name: "Manajemen Perkantoran dan Layanan Bisnis", students: 64, quota: 72, color: "amber" },
  { code: "BDR", name: "Bisnis Digital dan Ritel", students: 48, quota: 72, color: "violet" },
  { code: "PHT", name: "Perhotelan", students: 32, quota: 36, color: "pink" },
];

const notifications = [
  { icon: "users" as const, tone: "amber", title: "Kuota TJKT Terisi Penuh", detail: "Gelombang 1 · pendaftar program TJKT sudah mencapai 100%.", time: "12 menit lalu" },
  { icon: "shield" as const, tone: "green", title: `${formatPpdbNumber(demoPpdbMetrics.completeDocuments)} Berkas Lengkap`, detail: "Dokumen calon siswa telah dilengkapi untuk pemeriksaan administrasi.", time: "2 jam lalu" },
  { icon: "file" as const, tone: "blue", title: "Nilai Ujian Masuk Diunggah", detail: "Nilai Saringan Masuk (TKA) Gelombang 1 telah tersedia.", time: "4 jam lalu" },
];

const weekdays = [
  { day: "Senin", count: 20 }, { day: "Selasa", count: 35 }, { day: "Rabu", count: 45 },
  { day: "Kamis", count: 30 }, { day: "Jumat", count: 60 }, { day: "Sabtu", count: 85 }, { day: "Minggu", count: 110 },
];

function Metric({ icon, label, value, note, tone }: { icon: IconName; label: string; value: string; note: string; tone: string }) {
  return <article className="principal-metric"><div className="principal-metric-top"><span>{label}</span><i className={tone}><Icon name={icon} /></i></div><strong>{value}</strong><small className={tone}>{note}</small></article>;
}

export default function PrincipalDashboard({ demo }: { demo: boolean }) {
  return <main className="principal-dashboard-outer">
    <div className="principal-dashboard-app">
      <PrincipalSidebar active="dashboard" demo={demo} />

      <section className="principal-dashboard-main" id="overview" aria-label="Monitoring dashboard Kepala Sekolah">
        <header className="principal-dashboard-header"><div><h1>Monitoring Dashboard</h1><p>Overview data pendaftaran, kelulusan, dan kapasitas kuota program studi secara real-time.</p></div><div className="principal-dashboard-header-meta"><span className="principal-live"><i />GELOMBANG 1 ACTIVE</span><span className="principal-school-year"><Icon name="calendar" />Tahun Ajaran 2026/2027</span></div></header>
        {demo && <div className="principal-demo-note" role="note"><strong>Pratinjau simulasi</strong><span>Angka dan notifikasi di halaman ini adalah data contoh, bukan data pendaftar sungguhan.</span><Link href="/portal/kepala-sekolah">Tampilan kosong</Link></div>}

        <section className="principal-metrics" aria-label="Ringkasan penerimaan">
          <Metric icon="user" label="Total Pendaftar Akun" value={demo ? formatPpdbNumber(demoPpdbMetrics.totalApplicants) : "—"} note={demo ? "Akun terdaftar" : "Data belum tersedia"} tone="green" />
          <Metric icon="shield" label="Berkas Lengkap" value={demo ? formatPpdbNumber(demoPpdbMetrics.completeDocuments) : "—"} note={demo ? "79,1% dari total pendaftar" : "Data belum tersedia"} tone="mint" />
          <Metric icon="file" label="Lolos Verifikasi Admin" value={demo ? formatPpdbNumber(demoPpdbMetrics.verifiedApplicants) : "—"} note={demo ? "65,1% dari berkas lengkap" : "Data belum tersedia"} tone="blue" />
          <Metric icon="cap" label="Tingkat Kelulusan Sementara" value={demo ? demoPpdbMetrics.passRate : "—"} note={demo ? `${formatPpdbNumber(demoPpdbMetrics.admittedApplicants)} siswa lulus seleksi` : "Data belum tersedia"} tone="amber" />
        </section>

        <div className="principal-dashboard-content">
          <section className="principal-panel principal-quota-panel" id="pendaftar" aria-labelledby="principal-quota-title">
            <div className="principal-panel-heading"><div><h2 id="principal-quota-title">Keterisian Kuota Program Keahlian</h2><p>Target daya tampung masing-masing kompetensi keahlian.</p></div><Icon name="trend" /></div>
            {demo ? <div className="principal-quota-list">{programs.map((program) => {
              const percent = Math.round(program.students / program.quota * 100);
              return <article className="principal-quota-row" key={program.code}><div className="principal-quota-label"><strong>{program.name} ({program.code})</strong><span><b>{program.students}</b> / {program.quota} Kuota ({percent}%)</span></div><div className="principal-quota-track"><i className={program.color} style={{ width: `${percent}%` }} /></div></article>;
            })}</div> : <div className="principal-dashboard-empty">Ringkasan kuota akan tampil setelah data pendaftar tersedia.</div>}
          </section>

          <section className="principal-panel principal-notifications-panel" id="seleksi" aria-labelledby="principal-notifications-title">
            <div className="principal-panel-heading"><h2 id="principal-notifications-title">Notifikasi Pengawasan PPDB</h2>{demo && <span className="principal-notification-count">4 TINDAKAN</span>}</div>
            {demo ? <ul className="principal-notification-list">{notifications.map((item) => <li key={item.title}><i className={item.tone}><Icon name={item.icon} /></i><span><strong>{item.title}</strong><small>{item.detail}</small><time>{item.time}</time></span></li>)}</ul> : <div className="principal-dashboard-empty">Belum ada notifikasi pengawasan.</div>}
          </section>
        </div>

        <section className="principal-panel principal-chart-panel" aria-labelledby="principal-chart-title">
          <div className="principal-panel-heading"><h2 id="principal-chart-title">Alur &amp; Statistik Pendaftaran Harian</h2><span className="principal-chart-period">7 HARI TERAKHIR</span></div>
          {demo ? <div className="principal-week-chart" role="img" aria-label="Pendaftar baru per hari: Senin 20, Selasa 35, Rabu 45, Kamis 30, Jumat 60, Sabtu 85, Minggu 110.">{weekdays.map(({ day, count }) => <div className="principal-chart-column" key={day}><span className="principal-chart-value">{count} pendaftar</span><i style={{ height: `${Math.max(12, count / 110 * 78)}px` }} /><small>{day}</small></div>)}</div> : <div className="principal-dashboard-empty">Grafik pendaftaran harian akan tampil saat data tersedia.</div>}
        </section>
      </section>
    </div>
  </main>;
}
