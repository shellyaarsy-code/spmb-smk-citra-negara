"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { AdminIcon } from "./admin-sidebar";

type Subject = "Matematika" | "Bahasa Indonesia" | "Bahasa Inggris" | "Logika & IPA Terapan";
type Difficulty = "Mudah" | "Sedang" | "Sulit";
type Question = { id: string; subject: Subject; prompt: string; difficulty: Difficulty; successRate: number; answers: [string, string, string, string]; correct: number; discrimination: string; note: string };
const subjects: { name: Subject; short: string; count: number; prefix: string }[] = [
  { name: "Matematika", short: "Matematika", count: 45, prefix: "MTH" },
  { name: "Bahasa Indonesia", short: "Bahasa Indonesia", count: 30, prefix: "IND" },
  { name: "Bahasa Inggris", short: "Bahasa Inggris", count: 35, prefix: "ENG" },
  { name: "Logika & IPA Terapan", short: "Logika & IPA Terapan", count: 25, prefix: "LOG" },
];
const seedQuestions: Question[] = [
  { id: "MTH-01", subject: "Matematika", prompt: "Sebuah toko pakaian memberikan diskon bertingkat sebesar 20%, kemudian mendapatkan potongan tambahan lagi sebesar 10% dari harga setelah diskon pertama. Berapakah persentase diskon total yang sebenarnya didapatkan oleh pembeli?", difficulty: "Sedang", successRate: 78, answers: ["30%", "28% (Kunci Jawaban)", "25%", "18%"], correct: 1, discrimination: "0.48 (Sangat Baik)", note: "Distribusi Distraktor: Pilihan C cenderung dipilih oleh kelompok bawah (daya kecoh efektif)." },
  { id: "MTH-02", subject: "Matematika", prompt: "Jika x = 5 dan y = 3, serta z = x² − 2y, berapakah nilai z?", difficulty: "Mudah", successRate: 92, answers: ["13", "17", "19", "25"], correct: 0, discrimination: "0.41 (Baik)", note: "Pengecoh berfungsi baik untuk menguji ketelitian operasi hitung." },
  { id: "MTH-03", subject: "Matematika", prompt: "Sebuah kubus memiliki volume 512 cm³. Berapakah luas permukaan kubus tersebut?", difficulty: "Sulit", successRate: 42, answers: ["256 cm²", "384 cm²", "512 cm²", "768 cm²"], correct: 1, discrimination: "0.36 (Baik)", note: "Sebagian peserta masih tertukar antara luas bidang dan volume." },
  { id: "MTH-04", subject: "Matematika", prompt: "Panitia ujian membuat denah kursi dalam 6 baris. Setiap baris memiliki 4 kursi lebih banyak daripada baris sebelumnya. Jika baris pertama berisi 12 kursi, berapa jumlah seluruh kursi?", difficulty: "Sedang", successRate: 65, answers: ["112", "132", "162", "192"], correct: 2, discrimination: "0.39 (Baik)", note: "Butir menguji pemahaman pola barisan aritmetika." },
  { id: "MTH-05", subject: "Matematika", prompt: "Rata-rata tinggi badan 10 siswa adalah 150 cm. Setelah satu siswa bergabung, rata-ratanya menjadi 152 cm. Berapa tinggi siswa yang baru bergabung?", difficulty: "Sulit", successRate: 38, answers: ["162 cm", "170 cm", "172 cm", "176 cm"], correct: 2, discrimination: "0.44 (Sangat Baik)", note: "Tingkat kesulitan tinggi, tetapi pembeda antarkelompok tetap baik." },
  { id: "IND-01", subject: "Bahasa Indonesia", prompt: "Perhatikan kalimat berikut: 'Meskipun hujan turun deras, para peserta tetap hadir tepat waktu.' Hubungan makna antarklausa pada kalimat tersebut adalah…", difficulty: "Sedang", successRate: 81, answers: ["Sebab-akibat", "Pertentangan", "Penambahan", "Tujuan"], correct: 1, discrimination: "0.42 (Baik)", note: "Pilihan jawaban menguji pemahaman konjungsi antarkalimat." },
  { id: "IND-02", subject: "Bahasa Indonesia", prompt: "Gagasan utama sebuah paragraf paling tepat ditemukan dengan cara…", difficulty: "Mudah", successRate: 90, answers: ["Membaca judul saja", "Menemukan inti pembahasan paragraf", "Menghitung jumlah kalimat", "Mencari kata yang paling panjang"], correct: 1, discrimination: "0.35 (Baik)", note: "Butir pemahaman dasar dengan tingkat keberhasilan tinggi." },
  { id: "ENG-01", subject: "Bahasa Inggris", prompt: "Choose the correct sentence to complete the dialogue: 'I have lived in Depok ___ 2020.'", difficulty: "Mudah", successRate: 88, answers: ["for", "since", "during", "until"], correct: 1, discrimination: "0.38 (Baik)", note: "Mengukur penggunaan penanda waktu dalam present perfect." },
  { id: "ENG-02", subject: "Bahasa Inggris", prompt: "The word 'reliable' in the sentence 'A reliable internet connection is needed for the exam' is closest in meaning to…", difficulty: "Sedang", successRate: 72, answers: ["expensive", "dependable", "temporary", "wireless"], correct: 1, discrimination: "0.46 (Sangat Baik)", note: "Pengecoh mengacu pada kosakata yang umum dijumpai peserta." },
  { id: "LOG-01", subject: "Logika & IPA Terapan", prompt: "Semua peserta yang lulus verifikasi boleh mengikuti tes. Rina lulus verifikasi. Kesimpulan yang tepat adalah…", difficulty: "Sedang", successRate: 76, answers: ["Rina boleh mengikuti tes", "Rina menjadi panitia", "Semua peserta bernama Rina", "Rina belum mendaftar"], correct: 0, discrimination: "0.48 (Sangat Baik)", note: "Item menguji penarikan kesimpulan dari dua pernyataan." },
  { id: "LOG-02", subject: "Logika & IPA Terapan", prompt: "Sebuah lampu 12 watt menyala selama 5 jam. Energi listrik yang digunakan adalah…", difficulty: "Sulit", successRate: 42, answers: ["0.006 kWh", "0.06 kWh", "0.6 kWh", "6 kWh"], correct: 1, discrimination: "0.37 (Baik)", note: "Periksa pemahaman konversi satuan energi listrik." },
];
const emptyForm = { prompt: "", answers: ["", "", "", ""] as [string, string, string, string], correct: 0 as number, difficulty: "Sedang" as Difficulty };

function rateTone(rate: number) { return rate >= 75 ? "good" : rate >= 50 ? "mid" : "low"; }

export default function QuestionBank() {
  const [questions, setQuestions] = useState(seedQuestions);
  const [subject, setSubject] = useState<Subject>("Matematika");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("Semua Tingkat");
  const [questionType, setQuestionType] = useState("Pilihan Ganda (PG)");
  const [selectedId, setSelectedId] = useState("MTH-01");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [importedFile, setImportedFile] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => questions.filter((question) => question.subject === subject && (difficulty === "Semua Tingkat" || question.difficulty === difficulty) && (!search || `${question.id} ${question.prompt}`.toLowerCase().includes(search.toLowerCase()))), [questions, subject, difficulty, search]);
  const selected = filtered.find((question) => question.id === selectedId) ?? filtered[0];

  function openNewQuestion() { setForm(emptyForm); setModal("add"); setNotice(""); }
  function openEditQuestion() {
    if (!selected) return;
    setForm({ prompt: selected.prompt, answers: [...selected.answers], correct: selected.correct, difficulty: selected.difficulty });
    setModal("edit");
  }
  function saveQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.answers.some((answer) => !answer.trim())) return;
    if (modal === "edit" && selected) {
      setQuestions((items) => items.map((item) => item.id === selected.id ? { ...item, ...form } : item));
      setNotice("Perubahan soal disimpan pada pratinjau ini saja.");
    } else {
      const prefix = subjects.find((item) => item.name === subject)?.prefix ?? "MTH";
      const suffix = String(Math.max(0, ...questions.filter((item) => item.subject === subject).map((item) => Number(item.id.split("-")[1]))) + 1).padStart(2, "0");
      const id = `${prefix}-${suffix}`;
      setQuestions((items) => [{ id, subject, ...form, successRate: 0, discrimination: "Belum tersedia", note: "Soal baru belum memiliki data statistik peserta." }, ...items]);
      setSelectedId(id);
      setNotice("Soal baru ditambahkan pada pratinjau ini saja.");
    }
    setModal(null);
  }
  function deleteQuestion() {
    if (!selected) return;
    const removedId = selected.id;
    setQuestions((items) => items.filter((item) => item.id !== removedId));
    setDeleteConfirm(false);
    setNotice(`${removedId} dihapus dari pratinjau sesi ini saja.`);
    setSelectedId(filtered.find((item) => item.id !== removedId)?.id ?? "");
  }
  function handleImport(file?: File) {
    if (!file) return;
    setImportedFile(file.name);
    setNotice(`File ${file.name} dipilih. Impor hanya simulasi dan belum membaca data Excel.`);
  }

  return <>
    <header className="admin-dashboard-header admin-bank-header">
      <div className="admin-dashboard-heading"><h1>Bank Soal TKA</h1><p>Kelola butir soal evaluasi akademik untuk ujian saringan masuk (USM) SMK Citra Negara</p></div>
      <div className="admin-dashboard-header-actions"><button type="button" className="admin-bank-bell" aria-label="Notifikasi"><AdminIcon name="bell" /></button><div className="admin-dashboard-account"><span>AD</span><div><strong>Administrator</strong><small>Panitia PPDB 2026</small></div></div></div>
    </header>
    <div className="admin-bank-workspace">
      <section className="admin-bank-main-column" aria-label="Daftar butir soal">
        <div className="admin-bank-toolbar">
          <label className="admin-dashboard-search"><AdminIcon name="search" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari butir soal…" aria-label="Cari butir soal" /></label>
          <button type="button" className="admin-bank-button secondary" onClick={() => importRef.current?.click()}><AdminIcon name="file" /> Import Excel</button>
          <input ref={importRef} type="file" accept=".xlsx,.xls,.csv" className="admin-bank-file-input" onChange={(event) => handleImport(event.target.files?.[0])} aria-label="Pilih file Excel" />
          <button type="button" className="admin-bank-button primary" onClick={openNewQuestion}><span aria-hidden="true">＋</span> Tambah Soal Baru</button>
        </div>
        <div className="admin-bank-subject-tabs" role="tablist" aria-label="Mata pelajaran">
          {subjects.map((item) => <button type="button" key={item.name} role="tab" aria-selected={subject === item.name} className={subject === item.name ? "active" : ""} onClick={() => { setSubject(item.name); setSearch(""); setDifficulty("Semua Tingkat"); setDeleteConfirm(false); }}><span>{item.short}</span><b>({item.count})</b></button>)}
        </div>
        <div className="admin-bank-filters"><label><span>Kesulitan:</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option>Semua Tingkat</option><option>Mudah</option><option>Sedang</option><option>Sulit</option></select></label><label><span>Tipe Soal:</span><select value={questionType} onChange={(event) => setQuestionType(event.target.value)}><option>Pilihan Ganda (PG)</option></select></label></div>
        <div className="admin-bank-table-card">
          <div className="admin-bank-table-scroll"><table className="admin-bank-table"><thead><tr><th>ID Soal</th><th>Pertanyaan / Konten Soal</th><th>Kesulitan</th><th>Stats (S.R.)</th><th>Aksi</th></tr></thead><tbody>
            {filtered.map((question) => <tr key={question.id} className={selected?.id === question.id ? "selected" : ""} onClick={() => { setSelectedId(question.id); setDeleteConfirm(false); }}>
              <td><b className="admin-bank-question-id">{question.id}</b></td><td><span className="admin-bank-question-snippet">{question.prompt}</span></td><td>{question.difficulty}</td><td><span className={`admin-bank-rate ${rateTone(question.successRate)}`}>{question.successRate}%</span></td><td><div className="admin-bank-row-actions"><button type="button" aria-label={`Lihat ${question.id}`} title="Lihat soal" onClick={(event) => { event.stopPropagation(); setSelectedId(question.id); setDeleteConfirm(false); }}><AdminIcon name="view" /></button><button type="button" aria-label={`Edit ${question.id}`} title="Edit soal" onClick={(event) => { event.stopPropagation(); setSelectedId(question.id); setForm({ prompt: question.prompt, answers: [...question.answers], correct: question.correct, difficulty: question.difficulty }); setModal("edit"); }}><AdminIcon name="settings" /></button></div></td>
            </tr>)}
            {!filtered.length && <tr><td colSpan={5} className="admin-bank-empty-row">Tidak ada soal yang cocok dengan pencarian atau filter ini.</td></tr>}
          </tbody></table></div>
          <div className="admin-bank-table-footer"><span>Menampilkan {filtered.length ? `1–${filtered.length}` : "0"} dari {subjects.find((item) => item.name === subject)?.count ?? 0} soal</span><span>Halaman <b>1</b> dari 1</span></div>
        </div>
        {notice && <p className="admin-bank-notice" role="status">{notice}</p>}
        {importedFile && <p className="admin-bank-imported-file">File dipilih: {importedFile}</p>}
      </section>

      <aside className="admin-bank-preview" aria-labelledby="admin-bank-preview-title">
        {selected ? <>
          <div className="admin-bank-preview-heading"><h2 id="admin-bank-preview-title">Preview &amp; Analisis Item</h2><span>Aktif</span></div>
          <p className="admin-bank-preview-id">ID SOAL: {selected.id} ({selected.subject.toUpperCase()})</p>
          <p className="admin-bank-preview-question">{selected.prompt}</p>
          <h3>PILIHAN JAWABAN</h3>
          <ol className="admin-bank-answer-list">{selected.answers.map((answer, index) => <li key={`${selected.id}-${index}`} className={selected.correct === index ? "correct" : ""}><span>{String.fromCharCode(65 + index)}.</span><p>{answer.replace(" (Kunci Jawaban)", "")}</p>{selected.correct === index && <b aria-label="Kunci jawaban">✓</b>}</li>)}</ol>
          <section className="admin-bank-statistics"><h3>Statistik Daya Pembeda Soal</h3><div><p><span>Rasio Menjawab Benar</span><strong>{selected.successRate}{selected.successRate ? ".2%" : "%"}</strong></p><p><span>Poin Biserial (P-B)</span><strong>{selected.discrimination}</strong></p></div><small>{selected.note}</small></section>
          <div className="admin-bank-preview-actions"><button type="button" className="admin-bank-button secondary" onClick={openEditQuestion}><AdminIcon name="settings" /> Edit Butir Soal</button><button type="button" className="admin-bank-button danger" onClick={() => setDeleteConfirm(true)}>Hapus</button></div>
          {deleteConfirm && <div className="admin-bank-delete-confirm" role="alert"><p>Hapus soal {selected.id} dari pratinjau?</p><div><button type="button" onClick={() => setDeleteConfirm(false)}>Batal</button><button type="button" onClick={deleteQuestion}>Ya, hapus</button></div></div>}
        </> : <div className="admin-bank-no-selection"><AdminIcon name="book" /><h2>Pilih butir soal</h2><p>Pilih soal dari tabel untuk melihat pratinjau dan analisis item.</p></div>}
      </aside>
    </div>
    {modal && <div className="admin-bank-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}><section className="admin-bank-modal" role="dialog" aria-modal="true" aria-labelledby="admin-bank-modal-title"><div className="admin-bank-modal-heading"><div><span>{modal === "edit" ? "PERBARUI KONTEN" : "BUTIR SOAL BARU"}</span><h2 id="admin-bank-modal-title">{modal === "edit" ? `Edit Soal ${selected?.id ?? ""}` : `Tambah Soal ${subject}`}</h2></div><button type="button" aria-label="Tutup" onClick={() => setModal(null)}>×</button></div><form onSubmit={saveQuestion}><label>Pertanyaan<textarea required value={form.prompt} onChange={(event) => setForm((current) => ({ ...current, prompt: event.target.value }))} rows={4} /></label><label>Tingkat Kesulitan<select value={form.difficulty} onChange={(event) => setForm((current) => ({ ...current, difficulty: event.target.value as Difficulty }))}><option>Mudah</option><option>Sedang</option><option>Sulit</option></select></label><fieldset><legend>Pilihan jawaban · tandai kunci jawaban</legend>{form.answers.map((answer, index) => <div className="admin-bank-answer-editor" key={index}><label><input type="radio" name="correct-answer" checked={form.correct === index} onChange={() => setForm((current) => ({ ...current, correct: index }))} aria-label={`Tandai pilihan ${String.fromCharCode(65 + index)} sebagai kunci jawaban`} />{String.fromCharCode(65 + index)}.</label><input required value={answer} onChange={(event) => setForm((current) => ({ ...current, answers: current.answers.map((item, answerIndex) => answerIndex === index ? event.target.value : item) as [string, string, string, string] }))} aria-label={`Isi pilihan ${String.fromCharCode(65 + index)}`} /></div>)}</fieldset><p className="admin-bank-modal-hint">Aksi ini hanya mengubah data contoh selama pratinjau dibuka.</p><div className="admin-bank-modal-actions"><button type="button" className="admin-bank-button secondary" onClick={() => setModal(null)}>Batal</button><button type="submit" className="admin-bank-button primary">{modal === "edit" ? "Simpan Perubahan" : "Tambah ke Bank Soal"}</button></div></form></section></div>}
  </>;
}
