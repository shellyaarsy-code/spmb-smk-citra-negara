"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import AdminSidebar from "./admin-sidebar";

type AdminTest = { id: string; code: string; name: string; status: string; questions: { id: string; questionText: string; difficulty: string; points: number | null; isActive: boolean; options: { optionText: string; isCorrect: boolean }[] }[] };
type AdminSchedule = { id: string; scheduledAt: string; location: string | null; capacity: number | null; tkaTest: { code: string; name: string; status: string }; studyProgram: { code: string; name: string } | null; _count: { attempts: number } };
type AdminResult = { id: string; totalScore: number | null; publishedAt: string | null; attempt: { status: string; submittedAt: string | null; schedule: { tkaTest: { name: string } } }; application: { registrationNumber: string | null; student: { profile: { fullName: string | null } | null } } };

export default function LiveTkaManagement({ section }: { section: "questions" | "schedules" }) {
  const [tests, setTests] = useState<AdminTest[]>([]);
  const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
  const [results, setResults] = useState<AdminResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [selectedTestId, setSelectedTestId] = useState("");
  const [question, setQuestion] = useState("");
  const [points, setPoints] = useState("1");
  const [difficulty, setDifficulty] = useState("MUDAH");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState("0");
  const [editingQuestionId, setEditingQuestionId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [testResponse, scheduleResponse, resultResponse] = await Promise.all([fetch("/api/admin/tka/tests", { cache: "no-store" }), fetch("/api/admin/tka/schedules", { cache: "no-store" }), fetch("/api/admin/tka/results", { cache: "no-store" })]);
      const testBody = await testResponse.json(); const scheduleBody = await scheduleResponse.json(); const resultBody = await resultResponse.json();
      if (!testResponse.ok) throw new Error(testBody.error || "Data tes belum dapat dimuat.");
      if (!scheduleResponse.ok) throw new Error(scheduleBody.error || "Jadwal belum dapat dimuat.");
      if (!resultResponse.ok) throw new Error(resultBody.error || "Hasil belum dapat dimuat.");
      setTests(Array.isArray(testBody) ? testBody : []); setSchedules(Array.isArray(scheduleBody) ? scheduleBody : []); setResults(Array.isArray(resultBody) ? resultBody : []);
      const selectableTests = testBody.filter((item: AdminTest) => item.status === (section === "questions" ? "DRAFT" : "PUBLISHED"));
      setSelectedTestId((current) => selectableTests.some((item: AdminTest) => item.id === current) ? current : selectableTests[0]?.id || ""); setNotice("");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Data TKA belum dapat dimuat."); }
    finally { setLoading(false); }
  }, [section]);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  async function submitJson(url: string, method: string, body: unknown): Promise<boolean> {
    setBusy(true); setNotice("");
    try {
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Perubahan belum dapat disimpan.");
      await load(); setNotice("Perubahan tersimpan."); return true;
    } catch (error) { setNotice(error instanceof Error ? error.message : "Perubahan belum dapat disimpan."); return false; }
    finally { setBusy(false); }
  }

  function createTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); void submitJson("/api/admin/tka/tests", "POST", { code, name }).then((saved) => { if (saved) { setCode(""); setName(""); } });
  }
  function saveQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selected = tests.find((item) => item.id === selectedTestId);
    if (!selected || selected.status !== "DRAFT") { setNotice("Soal hanya dapat ditambahkan ke tes berstatus draft."); return; }
    const url = `/api/admin/tka/tests/${selectedTestId}/questions${editingQuestionId ? `/${editingQuestionId}` : ""}`;
    void submitJson(url, editingQuestionId ? "PATCH" : "POST", { questionText: question, difficulty, points: Number(points), options: options.map((text, index) => ({ text, isCorrect: String(index) === correctIndex })).filter((item) => item.text.trim()) }).then((saved) => { if (saved) clearQuestionForm(); });
  }
  function clearQuestionForm() { setEditingQuestionId(""); setQuestion(""); setPoints("1"); setDifficulty("MUDAH"); setOptions(["", "", "", ""]); setCorrectIndex("0"); }
  function editQuestion(test: AdminTest, item: AdminTest["questions"][number]) {
    setSelectedTestId(test.id); setEditingQuestionId(item.id); setQuestion(item.questionText); setPoints(String(item.points ?? 0)); setDifficulty(item.difficulty);
    setOptions(item.options.map((option) => option.optionText)); setCorrectIndex(String(Math.max(0, item.options.findIndex((option) => option.isCorrect))));
  }
  function deactivateQuestion(testId: string, questionId: string) {
    if (!window.confirm("Nonaktifkan soal ini? Soal tidak akan ikut saat tes diterbitkan.")) return;
    void submitJson(`/api/admin/tka/tests/${testId}/questions/${questionId}`, "DELETE", null);
    if (editingQuestionId === questionId) clearQuestionForm();
  }
  function createSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitJson("/api/admin/tka/schedules", "POST", { testId: selectedTestId, scheduledAt: new Date(scheduledAt).toISOString(), location: location || null, capacity: capacity ? Number(capacity) : null });
  }

  const heading = section === "questions" ? "Bank Soal TKA" : "Jadwal dan Sesi TKA";
  return <main className="admin-dashboard-outer"><div className="admin-dashboard-app"><AdminSidebar active={section === "questions" ? "bankQuestions" : "testManagement"} demo={false} /><section className="admin-dashboard-main">
    <header className="admin-dashboard-header"><div><h1>{heading}</h1><p>Data disimpan melalui API admin dan ditampilkan dari basis data.</p></div></header>
    {notice && <p role="status" className="admin-dashboard-empty">{notice}</p>}
    {loading ? <p role="status">Memuat data TKA…</p> : <>
      <section className="admin-announcement-history"><h2>Tes</h2>
        {!tests.length && <p>Belum ada tes tersimpan.</p>}
        {tests.map((item) => <article key={item.id} className="admin-announcement-item"><strong>{item.code} · {item.name}</strong><span>Status: {item.status} · {item.questions.filter((question) => question.isActive).length} soal aktif</span>
          {item.status === "DRAFT" && <button disabled={busy} type="button" onClick={() => void submitJson(`/api/admin/tka/tests/${item.id}`, "PATCH", { status: "PUBLISHED" })}>Terbitkan tes</button>}
          {item.questions.map((q) => <div key={q.id}><p>{q.questionText} ({q.points ?? "tanpa poin"} poin) · {q.options.filter((o) => o.isCorrect).length} kunci benar{!q.isActive ? " · nonaktif" : ""}</p>{item.status === "DRAFT" && q.isActive && section === "questions" && <div><button type="button" disabled={busy} onClick={() => editQuestion(item, q)}>Edit soal</button><button type="button" disabled={busy} onClick={() => deactivateQuestion(item.id, q.id)}>Nonaktifkan</button></div>}</div>)}
        </article>)}
      </section>
      {section === "questions" ? <div className="admin-announcement-layout">
        <form className="admin-announcement-preview" onSubmit={createTest}><h2>Buat draft tes</h2><label>Kode tes<input required value={code} onChange={(event) => setCode(event.target.value)} /></label><label>Nama tes<input required value={name} onChange={(event) => setName(event.target.value)} /></label><button disabled={busy} type="submit">Simpan draft</button></form>
        <form className="admin-announcement-preview" onSubmit={saveQuestion}><h2>{editingQuestionId ? "Edit soal pilihan ganda" : "Tambah soal pilihan ganda"}</h2><label>Tes<select required value={selectedTestId} onChange={(event) => { setSelectedTestId(event.target.value); if (editingQuestionId) clearQuestionForm(); }}>{tests.filter((item) => item.status === "DRAFT").map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></label><label>Pertanyaan<textarea required maxLength={10000} value={question} onChange={(event) => setQuestion(event.target.value)} /></label><label>Tingkat kesulitan<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="MUDAH">Mudah</option><option value="SEDANG">Sedang</option><option value="SULIT">Sulit</option></select></label><label>Poin<input type="number" min="0" step="1" required value={points} onChange={(event) => setPoints(event.target.value)} /></label>{options.map((value, index) => <label key={index}>Opsi {index + 1}<input value={value} onChange={(event) => setOptions((old) => old.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /></label>)}<label>Kunci jawaban<select value={correctIndex} onChange={(event) => setCorrectIndex(event.target.value)}>{options.map((_, index) => <option value={index} key={index}>Opsi {index + 1}</option>)}</select></label><button disabled={busy || !tests.some((item) => item.id === selectedTestId && item.status === "DRAFT")} type="submit">{editingQuestionId ? "Simpan perubahan" : "Simpan soal"}</button>{editingQuestionId && <button type="button" disabled={busy} onClick={clearQuestionForm}>Batal edit</button>}</form>
      </div> : <div className="admin-announcement-layout"><form className="admin-announcement-preview" onSubmit={createSchedule}><h2>Buat jadwal</h2><label>Tes terbit<select required value={selectedTestId} onChange={(event) => setSelectedTestId(event.target.value)}>{tests.filter((item) => item.status === "PUBLISHED").map((item) => <option value={item.id} key={item.id}>{item.code} · {item.name}</option>)}</select></label><label>Waktu<input required type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} /></label><label>Lokasi<input value={location} onChange={(event) => setLocation(event.target.value)} /></label><label>Kapasitas (opsional)<input type="number" min="1" value={capacity} onChange={(event) => setCapacity(event.target.value)} /></label><button disabled={busy || !tests.some((item) => item.id === selectedTestId && item.status === "PUBLISHED")} type="submit">Simpan jadwal</button></form>
        <section className="admin-announcement-history"><h2>Jadwal tersimpan</h2>{!schedules.length && <p>Belum ada jadwal tes tersimpan.</p>}{schedules.map((item) => <article key={item.id} className="admin-announcement-item"><strong>{item.tkaTest.code} · {item.tkaTest.name}</strong><p>{new Date(item.scheduledAt).toLocaleString("id-ID")} · {item.location || "Lokasi belum ditentukan"}</p><span>{item._count.attempts} attempt · kapasitas {item.capacity ?? "tidak dibatasi"}</span></article>)}</section></div>}
      {section === "schedules" && <section className="admin-announcement-history"><h2>Hasil TKA dan publikasi siswa</h2>{!results.length && <p>Belum ada attempt yang dikirim.</p>}{results.map((item) => <article className="admin-announcement-item" key={item.id}><strong>{item.application.student.profile?.fullName || "Nama belum tersedia"} · {item.application.registrationNumber || "Tanpa nomor registrasi"}</strong><p>{item.attempt.schedule.tkaTest.name} · Nilai {item.totalScore ?? "belum dihitung"} · {item.attempt.status}</p>{item.publishedAt ? <span>Dipublikasikan {new Date(item.publishedAt).toLocaleString("id-ID")}</span> : <button type="button" disabled={busy || item.totalScore === null} onClick={() => void submitJson(`/api/admin/tka/results/${item.id}/publish`, "POST", {})}>Publikasikan nilai TKA</button>}</article>)}</section>}
    </>}
  </section></div></main>;
}
