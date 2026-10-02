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

export default function StudentRegistrationForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (password !== confirmation) {
      setFeedback("Konfirmasi kata sandi belum sama.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    setPending(true);
    setFeedback("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nisn: formData.get("nisn"),
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          whatsapp: formData.get("whatsapp"),
          password,
          passwordConfirmation: confirmation,
          consent: formData.has("consent"),
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setFeedback(result?.error || "Pendaftaran belum dapat diproses.");
        return;
      }

      form.reset();
      setPassword("");
      setConfirmation("");
      setFeedback(result?.message || "Jika pendaftaran dapat diproses, akun akan tersedia untuk masuk.");
    } catch {
      setFeedback("Pendaftaran belum dapat diproses.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="registration-form" onSubmit={handleSubmit}>
      <label className="registration-field">
        <span>Nomor Induk Siswa Nasional (NISN)</span>
        <input
          name="nisn"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Masukkan 10 digit NISN Anda"
          minLength={10}
          maxLength={10}
          pattern="[0-9]{10}"
          title="NISN harus terdiri dari 10 angka"
          required
        />
      </label>

      <label className="registration-field">
        <span>Nama Lengkap</span>
        <input name="fullName" type="text" autoComplete="name" placeholder="Masukkan nama lengkap pendaftar" required />
      </label>

      <label className="registration-field">
        <span>Alamat Email Aktif</span>
        <input name="email" type="email" autoComplete="email" placeholder="contoh@pendaftar.com" required />
      </label>

      <label className="registration-field">
        <span>Nomor WhatsApp</span>
        <input name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="Contoh: 081234567890" required />
      </label>

      <div className="registration-field">
        <label htmlFor="registration-password">Kata Sandi (Password)</label>
        <span className="registration-password-wrap">
          <input
            id="registration-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button type="button" className="password-toggle" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>
            <PasswordIcon hidden={showPassword} />
          </button>
        </span>
      </div>

      <div className="registration-field">
        <label htmlFor="registration-password-confirmation">Konfirmasi Kata Sandi</label>
        <span className="registration-password-wrap">
          <input
            id="registration-password-confirmation"
            name="passwordConfirmation"
            type={showConfirmation ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Ulangi kata sandi Anda"
            minLength={8}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            required
          />
          <button type="button" className="password-toggle" onClick={() => setShowConfirmation((shown) => !shown)} aria-label={showConfirmation ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}>
            <PasswordIcon hidden={showConfirmation} />
          </button>
        </span>
      </div>

      <p className="privacy-note" role="note">Data identitas dan kontak digunakan untuk membuat akun calon siswa dan disimpan pada sistem pendaftaran.</p>

      <label className="registration-consent">
        <input type="checkbox" name="consent" required />
        <span>Saya menyatakan bahwa seluruh data yang saya masukkan adalah benar dan bersedia mengikuti segala tahapan serta aturan seleksi resmi SMK Citra Negara.</span>
      </label>

      <button className="button registration-submit" type="submit" disabled={pending}>{pending ? "Mendaftarkan..." : "Daftar Akun Calon Siswa"}</button>
      <p className="registration-feedback" aria-live="polite">{feedback}</p>
    </form>
  );
}
