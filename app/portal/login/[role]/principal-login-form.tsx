"use client";

import { useState, type FormEvent } from "react";

function VisibilityIcon({ visible }: { visible: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" />{visible && <path d="m4 4 16 16" />}</svg>;
}

export default function PrincipalLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    setFeedback("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setFeedback(result?.error || "Email atau kata sandi tidak valid.");
        return;
      }

      window.location.assign(typeof result?.redirectTo === "string" ? result.redirectTo : "/portal");
    } catch {
      setFeedback("Layanan masuk belum tersedia.");
    } finally {
      setPending(false);
    }
  }

  return <>
    <form className="principal-login-form" onSubmit={submit}>
      <label className="principal-login-field"><span>Email Kepala Sekolah</span><span className="principal-login-input-wrap"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg><input name="email" type="email" autoComplete="username" placeholder="Masukkan email terdaftar" required /></span></label>
      <label className="principal-login-field"><span>Kata Sandi Utama (Password)</span><span className="principal-login-input-wrap"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /></svg><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Masukkan kata sandi" required /><button type="button" className="principal-login-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}><VisibilityIcon visible={showPassword} /></button></span></label>
      <div className="principal-login-options"><label className="principal-login-remember"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>Ingat Sesi Saya</span></label><button type="button" className="principal-login-help-link" onClick={() => setHelpOpen((open) => !open)}>Butuh Bantuan IT?</button></div>
      {helpOpen && <div className="principal-login-help" role="status"><strong>Bantuan Portal Eksekutif</strong><span>Hubungi Tim IT PPDB melalui Ext. 102 pada jam operasional sekolah.</span></div>}
      <button className="principal-login-submit" type="submit" disabled={pending}>{pending ? "Memeriksa..." : "Masuk Portal Monitoring"}</button>
      <p className="principal-login-feedback" role="status" aria-live="polite">{feedback}</p>
    </form>
  </>;
}
