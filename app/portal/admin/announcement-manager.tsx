"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AdminIcon } from "./admin-sidebar";

type ReleaseStatus = "Published" | "Draft" | "Archived";
type Announcement = { id: string; date: string; title: string; target: string; batch: string; program: string; audience: string; body: string; status: ReleaseStatus };
const seedAnnouncements: Announcement[] = [
  { id: "ANN-26004", date: "Hari ini, 09:00 WIB", title: "Jadwal Pelaksanaan USM Gelombang 1", target: "Gelombang 1", batch: "Gelombang 1 (Early Bird)", program: "Semua Pilihan Jurusan", audience: "Semua Calon Siswa Baru SMK Citra Negara", body: "Diberitahukan bahwa pelaksanaan Ujian Saringan Masuk (USM) Gelombang 1 akan diadakan secara daring pada hari Sabtu, 10 Maret 2026. Ujian ini menguji kompetensi akademis umum dasar Anda termasuk Matematika, Bahasa Indonesia, Bahasa Inggris, dan Logika Umum.\n\nHarap diperhatikan beberapa instruksi wajib berikut sebelum pelaksanaan:\n1. Segera lakukan finalisasi berkas dan pastikan foto pendaftar berlatar belakang merah terverifikasi.\n2. Token ujian akan dibagikan langsung di halaman Dashboard pendaftaran Anda 15 menit sebelum sesi dimulai.\n3. Persiapkan perangkat komputer/laptop dengan koneksi internet yang stabil selama durasi ujian.", status: "Published" },
  { id: "ANN-26003", date: "Kemarin, 14:00 WIB", title: "Hasil Akhir Kelulusan Calon Siswa Terpilih", target: "Semua Gelombang", batch: "Semua Gelombang", program: "Semua Pilihan Jurusan", audience: "Seluruh Pendaftar", body: "Informasi hasil akhir seleksi calon siswa akan diumumkan melalui Portal Siswa. Silakan masuk kembali ke akun untuk memeriksa status dan petunjuk selanjutnya.", status: "Draft" },
  { id: "ANN-26002", date: "24 Jan 2026", title: "Tata Cara Pembayaran Registrasi Gedung", target: "Siswa Lulus", batch: "Gelombang 1", program: "Semua Pilihan Jurusan", audience: "Calon siswa yang dinyatakan lulus", body: "Informasi tata cara pembayaran dan daftar ulang akan disampaikan melalui kanal resmi SPMB SMK Citra Negara. Periksa rincian dan batas waktunya pada portal.", status: "Published" },
  { id: "ANN-26001", date: "15 Jan 2026", title: "Batas Akhir Upload Berkas Kelengkapan", target: "Semua Gelombang", batch: "Semua Gelombang", program: "Semua Pilihan Jurusan", audience: "Seluruh Pendaftar", body: "Pastikan seluruh berkas pendaftaran telah diunggah dengan jelas dan sesuai ketentuan. Berkas yang kurang lengkap dapat diminta untuk diperbaiki.", status: "Archived" },
];
const emptyAnnouncement = { title: "", batch: "Gelombang 1", program: "Semua Pilihan Jurusan", audience: "Semua Calon Siswa Baru SMK Citra Negara", body: "" };

function StatusBadge({ status }: { status: ReleaseStatus }) { return <span className={`admin-announcement-status ${status.toLowerCase()}`}>{status}</span>; }

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState(seedAnnouncements);
  const [selectedId, setSelectedId] = useState(seedAnnouncements[0].id);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(emptyAnnouncement);
  const selected = useMemo(() => announcements.find((announcement) => announcement.id === selectedId), [announcements, selectedId]);

  function openCreate() { setForm(emptyAnnouncement); setModal("create"); setNotice(""); }
  function openEdit() {
    if (!selected) return;
    setForm({ title: selected.title, batch: selected.batch, program: selected.program, audience: selected.audience, body: selected.body });
    setModal("edit"); setNotice("");
  }
  function saveAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (modal === "edit" && selected) {
      setAnnouncements((items) => items.map((item) => item.id === selected.id ? { ...item, ...form } : item));
      setNotice("Konten pengumuman diperbarui di pratinjau ini saja.");
    } else {
      const id = `ANN-26${String(announcements.length + 1).padStart(3, "0")}`;
      const fresh: Announcement = { ...form, id, date: "Baru saja", target: form.batch, status: "Draft" };
      setAnnouncements((items) => [fresh, ...items]);
      setSelectedId(id);
      setNotice("Pengumuman baru disimpan sebagai draft di pratinjau ini saja.");
    }
    setModal(null);
  }
  function publishAnnouncement() {
    if (!selected) return;
    setAnnouncements((items) => items.map((item) => item.id === selected.id ? { ...item, status: "Published" } : item));
    setPublishOpen(false);
    setNotice(`Pengumuman ${selected.id} ditandai Published hanya pada pratinjau. Notifikasi tidak dikirim ke pendaftar sungguhan.`);
  }

  return <>
    <header className="admin-dashboard-header admin-bank-header"><div className="admin-dashboard-heading"><h1>Kelola Pengumuman Broadcaster</h1><p>Publikasikan pengumuman penting, instruksi jadwal seleksi, dan status kelulusan di portal siswa</p></div><div className="admin-dashboard-header-actions"><button type="button" className="admin-bank-bell" aria-label="Notifikasi"><AdminIcon name="bell" /></button><div className="admin-dashboard-account"><span>AD</span><div><strong>Administrator</strong><small>Panitia PPDB 2026</small></div></div></div></header>
    <div className="admin-announcement-layout">
      <section className="admin-announcement-history" aria-labelledby="admin-announcement-history-title"><div className="admin-announcement-history-heading"><h2 id="admin-announcement-history-title">Daftar Riwayat Rilis</h2><button type="button" className="admin-bank-button primary" onClick={openCreate}><span aria-hidden="true">＋</span> Tulis Pengumuman</button></div><div className="admin-announcement-list">{announcements.map((announcement) => <button type="button" key={announcement.id} className={`admin-announcement-item ${selectedId === announcement.id ? "selected" : ""}`} onClick={() => { setSelectedId(announcement.id); setNotice(""); }} aria-pressed={selectedId === announcement.id}><div className="admin-announcement-item-meta"><span>{announcement.date}</span><StatusBadge status={announcement.status} /></div><strong>{announcement.title}</strong><small><AdminIcon name="people" /> Target: {announcement.target}</small></button>)}</div></section>
      {selected ? <section className="admin-announcement-preview" aria-labelledby="admin-announcement-preview-title"><div className="admin-announcement-preview-top"><div><h2 id="admin-announcement-preview-title">Preview Detail Pengumuman</h2><p>ID RILIS: {selected.id}</p></div><div className="admin-announcement-preview-actions"><button type="button" className="admin-bank-button secondary" onClick={openEdit}><AdminIcon name="settings" /> Edit Konten</button><button type="button" className="admin-bank-button primary" onClick={() => setPublishOpen(true)}><AdminIcon name="bell" /> Publish Sekarang</button></div></div><div className="admin-announcement-target"><b>SISTEM PENARGETAN PUBLIKASI</b><div><p><span>Gelombang Sasaran</span><strong>{selected.batch}</strong></p><p><span>Program Keahlian</span><strong>{selected.program}</strong></p></div></div><article className="admin-announcement-article"><h3>{selected.title}</h3><p className="admin-announcement-salutation">Yth. {selected.audience},</p>{selected.body.split("\n").map((paragraph, index) => paragraph ? <p key={index}>{paragraph}</p> : <div key={index} className="admin-announcement-paragraph-space" />)}</article><div className="admin-announcement-broadcast-warning"><AdminIcon name="bell" /><div><strong>Konfirmasi Pengiriman Broadcast</strong><p>Tindakan ini akan memicu notifikasi pop-up penting di dashboard portal siswa untuk sekitar 1,280+ calon siswa terdaftar.</p></div></div></section> : <section className="admin-announcement-preview admin-announcement-empty"><h2>Pilih pengumuman</h2><p>Pilih salah satu pengumuman untuk melihat detailnya.</p></section>}
    </div>
    {notice && <p className="admin-announcement-notice" role="status">{notice}</p>}
    {modal && <div className="admin-bank-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}><section className="admin-bank-modal admin-announcement-modal" role="dialog" aria-modal="true" aria-labelledby="admin-announcement-modal-title"><div className="admin-bank-modal-heading"><div><span>{modal === "edit" ? "PENGATURAN KONTEN" : "BROADCAST PORTAL SISWA"}</span><h2 id="admin-announcement-modal-title">{modal === "edit" ? "Edit Pengumuman" : "Tulis Pengumuman"}</h2></div><button type="button" aria-label="Tutup" onClick={() => setModal(null)}>×</button></div><form onSubmit={saveAnnouncement}><label>Judul pengumuman<input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Masukkan judul yang jelas" /></label><div className="admin-announcement-form-grid"><label>Gelombang sasaran<select value={form.batch} onChange={(event) => setForm((current) => ({ ...current, batch: event.target.value }))}><option>Gelombang 1 (Early Bird)</option><option>Gelombang 1</option><option>Gelombang 2</option><option>Gelombang 3</option><option>Semua Gelombang</option></select></label><label>Program keahlian<select value={form.program} onChange={(event) => setForm((current) => ({ ...current, program: event.target.value }))}><option>Semua Pilihan Jurusan</option><option>PPLG</option><option>TJKT</option><option>DKV</option><option>MPLB</option><option>BDR</option><option>PHT</option></select></label></div><label>Ditujukan kepada<input required value={form.audience} onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value }))} /></label><label>Isi pengumuman<textarea required rows={9} value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} placeholder="Tulis informasi yang perlu diketahui calon siswa…" /></label><p className="admin-bank-modal-hint">{modal === "edit" ? "Perubahan konten hanya disimpan dalam simulasi ini." : "Pengumuman baru akan dibuat sebagai draft dan belum dikirim."}</p><div className="admin-bank-modal-actions"><button type="button" className="admin-bank-button secondary" onClick={() => setModal(null)}>Batal</button><button type="submit" className="admin-bank-button primary">{modal === "edit" ? "Simpan Konten" : "Simpan sebagai Draft"}</button></div></form></section></div>}
    {publishOpen && selected && <div className="admin-bank-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPublishOpen(false); }}><section className="admin-bank-modal admin-announcement-publish-modal" role="dialog" aria-modal="true" aria-labelledby="admin-announcement-publish-title"><div className="admin-bank-modal-heading"><div><span>KONFIRMASI BROADCAST</span><h2 id="admin-announcement-publish-title">Publikasikan pengumuman?</h2></div><button type="button" aria-label="Tutup" onClick={() => setPublishOpen(false)}>×</button></div><p><strong>{selected.title}</strong> akan ditandai terbit untuk <strong>{selected.audience}</strong> ({selected.batch}, {selected.program}).</p><div className="admin-announcement-publish-simulation">Mode simulasi: tidak ada push notification yang dikirim ke portal siswa.</div><div className="admin-bank-modal-actions"><button type="button" className="admin-bank-button secondary" onClick={() => setPublishOpen(false)}>Batal</button><button type="button" className="admin-bank-button primary" onClick={publishAnnouncement}>Terbitkan Simulasi</button></div></section></div>}
  </>;
}
