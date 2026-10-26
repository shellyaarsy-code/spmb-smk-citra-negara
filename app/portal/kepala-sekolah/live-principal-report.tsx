"use client";

import PrincipalSidebar from "./principal-sidebar";
type Report = Awaited<ReturnType<typeof import("../../../services/admin/dashboard-service").getPrincipalDashboardSummary>>;
function cell(value: string | number) { let text = String(value); if (/^[=+@-]/.test(text)) text = `'${text}`; return `"${text.replaceAll('"', '""')}"`; }
function formatStatus(value: string) { return value.toLocaleLowerCase("id-ID").replaceAll("_", " ").replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("id-ID")); }

export default function LivePrincipalReport({ report }: { report: Report | null }) {
  function exportCsv() {
    if (!report) return;
    const rows: (string | number)[][] = [["Kategori", "Rincian", "Jumlah"], ["Pendaftaran", "Aplikasi terkirim", report.total], ["Dokumen", "Menunggu verifikasi", report.pendingDocuments], ["Dokumen", "Terverifikasi", report.verifiedDocuments], ["Status", "PASSED", report.passed], ...report.statuses.map((x) => ["Status aplikasi", x.status, x.count]), ...report.programs.map((x) => ["Pilihan program", `${x.code} - ${x.name}`, x.count])];
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map(cell).join(",")).join("\r\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "rekap-spmb-kepala-sekolah.csv"; link.click(); URL.revokeObjectURL(url);
  }
  const maxStatus = Math.max(1, ...(report?.statuses.map((item) => item.count) ?? []));
  const maxProgram = Math.max(1, ...(report?.programs.map((item) => item.count) ?? []));
  return <main className="principal-dashboard-outer"><div className="principal-dashboard-app"><PrincipalSidebar active="reports" demo={false} /><section className="principal-dashboard-main principal-report-main" aria-label="Rekap read-only SPMB">
    <header className="principal-dashboard-header"><div><h1>Rekap SPMB</h1><p>Ringkasan agregat dari data aplikasi tersimpan. Tidak berisi keputusan seleksi baru.</p></div><button className="principal-report-export" type="button" onClick={exportCsv} disabled={!report}>Ekspor CSV</button></header>
    {!report ? <div className="principal-report-empty-state" role="status"><strong>Rekap belum dapat dimuat</strong><span>Data ringkasan belum tersedia. Coba muat ulang halaman atau hubungi administrator.</span></div> : <>
      <section className="principal-report-kpis" aria-label="Angka utama SPMB">
        <article className="principal-report-kpi"><span>Total aplikasi terkirim</span><strong>{report.total.toLocaleString("id-ID")}</strong><small>Data pendaftaran tersimpan</small></article>
        <article className="principal-report-kpi amber"><span>Dokumen menunggu</span><strong>{report.pendingDocuments.toLocaleString("id-ID")}</strong><small>Perlu ditinjau panitia</small></article>
        <article className="principal-report-kpi mint"><span>Dokumen terverifikasi</span><strong>{report.verifiedDocuments.toLocaleString("id-ID")}</strong><small>Sudah diperiksa panitia</small></article>
        <article className="principal-report-kpi blue"><span>Lulus seleksi</span><strong>{report.passed.toLocaleString("id-ID")}</strong><small>Status keputusan tersimpan</small></article>
      </section>
      <div className="principal-report-breakdown">
        <section className="principal-report-panel" aria-labelledby="report-status-title"><header><div><h2 id="report-status-title">Status aplikasi</h2><p>Jumlah pendaftar pada setiap tahap proses.</p></div><span>{report.total.toLocaleString("id-ID")} total</span></header>
          {report.statuses.length ? <div className="principal-report-rows">{report.statuses.map((item) => <article className="principal-report-row" key={item.status}><div className="principal-report-row-label"><span>{formatStatus(item.status)}</span><strong>{item.count.toLocaleString("id-ID")}</strong></div><div className="principal-report-meter"><i style={{ width: `${item.count ? Math.max(3, item.count / maxStatus * 100) : 0}%` }} /></div></article>)}</div> : <p className="principal-report-inline-empty">Belum ada data status aplikasi.</p>}
        </section>
        <section className="principal-report-panel" aria-labelledby="report-program-title"><header><div><h2 id="report-program-title">Pilihan program keahlian</h2><p>Minat siswa berdasarkan pilihan program.</p></div><span>{report.programs.length} program</span></header>
          {report.programs.length ? <div className="principal-report-rows">{report.programs.map((item) => <article className="principal-report-row" key={item.code}><div className="principal-report-row-label"><span><b>{item.code}</b>{item.name}</span><strong>{item.count.toLocaleString("id-ID")}</strong></div><div className="principal-report-meter program"><i style={{ width: `${item.count ? Math.max(3, item.count / maxProgram * 100) : 0}%` }} /></div></article>)}</div> : <p className="principal-report-inline-empty">Belum ada pilihan program tercatat.</p>}
        </section>
      </div>
    </>}
  </section></div></main>;
}