import Link from "next/link";
import type { ReactNode } from "react";
import PrincipalSidebar from "./principal-sidebar";
import { demoPpdbMetrics, demoPpdbPrograms, demoPpdbWeekly, formatPpdbNumber } from "../demo-ppdb-data";

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

const programs = demoPpdbPrograms.map((program) => ({ code: program.code, name: program.name, students: program.admitted, quota: program.capacity, color: program.quotaColor }));

const notifications = [
  { icon: "users" as const, tone: "amber", title: "Kuota TJKT Terisi Penuh", detail: "Gelombang 1 · pendaftar program TJKT sudah mencapai 100%.", time: "12 menit lalu" },
  { icon: "shield" as const, tone: "green", title: `${formatPpdbNumber(demoPpdbMetrics.completeDocuments)} Berkas Lengkap`, detail: "Dokumen calon siswa telah dilengkapi untuk pemeriksaan administrasi.", time: "2 jam lalu" },
  { icon: "file" as const, tone: "blue", title: "Nilai Ujian Masuk Diunggah", detail: "Nilai Saringan Masuk (TKA) Gelombang 1 telah tersedia.", time: "4 jam lalu" },
];

const maxWeeklyApplicants = Math.max(...demoPpdbWeekly.map((week) => week.newApplicants));

function Metric({ icon, label, value, note, tone }: { icon: IconName; label: string; value: string; note: string; tone: string }) {
  return <article className="principal-metric"><div className="principal-metric-top"><span>{label}</span><i className={tone}><Icon name={icon} /></i></div><strong>{value}</strong><small className={tone}>{note}</small></article>;
}

type PrincipalSummary = Awaited<ReturnType<typeof import("../../../services/admin/dashboard-service").getPrincipalDashboardSummary>>;

export default function PrincipalDashboard({ demo, summary }: { demo: boolean; summary: PrincipalSummary | null }) {
  return <main className="principal-dashboard-outer">
    <div className="principal-dashboard-app">
      <PrincipalSidebar active="dashboard" demo={demo} />

      <section className="principal-dashboard-main" id="overview" aria-label="Monitoring dashboard Kepala Sekolah">
        <header className="principal-dashboard-header"><div><h1>Monitoring Dashboard</h1><p>Ringkasan aplikasi pendaftaran dan dokumen dari data tersimpan.</p></div><div className="principal-dashboard-header-meta"><span className="principal-live"><i />{demo ? "GELOMBANG 1 · SIMULASI" : "DATA TERKINI"}</span><span className="principal-school-year"><Icon name="calendar" />Tahun Ajaran 2026/2027</span></div></header>
        {demo && <div className="principal-demo-note" role="note"><strong>Pratinjau simulasi</strong><span>Angka dan notifikasi di halaman ini adalah data contoh, bukan data pendaftar sungguhan.</span><span>Data simulasi</span></div>}

        <section className="principal-metrics" aria-label="Ringkasan penerimaan">
          <Metric icon="user" label="Total Aplikasi Terkirim" value={demo ? formatPpdbNumber(demoPpdbMetrics.totalApplicants) : summary?.total.toLocaleString("id-ID") ?? "—"} note={demo ? "Angka simulasi" : summary ? "Data aplikasi persisten" : "Data belum dapat dimuat"} tone="green" />
          <Metric icon="shield" label={demo ? "Berkas Lengkap" : "Dokumen Menunggu Verifikasi"} value={demo ? formatPpdbNumber(demoPpdbMetrics.completeDocuments) : summary?.pendingDocuments.toLocaleString("id-ID") ?? "—"} note={demo ? "79,2% dari total pendaftar" : "Dokumen berstatus pending"} tone="mint" />
          <Metric icon="file" label={demo ? "Pendaftar Lolos Verifikasi" : "Dokumen Terverifikasi"} value={demo ? formatPpdbNumber(demoPpdbMetrics.verifiedApplicants) : summary?.verifiedDocuments.toLocaleString("id-ID") ?? "—"} note={demo ? "51,6% dari total pendaftar" : "Dokumen berstatus verified"} tone="blue" />
          <Metric icon="cap" label="Aplikasi Berstatus PASSED" value={demo ? formatPpdbNumber(demoPpdbMetrics.admittedApplicants) : summary?.passed.toLocaleString("id-ID") ?? "—"} note={demo ? "Angka simulasi" : "Status saat ini; bukan hasil perhitungan seleksi"} tone="amber" />
        </section>

        <div className="principal-dashboard-content">
          <section className="principal-panel principal-quota-panel" id="pendaftar" aria-labelledby="principal-quota-title">
            <div className="principal-panel-heading"><div><h2 id="principal-quota-title">{demo ? "Keterisian Kuota Program Keahlian" : "Minat Pilihan Program Keahlian"}</h2><p>{demo ? "Target daya tampung masing-masing kompetensi keahlian." : "Jumlah pilihan dari aplikasi terkirim; bukan jumlah calon siswa yang diterima."}</p></div><Icon name="trend" /></div>
            {demo ? <div className="principal-quota-list">{programs.map((program) => {
              const percent = Math.round(program.students / program.quota * 100);
              return <article className="principal-quota-row" key={program.code}><div className="principal-quota-label"><strong>{program.name} ({program.code})</strong><span><b>{program.students}</b> / {program.quota} Kuota ({percent}%)</span></div><div className="principal-quota-track"><i className={program.color} style={{ width: `${percent}%` }} /></div></article>;
            })}</div> : summary ? summary.programs.length ? <div className="principal-quota-list">{summary.programs.map((program) => <article className="principal-quota-row" key={program.code}><div className="principal-quota-label"><strong>{program.name} ({program.code})</strong><span><b>{program.count.toLocaleString("id-ID")}</b> pilihan · Daya tampung: {program.capacity ?? "Belum ditetapkan"}</span></div><div className="principal-quota-track"><i className="forest" style={{ width: `${summary.total ? Math.min(100, program.count / summary.total * 100) : 0}%` }} /></div></article>)}</div> : <div className="principal-dashboard-empty">Belum ada program aktif.</div> : <div className="principal-dashboard-empty">Ringkasan program belum dapat dimuat.</div>}
          </section>

          <section className="principal-panel principal-notifications-panel" id="seleksi" aria-labelledby="principal-notifications-title">
            <div className="principal-panel-heading"><h2 id="principal-notifications-title">Notifikasi Pengawasan PPDB</h2>{demo && <span className="principal-notification-count">{notifications.length} NOTIFIKASI</span>}</div>
            {demo ? <ul className="principal-notification-list">{notifications.map((item) => <li key={item.title}><i className={item.tone}><Icon name={item.icon} /></i><span><strong>{item.title}</strong><small>{item.detail}</small><time>{item.time}</time></span></li>)}</ul> : <div className="principal-dashboard-empty">Belum ada notifikasi pengawasan.</div>}
          </section>
        </div>

        <section className="principal-panel principal-chart-panel" aria-labelledby="principal-chart-title">
          <div className="principal-panel-heading"><h2 id="principal-chart-title">Tren Pendaftar Baru per Minggu</h2><span className="principal-chart-period">7 MINGGU</span></div>
          {demo ? <div className="principal-week-chart" role="img" aria-label={`Pendaftar baru per minggu: ${demoPpdbWeekly.map((week) => `${week.label} ${week.newApplicants}`).join(", ")}; total ${formatPpdbNumber(demoPpdbMetrics.totalApplicants)} pendaftar.`}>{demoPpdbWeekly.map((week) => <div className="principal-chart-column" key={week.label}><span className="principal-chart-value">+{formatPpdbNumber(week.newApplicants)}</span><i style={{ height: `${Math.max(12, week.newApplicants / maxWeeklyApplicants * 78)}px` }} /><small>{week.label}</small></div>)}</div> : <div className="principal-dashboard-empty">Grafik mingguan akan tampil saat data tersedia.</div>}
        </section>
      </section>
    </div>
  </main>;
}
