"use client";

import { useState } from "react";
import type { FormEvent } from "react";

function PasswordIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {hidden && <path d="m4 4 16 16" />}
    </svg>
  );
}

export default function StudentLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    setFeedback("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: formData.get("identifier"), password: formData.get("password") }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setFeedback(result?.error || "Email/NISN atau kata sandi tidak valid.");
        return;
      }

      window.location.assign(typeof result?.redirectTo === "string" ? result.redirectTo : "/portal");
    } catch {
      setFeedback("Layanan masuk belum tersedia.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="registration-form student-login-form" onSubmit={handleSubmit}>
      <label className="registration-field">
        <span>NISN atau Email</span>
        <input name="identifier" type="text" autoComplete="username" placeholder="Masukkan NISN atau email aktif" required />
      </label>

      <div className="registration-field">
        <label htmlFor="student-login-password">Kata Sandi</label>
        <span className="registration-password-wrap">
          <input
            id="student-login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Masukkan kata sandi"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            <PasswordIcon hidden={showPassword} />
          </button>
        </span>
      </div>

      <p className="student-login-help">Lupa kata sandi? Hubungi admin SPMB untuk bantuan.</p>
      <button className="button registration-submit" type="submit" disabled={pending}>{pending ? "Memeriksa..." : "Masuk Portal Calon Siswa"}</button>
      <p className="registration-feedback" aria-live="polite">{feedback}</p>
    </form>
  );
}
