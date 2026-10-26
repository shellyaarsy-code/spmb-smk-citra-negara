import Link from "next/link";
import DemoDocumentTypesSetup from "./demo-document-types-setup";
import { spmbPolicy } from "../../../config/spmb-policy";
import AdminSidebar, { AdminIcon } from "./admin-sidebar";
import { demoPpdbMetrics, demoPpdbPrograms, formatPpdbNumber } from "../demo-ppdb-data";
import { getAdminDashboardSummary } from "../../../services/admin/dashboard-service";
import { applicationStatusOrder, getApplicationStatusLabel, getApplicationStatusTone } from "./status-labels";

const programs = demoPpdbPrograms;

const demoQueue = [
  { initial: "R", name: "Rahman Aditya", program: "PPLG", detail: "Hari ini, 10.24", status: "Sedang Ditinjau", state: "review" },
  { initial: "S", name: "Siti Rahmawati", program: "DKV", detail: "Hari ini, 09.12", status: "Belum Ditinjau", state: "waiting" },
  { initial: "A", name: "Andi Wijaya", program: "TJKT", detail: "Kemarin, 16.45", status: "Belum Ditinjau", state: "waiting" },
  { initial: "F", name: "Farhan Mahendra", program: "MPLB", detail: "Kemarin, 15.30", status: "Belum Ditinjau", state: "waiting" },
];

const demoAgenda = [
  { title: "Penutupan Gelombang 1", date: "15 Maret 2026", detail: "Verifikasi dokumen harus selesai.", tone: "red" },
  { title: "Tes Saringan Masuk", date: "20 Maret 2026", detail: "Metode ujian tulis online via portal.", tone: "green" },
  { title: "Pengumuman Kelulusan", date: "25 Maret 2026", detail: "Integrasi sistem penandatangan SK.", tone: "blue" },
];

function MetricCard({ label, value, note, tone, icon, href }: { label: string; value: string; note: string; tone: string; icon: "people" | "check" | "chart"; href?: string }) {
  const content = <><div className="admin-metric-top"><span>{label}</span><span className={`admin-metric-icon ${tone}`}><AdminIcon name={icon} /></span></div><div className="admin-metric-value">{value}</div><span className={`admin-metric-note ${tone}`}>{note}</span></>;
  return (
    href ? <Link className="admin-metric-card" href={href}>{content}</Link> : <article className="admin-metric-card">{content}</article>
  );
}

function EmptyPanel({ children }: { children: string }) {
  return <p className="admin-empty-state">{children}</p>;
}

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";
  let summary: Awaited<ReturnType<typeof getAdminDashboardSummary>> | null = null;
  if (!demo) {
    try { summary = await getAdminDashboardSummary(); }
    catch { summary = null; }
  }
  const funnel = demo
    ? [{ label: "Membuat Akun", count: formatPpdbNumber(demoPpdbMetrics.totalApplicants), percent: 100, color: "green" }, { label: "Berkas Lengkap", count: formatPpdbNumber(demoPpdbMetrics.completeDocuments), percent: 79.1, color: "green" }, { label: "Lolos Verifikasi Admin", count: formatPpdbNumber(demoPpdbMetrics.verifiedApplicants), percent: 51.6, color: "green" }, { label: "Lulus Seleksi Akhir", count: formatPpdbNumber(demoPpdbMetrics.admittedApplicants), percent: 39.8, color: "blue" }]
    : [];
  const liveStatuses = summary
    ? [...summary.statuses].sort((a, b) => {
      const aOrder = applicationStatusOrder.indexOf(a.status as (typeof applicationStatusOrder)[number]);
      const bOrder = applicationStatusOrder.indexOf(b.status as (typeof applicationStatusOrder)[number]);
      return (aOrder < 0 ? applicationStatusOrder.length : aOrder) - (bOrder < 0 ? applicationStatusOrder.length : bOrder) || a.status.localeCompare(b.status);
    })
    : [];
  const visibleLiveStatuses = liveStatuses.filter(({ count }) => count > 0);
  const zeroLiveStatuses = liveStatuses.filter(({ count }) => count === 0);
  const liveStatusCounts = new Map(liveStatuses.map(({ status, count }) => [status, count]));
  const renderLiveStatuses = (statuses: typeof liveStatuses) => statuses.map(({ status, count }) => {
    const percent = summary?.total ? Math.min(100, count / summary.total * 100) : 0;
    const tone = getApplicationStatusTone(status);
    return <div className={`admin-funnel-item admin-status-tone-${tone}`} key={status}>
      <div className="admin-funnel-heading"><strong>{getApplicationStatusLabel(status)}</strong><span className="admin-funnel-values"><b>{count.toLocaleString("id-ID")}</b><span>{percent.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%</span></span></div>
      <div className="admin-funnel-track"><span style={{ width: `${percent}%` }} /></div>
    </div>;
  });

  return (
    <main className="admin-dashboard-outer">
      <div className="admin-dashboard-app">
        <AdminSidebar active="dashboard" demo={demo} />

        <section className="admin-dashboard-main" aria-label="Dashboard analitis admin">
          <header className="admin-dashboard-header">
            <div className="admin-dashboard-heading"><h1>Dashboard Analitis</h1><p>Pantau kemajuan pendaftaran dan verifikasi SPMB.</p></div>
            <div className="admin-dashboard-header-actions">
              <Link className="admin-dashboard-search" href={demo ? "/portal/admin/pendaftaran?mode=demo" : "/portal/admin/pendaftaran"} aria-label="Buka daftar dan pencarian pendaftar"><AdminIcon name="search" /><span>Cari pendaftar</span></Link>
              <div className="admin-dashboard-account"><span>AD</span><div><strong>Admin Admisi</strong><small>PANITIA PPDB</small></div></div>
            </div>
          </header>

          {demo && <div className="admin-demo-banner" role="note"><strong>Mode simulasi</strong><span>Angka, agenda, dan daftar nama pada halaman ini hanya contoh visual, bukan data pendaftar sungguhan.</span><Link href="/portal/admin">Lihat tampilan kosong</Link></div>}

          {process.env.VERCEL_ENV === "preview" && spmbPolicy.demoMode && <DemoDocumentTypesSetup />}

          <section className="admin-metrics-grid" aria-label="Ringkasan jumlah pendaftar">
            <MetricCard label="Total Pendaftar" value={demo ? formatPpdbNumber(demoPpdbMetrics.totalApplicants) : summary?.total.toLocaleString("id-ID") ?? "—"} note={demo ? "Akun terdaftar (simulasi)" : summary ? "Aplikasi yang telah dikirim" : "Data belum dapat dimuat"} tone="green" icon="people" />
            <MetricCard label="Dokumen Menunggu Verifikasi" value={demo ? formatPpdbNumber(demoPpdbMetrics.completeDocuments) : summary?.pendingDocuments.toLocaleString("id-ID") ?? "—"} note={demo ? "Angka simulasi" : "Dokumen berstatus pending"} tone="amber" icon="check" />
            <MetricCard label="Dokumen Terverifikasi" value={demo ? formatPpdbNumber(demoPpdbMetrics.verifiedApplicants) : summary?.verifiedDocuments.toLocaleString("id-ID") ?? "—"} note={demo ? "Angka simulasi" : "Dokumen berstatus verified"} tone="mint" icon="check" />
            <MetricCard label="Status Lulus" value={demo ? formatPpdbNumber(demoPpdbMetrics.admittedApplicants) : summary?.passed.toLocaleString("id-ID") ?? "—"} note={demo ? `Simulasi ${demoPpdbMetrics.passRate}` : `Aplikasi berstatus ${getApplicationStatusLabel("PASSED")}`} tone="blue" icon="chart" />
            {!demo && <>
              <MetricCard label="Pembayaran Menunggu" value={summary?.pendingPayments.toLocaleString("id-ID") ?? "—"} note={summary ? "Menunggu pemeriksaan admin" : "Data belum dapat dimuat"} tone="amber" icon="check" href="/portal/admin/pembayaran" />
              <MetricCard label="Tes TKA Terbit" value={summary?.publishedTests.toLocaleString("id-ID") ?? "—"} note={summary ? "Tes aktif yang dipublikasikan" : "Data belum dapat dimuat"} tone="green" icon="chart" href="/portal/admin/manajemen-tes" />
              <MetricCard label="Keputusan Seleksi" value={summary?.selectionDecisions.toLocaleString("id-ID") ?? "—"} note={summary ? "Keputusan tersimpan" : "Data belum dapat dimuat"} tone="blue" icon="people" href="/portal/admin/manajemen-seleksi" />
            </>}
          </section>

          <div className="admin-dashboard-grid admin-dashboard-grid-top">
            <section className="admin-dashboard-card admin-funnel-card" aria-labelledby="admin-funnel-title">
              <h2 id="admin-funnel-title">{demo ? "Fase Konversi Alur SPMB" : "Jumlah per Status Aplikasi"}</h2>
              {demo ? <div className="admin-funnel-list">{funnel.map((item) => <div className="admin-funnel-item" key={item.label}><div className="admin-funnel-heading"><strong>{item.label}</strong><span>{item.count} Siswa ({item.percent}%)</span></div><div className="admin-funnel-track"><span className={item.color} style={{ width: `${item.percent}%` }} /></div></div>)}</div> : summary ? <><div className="admin-funnel-list">{visibleLiveStatuses.length ? renderLiveStatuses(visibleLiveStatuses) : <EmptyPanel>Belum ada pendaftar pada status aplikasi.</EmptyPanel>}</div>{zeroLiveStatuses.length > 0 && <details className="admin-funnel-zero-statuses"><summary>Tampilkan semua status ({zeroLiveStatuses.length} status kosong)</summary><div className="admin-funnel-list">{renderLiveStatuses(zeroLiveStatuses)}</div></details>}</> : <EmptyPanel>Ringkasan status belum dapat dimuat.</EmptyPanel>}
            </section>

            <section className="admin-dashboard-card admin-program-card" aria-labelledby="admin-program-title">
              <h2 id="admin-program-title">Peminat Berdasarkan Program Keahlian</h2>
              {demo ? <ul className="admin-program-list">{programs.map((program) => <li key={program.code}><span className={`admin-program-code ${program.tone}`}>{program.code}</span><span className="admin-program-name">{program.name}</span><strong>{program.count.toLocaleString("id-ID")} siswa</strong></li>)}</ul> : summary ? summary.programs.length ? <ul className="admin-program-list">{summary.programs.map((program) => <li key={program.code}><span className="admin-program-code green">{program.code}</span><span className="admin-program-name">{program.name}</span><strong>{program.count.toLocaleString("id-ID")} pilihan</strong></li>)}</ul> : <EmptyPanel>Belum ada program aktif.</EmptyPanel> : <EmptyPanel>Data program belum dapat dimuat.</EmptyPanel>}
            </section>
          </div>

          <div className="admin-dashboard-grid admin-dashboard-grid-bottom">
            <section className="admin-dashboard-card admin-queue-card" aria-labelledby="admin-queue-title">
              <div className="admin-card-heading"><h2 id="admin-queue-title">Antrean Verifikasi Dokumen</h2>{demo ? <Link href="/portal/admin/pendaftaran?mode=demo">Lihat Semua (24) <AdminIcon name="arrow" /></Link> : <Link href="/portal/admin/pendaftaran?documentStatus=PENDING">Tinjau antrean <AdminIcon name="arrow" /></Link>}</div>
              {demo ? <ul className="admin-queue-list">{demoQueue.map((item) => <li className="admin-queue-row" key={item.name}><span className="admin-queue-avatar">{item.initial}</span><span className="admin-queue-person"><strong>{item.name}</strong><small>Program Pilihan: {item.program} <i aria-hidden="true">•</i> {item.detail}</small></span><span className={`admin-queue-status ${item.state}`}>{item.status}</span></li>)}</ul> : <EmptyPanel>{summary ? summary.pendingDocuments ? `${summary.pendingDocuments.toLocaleString("id-ID")} dokumen menunggu verifikasi. Buka daftar pendaftar untuk meninjau dokumen per siswa.` : "Tidak ada dokumen berstatus pending." : "Data antrean belum dapat dimuat."}</EmptyPanel>}
            </section>

            {demo ? <section className="admin-dashboard-card admin-agenda-card" aria-labelledby="admin-agenda-title">
              <h2 id="admin-agenda-title">Target Agenda SPMB</h2>
              <ol className="admin-agenda-list">{demoAgenda.map((item) => <li className={`admin-agenda-item ${item.tone}`} key={item.title}><strong>{item.title}</strong><time>{item.date}</time><p>{item.detail}</p></li>)}</ol>
            </section> : <section className="admin-dashboard-card admin-outcome-card" aria-labelledby="admin-outcome-title">
              <h2 id="admin-outcome-title">Ringkasan Hasil Seleksi</h2>
              {summary ? <ul className="admin-outcome-list">{(["PASSED", "FAILED", "WAITING_SELECTION"] as const).map((status) => <li className={`admin-status-tone-${getApplicationStatusTone(status)}`} key={status}><span><i aria-hidden="true" />{getApplicationStatusLabel(status)}</span><strong>{(liveStatusCounts.get(status) ?? 0).toLocaleString("id-ID")}</strong></li>)}</ul> : <EmptyPanel>Ringkasan hasil seleksi belum dapat dimuat.</EmptyPanel>}
            </section>}
          </div>

          <footer className="admin-dashboard-footer"><span>SPMB SMK Citra Negara</span><Link href="/portal/admin?mode=demo">Buka contoh tampilan</Link></footer>
        </section>
      </div>
    </main>
  );
}
