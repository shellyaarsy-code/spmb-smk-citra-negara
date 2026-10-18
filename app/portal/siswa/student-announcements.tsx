"use client";

import { useEffect, useState } from "react";

type Announcement = { id: string; title: string; content: string; publishedAt: string | null };
export default function StudentAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/student/announcements", { cache: "no-store" }).then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Pengumuman gagal dimuat.");
      return data as Announcement[];
    }).then((data) => { if (active) setItems(data); }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Pengumuman gagal dimuat."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <div className="student-announcement-list" aria-live="polite">
    {loading ? <p role="status">Memuat pengumuman…</p> : error ? <p role="alert">{error}</p> : items.length ? items.map((item) => <article className="student-announcement" key={item.id}><h3>{item.title}</h3><time>{item.publishedAt ? new Date(item.publishedAt).toLocaleString("id-ID") : ""}</time>{item.content.split("\n").filter(Boolean).map((line, index) => <p key={index}>{line}</p>)}</article>) : <p>Belum ada pengumuman yang diterbitkan.</p>}
  </div>;
}
