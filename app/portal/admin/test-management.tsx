"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { AdminIcon } from "./admin-sidebar";
import { downloadCsv } from "../csv-export";

type Session = { id: number; title: string; time: string; room: string; attendance: string; status: "Selesai" | "Ujian Berlangsung" | "Belum Dimulai" };
type Score = { name: string; registration: string; session: string; room: string; score: string };
const initialSessions: Session[] = [
  { id: 1, title: "Sesi 1 (Pagi)", time: "07:30 - 09:15", room: "Lab Komputer A", attendance: "40/40", status: "Selesai" },
  { id: 2, title: "Sesi 2 (Siang)", time: "09:30 - 11:15", room: "Lab Komputer Terpadu", attendance: "114/120", status: "Ujian Berlangsung" },
  { id: 3, title: "Sesi 3 (Sore)", time: "13:00 - 14:45", room: "Lab Desain Kreatif", attendance: "0/35", status: "Belum Dimulai" },
];
const sampleScores: Score[] = [
  { name: "Rahman Aditya", registration: "CN260012", session: "Sesi 2", room: "Lab A", score: "88.40" },
  { name: "Siti Masitoh", registration: "CN260025", session: "Sesi 1", room: "Lab A", score: "92.10" },
  { name: "Galih Prasetyo", registration: "CN260014", session: "Sesi 2", room: "Lab Komputer", score: "62.30" },
  { name: "Farhan Mahendra", registration: "CN260048", session: "Sesi 1", room: "Lab A", score: "74.50" },
  { name: "Dewi Lestari", registration: "CN260085", session: "Sesi 2", room: "Lab Komputer", score: "81.00" },
];

export default function TestManagement() {
  const [sessions, setSessions] = useState(initialSessions);
  const [token, setToken] = useState("XG7BBD");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [scoreDetail, setScoreDetail] = useState<Score | null>(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [sessionRoom, setSessionRoom] = useState("");
  const [sessionCapacity, setSessionCapacity] = useState("40");
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const filteredScores = useMemo(() => sampleScores.filter((item) => `${item.name} ${item.registration} ${item.session} ${item.room}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const activeSession = sessions.find((session) => session.status === "Ujian Berlangsung") ?? sessions[0];
  const liveAttendance = activeSession?.attendance ?? "0/0";

  async function copyToken() {
    try {
      await navigator.clipboard.writeText(token);
      setNotice("Token sesi berhasil disalin.");
    } catch {
      setNotice("Token sesi: " + token);
    }
  }

  function refreshToken() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const nextToken = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setToken(nextToken);
    setNotice("Token sesi contoh diperbarui. Token ini tidak mengatur akses ujian sungguhan.");
  }

  function addSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sessionNumber = sessions.length + 1;
    setSessions((current) => [...current, { id: Date.now(), title: sessionTitle || `Sesi ${sessionNumber}`, time: sessionTime, room: sessionRoom, attendance: `0/${sessionCapacity}`, status: "Belum Dimulai" }]);
    setNotice("Sesi baru ditambahkan pada pratinjau ini saja.");
    setModalOpen(false);
    setSessionTitle(""); setSessionTime(""); setSessionRoom(""); setSessionCapacity("40");
  }

  function exportScores() {
    const rows = [["Nama", "Nomor Pendaftaran", "Sesi", "Ruang", "Nilai TKA"], ...filteredScores.map((item) => [item.name, item.registration, item.session, item.room, item.score])];
    downloadCsv("hasil-nilai-tka-smk-citra-negara-2026-2027.csv", rows);
    setNotice("File nilai simulasi berhasil diunduh.");
  }

  function openSessionModal() { setModalOpen(true); window.setTimeout(() => firstFieldRef.current?.focus(), 0); }

  return <>
    <header className="admin-dashboard-header admin-bank-header">
      <div className="admin-dashboard-heading"><h1>Manajemen Jadwal &amp; Sesi Tes</h1><p>Monitor jadwal, ruang/sesi ujian saringan masuk, presensi peserta, serta integrasi nilai hasil USM</p></div>
      <div className="admin-dashboard-header-actions"><button className="admin-bank-bell" type="button" aria-label="Notifikasi"><AdminIcon name="bell" /></button><div className="admin-dashboard-account"><span>AD</span><div><strong>Administrator</strong><small>Panitia PPDB 2026</small></div></div></div>
    </header>

    <div className="admin-test-summary-grid">
      <section className="admin-test-summary-card"><div className="admin-test-summary-label">SESI AKTIF HARI INI <span className="admin-test-live-pill">LIVE</span></div><strong>{activeSession ? `${activeSession.title} (${activeSession.time.replace(" - ", " – ")})` : "Tidak ada sesi aktif"}</strong><p>{activeSession?.room ?? "Jadwal belum tersedia"}</p></section>
      <section className="admin-test-summary-card"><div className="admin-test-summary-label">KEHADIRAN LIVE</div><strong className="admin-test-attendance">{liveAttendance} Peserta</strong><p>{liveAttendance.startsWith("114/") ? "6 Belum Log In sistem USM" : "Data kehadiran contoh"}</p></section>
      <section className="admin-test-summary-card admin-test-token-card"><div className="admin-test-summary-label">KATA SANDI SESI (TOKEN)</div><div className="admin-test-token-row"><strong>{token}</strong><button type="button" onClick={copyToken}>SALIN</button><button type="button" className="admin-test-refresh-token" onClick={refreshToken} aria-label="Perbarui token">↻</button></div><p>Diperbarui berkala per 15 menit</p></section>
    </div>

    <div className="admin-test-content-grid">
      <section className="admin-test-sessions" aria-labelledby="admin-test-sessions-title"><div className="admin-test-section-heading"><h2 id="admin-test-sessions-title">Alokasi Sesi &amp; Ruangan USM</h2><button type="button" className="admin-bank-button secondary" onClick={openSessionModal}><span aria-hidden="true">＋</span> Tambah Sesi Baru</button></div><div className="admin-test-session-list">
        {sessions.map((session) => <article className="admin-test-session-card" key={session.id}><div className="admin-test-session-copy"><h3>{session.title}</h3><p>{session.time} | {session.room}</p></div><div className="admin-test-session-attendance"><AdminIcon name="people" /><span>{session.attendance} Siswa</span></div><span className={`admin-test-session-status ${session.status === "Selesai" ? "done" : session.status === "Ujian Berlangsung" ? "live" : "upcoming"}`}>{session.status}</span></article>)}
      </div></section>

      <section className="admin-test-results" aria-labelledby="admin-test-results-title"><div className="admin-test-results-heading"><h2 id="admin-test-results-title">Hasil Nilai Ujian (TKA)</h2><button type="button" className="admin-bank-button secondary" onClick={exportScores}><AdminIcon name="file" /> Ekspor</button></div><label className="admin-dashboard-search admin-test-results-search"><AdminIcon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari hasil nilai nama siswa…" aria-label="Cari hasil nilai siswa" /></label><div className="admin-test-score-list">{filteredScores.map((item) => <article className="admin-test-score-row" key={item.registration}><div><strong>{item.name}</strong><small>{item.registration} • {item.session} ({item.room})</small></div><b>{item.score}</b><button type="button" aria-label={`Lihat nilai ${item.name}`} onClick={() => setScoreDetail(item)}><AdminIcon name="view" /></button></article>)}{!filteredScores.length && <p className="admin-test-no-scores">Tidak ada hasil yang cocok.</p>}</div></section>
    </div>
    {notice && <p className="admin-test-notice" role="status">{notice}</p>}

    {modalOpen && <div className="admin-bank-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}><section className="admin-bank-modal admin-test-modal" role="dialog" aria-modal="true" aria-labelledby="admin-test-modal-title"><div className="admin-bank-modal-heading"><div><span>JADWAL USM</span><h2 id="admin-test-modal-title">Tambah Sesi Tes</h2></div><button type="button" aria-label="Tutup" onClick={() => setModalOpen(false)}>×</button></div><form onSubmit={addSession}><label>Nama sesi<input ref={firstFieldRef} required value={sessionTitle} onChange={(event) => setSessionTitle(event.target.value)} placeholder="Contoh: Sesi 4 (Sore)" /></label><label>Waktu ujian<input required value={sessionTime} onChange={(event) => setSessionTime(event.target.value)} placeholder="15:00 - 16:45" /></label><label>Ruang ujian<input required value={sessionRoom} onChange={(event) => setSessionRoom(event.target.value)} placeholder="Lab Komputer B" /></label><label>Kapasitas peserta<input required type="number" min="1" max="500" value={sessionCapacity} onChange={(event) => setSessionCapacity(event.target.value)} /></label><p className="admin-bank-modal-hint">Sesi hanya ditambahkan ke pratinjau ini, bukan ke jadwal ujian sungguhan.</p><div className="admin-bank-modal-actions"><button type="button" className="admin-bank-button secondary" onClick={() => setModalOpen(false)}>Batal</button><button type="submit" className="admin-bank-button primary">Simpan Sesi</button></div></form></section></div>}
    {scoreDetail && <div className="admin-bank-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setScoreDetail(null); }}><section className="admin-test-score-modal" role="dialog" aria-modal="true" aria-labelledby="admin-test-score-modal-title"><button type="button" className="admin-test-score-modal-close" aria-label="Tutup" onClick={() => setScoreDetail(null)}>×</button><span>RINCIAN NILAI SIMULASI</span><h2 id="admin-test-score-modal-title">{scoreDetail.name}</h2><p>{scoreDetail.registration} · {scoreDetail.session} ({scoreDetail.room})</p><div className="admin-test-score-big">{scoreDetail.score}<small>/100</small></div><p className="admin-test-score-footnote">Nilai ini hanya data contoh pada pratinjau desain.</p></section></div>}
  </>;
}
