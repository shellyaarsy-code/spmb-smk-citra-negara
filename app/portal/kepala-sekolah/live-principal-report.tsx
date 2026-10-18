"use client";

import PrincipalSidebar from "./principal-sidebar";
type Report = Awaited<ReturnType<typeof import("../../../services/admin/dashboard-service").getPrincipalDashboardSummary>>;
function cell(value: string | number) { let text = String(value); if (/^[=+@-]/.test(text)) text = `'${text}`; return `"${text.replaceAll('"', '""')}"`; }

export default function LivePrincipalReport({ report }: { report: Report | null }) {
  function exportCsv() {
    if (!report) return;
    const rows: (string | number)[][] = [["Kategori", "Rincian", "Jumlah"], ["Pendaftaran", "Aplikasi terkirim", report.total], ["Dokumen", "Menunggu verifikasi", report.pendingDocuments], ["Dokumen", "Terverifikasi", report.verifiedDocuments], ["Status", "PASSED", report.passed], ...report.statuses.map((x) => ["Status aplikasi", x.status, x.count]), ...report.programs.map((x) => ["Pilihan program", `${x.code} - ${x.name}`, x.count])];
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map(cell).join(",")).join("\r\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "rekap-spmb-kepala-sekolah.csv"; link.click(); URL.revokeObjectURL(url);
  }
  return <main className="principal-dashboard-outer"><div className="principal-dashboard-app"><PrincipalSidebar active="reports" demo={false} /><section className="principal-dashboard-main principal-report-main" aria-label="Rekap read-only SPMB">
    <header className="principal-dashboard-header"><div><h1>Rekap SPMB</h1><p>Ringkasan agregat dari data aplikasi tersimpan. Tidak berisi keputusan seleksi baru.</p></div><button type="button" onClick={exportCsv} disabled={!report}>Ekspor CSV</button></header>
    {!report ? <p role="status">Rekap belum dapat dimuat.</p> : <div className="principal-statistics-analysis"><section className="principal-statistics-panel"><h2>Jumlah aplikasi dan dokumen</h2><dl><div><dt>Aplikasi terkirim</dt><dd>{report.total.toLocaleString("id-ID")}</dd></div><div><dt>Dokumen menunggu verifikasi</dt><dd>{report.pendingDocuments.toLocaleString("id-ID")}</dd></div><div><dt>Dokumen terverifikasi</dt><dd>{report.verifiedDocuments.toLocaleString("id-ID")}</dd></div><div><dt>Aplikasi berstatus PASSED</dt><dd>{report.passed.toLocaleString("id-ID")}</dd></div></dl></section><section className="principal-statistics-panel"><h2>Status aplikasi</h2>{report.statuses.map((x) => <p key={x.status}>{x.status.replaceAll("_", " ")}: <strong>{x.count.toLocaleString("id-ID")}</strong></p>)}</section><section className="principal-statistics-panel"><h2>Pilihan program</h2>{report.programs.length ? report.programs.map((x) => <p key={x.code}>{x.code} · {x.name}: <strong>{x.count.toLocaleString("id-ID")} pilihan</strong></p>) : <p>Belum ada program aktif.</p>}</section></div>}
  </section></div></main>;
}
