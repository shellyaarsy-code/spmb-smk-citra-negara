"use client";

import { useEffect, useState } from "react";

type Report = {
  total: number; pendingDocuments: number; verifiedDocuments: number; passed: number;
  statuses: { status: string; count: number }[];
  programs: { code: string; name: string; count: number }[];
};
function csvCell(value: string | number) {
  let text = String(value);
  if (/^[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export default function LiveAdmissionsReport() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/admin/reports/summary", { cache: "no-store" }).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "Laporan gagal dimuat.");
      return body as Report;
    }).then((data) => { if (active) setReport(data); }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Laporan gagal dimuat."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  function exportCsv() {
    if (!report) return;
    const rows = [["Jenis", "Label", "Jumlah"], ["Ringkasan", "Aplikasi terkirim", report.total], ["Dokumen", "Menunggu verifikasi", report.pendingDocuments], ["Dokumen", "Terverifikasi", report.verifiedDocuments], ["Aplikasi", "Status PASSED", report.passed], ...report.statuses.map((item) => ["Status aplikasi", item.status, item.count] as (string | number)[]), ...report.programs.map((item) => ["Pilihan program", `${item.code} - ${item.name}`, item.count] as (string | number)[])];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "rekap-spmb.csv"; anchor.click(); URL.revokeObjectURL(url);
  }
  return <>
    <header className="admin-dashboard-header admin-bank-header"><div className="admin-dashboard-heading"><h1>Rekap SPMB</h1><p>Ringkasan langsung dari data aplikasi, status, dokumen, dan pilihan program.</p></div><button className="admin-bank-button primary" type="button" onClick={exportCsv} disabled={!report}>Ekspor CSV</button></header>
    {loading ? <p role="status">Memuat rekap…</p> : error ? <p role="alert" className="admin-announcement-notice">{error}</p> : report ? <div className="admin-announcement-layout"><section className="admin-announcement-history"><h2>Ringkasan</h2><dl><div><dt>Aplikasi terkirim</dt><dd>{report.total.toLocaleString("id-ID")}</dd></div><div><dt>Dokumen menunggu</dt><dd>{report.pendingDocuments.toLocaleString("id-ID")}</dd></div><div><dt>Dokumen verified</dt><dd>{report.verifiedDocuments.toLocaleString("id-ID")}</dd></div><div><dt>Status PASSED</dt><dd>{report.passed.toLocaleString("id-ID")}</dd></div></dl></section><section className="admin-announcement-preview"><h2>Jumlah per status aplikasi</h2>{report.statuses.length ? <ul className="admin-program-list">{report.statuses.map((item) => <li key={item.status}><span className="admin-program-name">{item.status.replaceAll("_", " ")}</span><strong>{item.count.toLocaleString("id-ID")}</strong></li>)}</ul> : <p>Belum ada data status aplikasi.</p>}<h2>Minat pilihan program</h2>{report.programs.length ? <ul className="admin-program-list">{report.programs.map((item) => <li key={item.code}><span className="admin-program-code green">{item.code}</span><span className="admin-program-name">{item.name}</span><strong>{item.count.toLocaleString("id-ID")}</strong></li>)}</ul> : <p>Belum ada program aktif.</p>}</section></div> : <p>Data rekap tidak tersedia.</p>}
  </>;
}
