"use client";

import { useState } from "react";
import type { FormEvent } from "react";

function PasswordIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {hidden && <path d="m4 4 16 16" />}
    </svg>
  );
}

export default function AdminLoginForm() {
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

  return (
    <form className="admin-login-form" onSubmit={handleSubmit}>
      <label className="admin-login-field">
        <span>Alamat Email Kerja</span>
        <input name="email" type="email" autoComplete="username" placeholder="Masukkan email kerja" required />
      </label>

      <label className="admin-login-field">
        <span>Password</span>
        <span className="admin-login-password-wrap">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Masukkan password"
            required
          />
          <button
            type="button"
            className="admin-login-password-toggle"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
          >
            <PasswordIcon hidden={showPassword} />
          </button>
        </span>
      </label>

      <label className="admin-login-field">
        <span>Peran Pengguna (Role)</span>
        <span className="admin-login-role-wrap">
          <span className="admin-login-role-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.7"/><path d="M5 20a7 7 0 0 1 14 0M12 14v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
          </span>
          <select name="role" defaultValue="panitia">
            <option value="panitia">Panitia Admisi &amp; Verifikator</option>
          </select>
        </span>
      </label>

      <button className="button admin-login-submit" type="submit" disabled={pending}>{pending ? "Memeriksa..." : "Masuk ke Dashboard Admin"}</button>
      <p className="admin-login-feedback" role="status" aria-live="polite">{feedback}</p>
    </form>
  );
}
