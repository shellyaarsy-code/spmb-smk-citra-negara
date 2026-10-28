"use client";

import { useEffect, useState } from "react";
type Result = { id: string; totalScore: number | null; publishedAt: string | null; attempt: { submittedAt: string | null; schedule: { tkaTest: { name: string } } } };
export default function LiveTkaResults() {
  const [results, setResults] = useState<Result[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => { void fetch("/api/student/tka/results", { cache: "no-store" }).then(async (response) => { const body = await response.json().catch(() => null); if (!response.ok) throw new Error(body?.error || "Hasil belum dapat dimuat."); if (active) setResults(Array.isArray(body.results) ? body.results : []); }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Hasil belum dapat dimuat."); }).finally(() => { if (active) setLoading(false); }); }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);
  if (loading) return <section className="tka-result-empty"><p role="status">Memuat hasil TKA…</p></section>;
  if (error) return <section className="tka-result-empty"><p role="alert">{error}</p></section>;
  if (!results.length) return <section className="tka-result-empty"><h2>Hasil TKA belum dipublikasikan</h2><p>Nilai hanya tampil di halaman ini setelah panitia memublikasikan hasil tersimpan milik Anda.</p></section>;
  return <div className="tka-results-layout">{results.map((result) => <section className="tka-score-card" key={result.id}><div className="tka-score-card-header"><h2>{result.attempt.schedule.tkaTest.name}</h2><span>Hasil dipublikasikan</span></div><div className="tka-score-summary"><div className="tka-final-score"><span>Nilai TKA</span><strong>{result.totalScore ?? "—"}</strong><small>Jumlah poin sesuai bank soal</small></div></div><p>Dikirim {result.attempt.submittedAt ? new Date(result.attempt.submittedAt).toLocaleString("id-ID") : "—"} · Dipublikasikan {result.publishedAt ? new Date(result.publishedAt).toLocaleString("id-ID") : "—"}</p></section>)}</div>;
}
