"use client";

import { useEffect, useState } from "react";

type Result = { selectionRank: number | null; status: "PASSED" | "WAITLISTED" | "FAILED"; studyProgram: { code: string; name: string } };
export default function LiveSelectionResult() {
  const [published, setPublished] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void fetch("/api/student/selection-result", { cache: "no-store" }).then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Hasil belum dapat dimuat.");
        if (active) { setPublished(body.published === true); setResults(Array.isArray(body.results) ? body.results : []); }
      }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Hasil belum dapat dimuat."); });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);
  if (error) return <p role="status">{error}</p>;
  if (!published) return <p className="graduation-empty-note">Hasil resmi belum dipublikasikan oleh sekolah.</p>;
  if (!results.length) return <p className="graduation-empty-note">Belum ada hasil seleksi yang diterbitkan untuk pendaftaran ini.</p>;
  return <section className="graduation-outcomes" aria-label="Hasil seleksi resmi">
    {results.map((result, index) => <article className="graduation-outcome-card" key={`${result.studyProgram.code}-${index}`}>
      <h3>{result.status === "PASSED" ? "Diterima" : result.status === "WAITLISTED" ? "Daftar tunggu" : "Belum diterima"}</h3>
      <p>{result.studyProgram.name} ({result.studyProgram.code}){result.selectionRank ? ` · Peringkat ${result.selectionRank}` : ""}</p>
    </article>)}
  </section>;
}
