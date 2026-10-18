"use client";

import { useEffect, useState } from "react";

type Schedule = {
  id: string; scheduledAt: string; location: string | null;
  attempts: { id: string; startedAt: string | null; answers: { questionId: string; selectedOptionId: string | null }[] }[];
  tkaTest: { name: string; description: string | null; questions: { id: string; questionText: string; difficulty: string; options: { id: string; optionText: string }[] }[] };
};

export default function LiveTkaSession() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attempt, setAttempt] = useState<{ id: string; startedAt: string; durationMinutes: number } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [serverClockOffset, setServerClockOffset] = useState(0);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [message, setMessage] = useState("Memuat jadwal TKA…");
  const [busy, setBusy] = useState(false);
  const attemptId = attempt?.id;
  const attemptStartedAt = attempt?.startedAt;
  const attemptDurationMinutes = attempt?.durationMinutes;

  async function loadSchedules() {
    try {
      const response = await fetch("/api/student/tka", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Jadwal belum dapat dimuat.");
      setSchedules(Array.isArray(data) ? data : []);
      setMessage(data.length ? "Pilih jadwal yang tersedia untuk memulai." : "Belum ada sesi TKA yang dibuka untuk akun ini.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Jadwal TKA belum dapat dimuat."); }
  }
  useEffect(() => { const timer = window.setTimeout(() => { void loadSchedules(); }, 0); return () => window.clearTimeout(timer); }, []);
  useEffect(() => {
    if (!attemptStartedAt || !attemptDurationMinutes) return;
    const update = () => setRemainingSeconds(Math.max(0, Math.ceil((new Date(attemptStartedAt).getTime() + attemptDurationMinutes * 60_000 - (Date.now() + serverClockOffset)) / 1000)));
    const initialUpdate = window.setTimeout(update, 0);
    const timer = window.setInterval(update, 1000);
    return () => { window.clearTimeout(initialUpdate); window.clearInterval(timer); };
  }, [attemptStartedAt, attemptDurationMinutes, serverClockOffset]);

  useEffect(() => {
    if (!attemptId) return;
    let cancelled = false;
    let timer = 0;
    const refreshDuration = async () => {
      try {
        const response = await fetch(`/api/student/tka/attempts/${encodeURIComponent(attemptId)}`, { cache: "no-store" });
        if (response.ok) {
          const current = await response.json();
          if (!cancelled && Number.isSafeInteger(current.durationMinutes) && current.durationMinutes >= 1 && current.durationMinutes <= 1440) {
            const serverNow = new Date(current.serverNow).getTime();
            if (Number.isFinite(serverNow)) setServerClockOffset(serverNow - Date.now());
            setAttempt((previous) => previous?.id === attemptId ? { ...previous, startedAt: current.startedAt, durationMinutes: current.durationMinutes } : previous);
          }
        }
      } catch { /* Keep the last server-confirmed timer if a refresh is temporarily unavailable. */ }
      if (!cancelled) timer = window.setTimeout(() => { void refreshDuration(); }, 5000);
    };
    timer = window.setTimeout(() => { void refreshDuration(); }, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [attemptId]);

  async function start(schedule: Schedule) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/student/tka", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scheduleId: schedule.id }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sesi tidak dapat dimulai.");
      setRemainingSeconds(data.durationMinutes * 60);
      setSelectedSchedule(schedule); setAttempt(data); setAnswers(Object.fromEntries((schedule.attempts[0]?.answers ?? []).filter((answer) => answer.selectedOptionId).map((answer) => [answer.questionId, answer.selectedOptionId!]))); setMessage("Sesi dimulai. Jawaban akan tersimpan saat dipilih.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Sesi tidak dapat dimulai."); }
    finally { setBusy(false); }
  }

  async function saveAnswer(questionId: string, selectedOptionId: string) {
    if (!attempt) return;
    setAnswers((old) => ({ ...old, [questionId]: selectedOptionId }));
    try {
      const response = await fetch(`/api/student/tka/attempts/${attempt.id}/answers`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId, selectedOptionId }) });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || "Jawaban belum tersimpan."); }
      setMessage("Jawaban tersimpan.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Jawaban belum tersimpan."); }
  }

  async function submit() {
    if (!attempt || busy) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/student/tka/attempts/${attempt.id}/submit`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sesi belum dapat dikirim.");
      setAttempt(null); setSelectedSchedule(null); setMessage(data.timedOut ? "Waktu ujian habis. Jawaban yang telah tersimpan dikirim untuk penilaian." : "Jawaban terkirim. Nilai tersimpan untuk panitia; keputusan kelulusan belum ditetapkan.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Sesi belum dapat dikirim."); }
    finally { setBusy(false); }
  }

  return <section className="tka-locked-card" aria-label="Jadwal dan sesi TKA">
    <h2>{attempt ? selectedSchedule?.tkaTest.name : "Jadwal TKA"}</h2>
    <p role="status">{message}</p>
    {!attempt && schedules.map((schedule) => <article key={schedule.id} className="student-announcement-card">
      <h3>{schedule.tkaTest.name}</h3><p>{schedule.tkaTest.description || "Sesi TKA terjadwal."}</p>
      <p>{new Date(schedule.scheduledAt).toLocaleString("id-ID")} {schedule.location ? `· ${schedule.location}` : ""}</p>
      <button type="button" disabled={busy} onClick={() => void start(schedule)}>{schedule.attempts.length ? "Lanjutkan sesi" : "Mulai sesi"}</button>
    </article>)}
    {attempt && selectedSchedule && <>
      <p role="timer" aria-live="off">Sisa waktu: {String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:{String(remainingSeconds % 60).padStart(2, "0")}</p>
      {selectedSchedule.tkaTest.questions.map((question, index) => <fieldset key={question.id} className="student-announcement-card">
        <legend>{index + 1}. {question.questionText}</legend>
        {question.options.map((option) => <label key={option.id} style={{ display: "block", marginBlock: ".5rem" }}>
          <input type="radio" name={question.id} checked={answers[question.id] === option.id} onChange={() => void saveAnswer(question.id, option.id)} /> {option.optionText}
        </label>)}
      </fieldset>)}
      <button type="button" disabled={busy} onClick={() => void submit()}>Kirim jawaban</button>
    </>}
  </section>;
}
