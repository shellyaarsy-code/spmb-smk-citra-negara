"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AdminIcon } from "./admin-sidebar";

type Weights = { report: number; exam: number; interview: number };
type Candidate = { name: string; registration: string; program: string; report: number; exam: number; interview: number; resultProgram: string; resultType: "utama" | "cadangan" | "sisa" };
const initialWeights: Weights = { report: 40, exam: 40, interview: 20 };
const candidates: Candidate[] = [
  { name: "Siti Masitoh", registration: "CN260025", program: "PPLG", report: 94.2, exam: 92.1, interview: 90, resultProgram: "PPLG", resultType: "utama" },
  { name: "Rahman Aditya", registration: "CN260012", program: "PPLG", report: 88.4, exam: 88.4, interview: 92, resultProgram: "PPLG", resultType: "utama" },
  { name: "Farhan Mahendra", registration: "CN260048", program: "DKV", report: 85, exam: 74.5, interview: 88, resultProgram: "DKV", resultType: "cadangan" },
  { name: "Dewi Lestari", registration: "CN260085", program: "PPLG", report: 80.2, exam: 81, interview: 85, resultProgram: "PPLG", resultType: "utama" },
  { name: "Galih Prasetyo", registration: "CN260014", program: "TJKT", report: 82.5, exam: 62.3, interview: 75, resultProgram: "TJKT", resultType: "sisa" },
];
const capacities = [
  { code: "PPLG", name: "Pengembangan Perangkat Lunak dan Gim", enrolled: 120, total: 120 },
  { code: "TJKT", name: "Teknik Jaringan Komputer dan Telekomunikasi", enrolled: 95, total: 120 },
  { code: "DKV", name: "Desain Komunikasi Visual", enrolled: 118, total: 120 },
  { code: "MPLB", name: "Manajemen Perkantoran dan Layanan Bisnis", enrolled: 60, total: 80 },
];

function calculate(candidate: Candidate, weights: Weights) {
  return (candidate.report * weights.report + candidate.exam * weights.exam + candidate.interview * weights.interview) / 100;
}

export default function SelectionManagement() {
  const [weights, setWeights] = useState(initialWeights);
  const [draft, setDraft] = useState(initialWeights);
  const [notice, setNotice] = useState("");
  const [publishOpen, setPublishOpen] = useState(false);
  const [published, setPublished] = useState(false);
  const weightTotal = draft.report + draft.exam + draft.interview;
  const rankedCandidates = useMemo(() => candidates.map((candidate) => ({ ...candidate, finalScore: calculate(candidate, weights) })).sort((left, right) => right.finalScore - left.finalScore), [weights]);

  function saveWeights(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (weightTotal !== 100) {
      setNotice("Total bobot kriteria harus tepat 100% sebelum disimpan.");
      return;
    }
    setWeights(draft);
    setNotice("Pembobotan baru diterapkan pada pratinjau sesi ini. Nilai akhir dihitung ulang.");
    setPublished(false);
  }

  function changeWeight(key: keyof Weights, value: string) {
    const number = Number(value);
    setDraft((current) => ({ ...current, [key]: Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 0 }));
    setNotice("");
  }

  function publishResults() {
    setPublishOpen(false);
    setPublished(true);
    setNotice("Keputusan kelulusan diterbitkan untuk pratinjau ini saja. Tidak ada keputusan resmi yang dipublikasikan.");
  }

  return <>
    <header className="admin-dashboard-header admin-bank-header">
      <div className="admin-dashboard-heading"><h1>Manajemen Seleksi Siswa</h1><p>Parameter pembobotan kelulusan, kapasitas daya tampung program keahlian, dan ranking seleksi calon siswa</p></div>
      <div className="admin-dashboard-header-actions"><button className="admin-bank-bell" type="button" aria-label="Notifikasi"><AdminIcon name="bell" /></button><div className="admin-dashboard-account"><span>AD</span><div><strong>Administrator</strong><small>Panitia PPDB 2026</small></div></div></div>
    </header>
    <div className="admin-selection-layout">
      <div className="admin-selection-left-column">
        <form className="admin-selection-card admin-selection-weights" onSubmit={saveWeights}>
          <h2>Bobot Kriteria Kelulusan</h2><p className="admin-selection-help">Persentase pembobotan nilai akhir kelulusan pendaftar. Total akumulasi wajib berjumlah 100%.</p>
          <div className="admin-selection-weight-row"><label htmlFor="weight-report">1. Rata-rata Rapor (Smt 1–4)</label><div><input id="weight-report" type="number" min="0" max="100" step="5" value={draft.report} onChange={(event) => changeWeight("report", event.target.value)} /><span>%</span></div></div>
          <div className="admin-selection-weight-row"><label htmlFor="weight-exam">2. Nilai Tes Akademik (TKA)</label><div><input id="weight-exam" type="number" min="0" max="100" step="5" value={draft.exam} onChange={(event) => changeWeight("exam", event.target.value)} /><span>%</span></div></div>
          <div className="admin-selection-weight-row"><label htmlFor="weight-interview">3. Wawancara Minat Bakat</label><div><input id="weight-interview" type="number" min="0" max="100" step="5" value={draft.interview} onChange={(event) => changeWeight("interview", event.target.value)} /><span>%</span></div></div>
          <div className={`admin-selection-total ${weightTotal === 100 ? "valid" : "invalid"}`}>Total bobot <strong>{weightTotal}%</strong></div>
          <button type="submit" className="admin-bank-button primary"><AdminIcon name="settings" /> Simpan Pembobotan Baru</button>
        </form>

        <section className="admin-selection-card admin-selection-capacity" aria-labelledby="admin-selection-capacity-title"><h2 id="admin-selection-capacity-title">Kapasitas Daya Tampung Jurusan</h2><div className="admin-selection-capacity-list">{capacities.map((item) => { const percentage = Math.min(100, Math.round(item.enrolled / item.total * 100)); const remaining = item.total - item.enrolled; return <article key={item.code}><div className="admin-selection-capacity-heading"><div><strong>{item.code}</strong><span> ({item.name})</span></div><b>{item.enrolled}/{item.total}</b></div><div className="admin-selection-capacity-track"><span className={remaining === 0 ? "full" : ""} style={{ width: `${percentage}%` }} /></div><small className={remaining === 0 ? "full" : ""}>{remaining} Sisa</small></article>; })}</div></section>
      </div>

      <section className="admin-selection-ranking" aria-labelledby="admin-selection-ranking-title"><div className="admin-selection-ranking-heading"><div><h2 id="admin-selection-ranking-title">Peringkat Seleksi Calon Siswa</h2><span>GELOMBANG 1</span></div><button type="button" className={`admin-bank-button ${published ? "secondary" : "primary"}`} onClick={() => setPublishOpen(true)}><AdminIcon name="bell" /> {published ? "Keputusan Terbit (Simulasi)" : "Terbitkan Keputusan Kelulusan"}</button></div>
        <div className="admin-selection-table-wrap"><table className="admin-selection-table"><thead><tr><th>RANK</th><th>NAMA CALON SISWA</th><th>RAPOR</th><th>USM</th><th>WAWANCARA</th><th>NILAI AKHIR</th><th>STATUS SELEKSI</th></tr></thead><tbody>{rankedCandidates.map((candidate, index) => <tr key={candidate.registration}><td><strong>#{index + 1}</strong></td><td><div className="admin-selection-name">{candidate.name}<small>{candidate.registration} · {candidate.program}</small></div></td><td>{candidate.report.toFixed(2)}</td><td>{candidate.exam.toFixed(2)}</td><td>{candidate.interview.toFixed(2)}</td><td><strong className="admin-selection-final-score">{candidate.finalScore.toFixed(2)}</strong></td><td><span className={`admin-selection-outcome ${candidate.resultType}`}>{candidate.resultType === "utama" ? "Lulus Utama" : candidate.resultType === "cadangan" ? "Lulus Cadangan" : "Sisa Kuota"}</span></td></tr>)}</tbody></table></div>
        <div className="admin-selection-mobile-list">{rankedCandidates.map((candidate, index) => <article key={candidate.registration}><div className="admin-selection-mobile-heading"><strong>#{index + 1} · {candidate.name}</strong><b>{candidate.finalScore.toFixed(2)}</b></div><span>{candidate.registration} · {candidate.program}</span><div>Rapor {candidate.report.toFixed(2)} <i>·</i> USM {candidate.exam.toFixed(2)} <i>·</i> Wawancara {candidate.interview.toFixed(2)}</div><span className={`admin-selection-outcome ${candidate.resultType}`}>{candidate.resultType === "utama" ? "Lulus Utama" : candidate.resultType === "cadangan" ? "Lulus Cadangan" : "Sisa Kuota"}</span></article>)}</div>
      </section>
    </div>
    {notice && <p className="admin-selection-notice" role="status">{notice}</p>}
    {publishOpen && <div className="admin-bank-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPublishOpen(false); }}><section className="admin-bank-modal admin-selection-publish-modal" role="dialog" aria-modal="true" aria-labelledby="admin-selection-publish-title"><div className="admin-bank-modal-heading"><div><span>PRATINJAU SIMULASI</span><h2 id="admin-selection-publish-title">Terbitkan Keputusan Kelulusan?</h2></div><button type="button" aria-label="Tutup" onClick={() => setPublishOpen(false)}>×</button></div><p>Keputusan yang terlihat di tabel akan ditandai terbit hanya di pratinjau ini. Aksi ini tidak mengirim pengumuman atau mengubah data resmi.</p><div className="admin-bank-modal-actions"><button type="button" className="admin-bank-button secondary" onClick={() => setPublishOpen(false)}>Kembali</button><button type="button" className="admin-bank-button primary" onClick={publishResults}>Terbitkan Simulasi</button></div></section></div>}
  </>;
}
