import Link from "next/link";
import { notFound } from "next/navigation";
import StudentRegistrationForm from "./registration-form";
import StudentLoginForm from "./student-login-form";
import AdminLoginForm from "./admin-login-form";
import PrincipalLoginForm from "./principal-login-form";
import BrandLogo from "../../../components/brand-logo";

const roleDetails: Record<string, { title: string; name: string; identifier: string }> = {
  siswa: { title: "Masuk Portal Calon Siswa", name: "Calon Siswa", identifier: "Email atau Nomor Pendaftaran" },
  admin: { title: "Masuk Portal Admin Sekolah", name: "Admin Sekolah", identifier: "Email Admin" },
  "kepala-sekolah": { title: "Masuk Portal Kepala Sekolah", name: "Kepala Sekolah", identifier: "Email Sekolah" },
};

export default async function PortalLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ role: string }>;
  searchParams: Promise<{ mode?: string; registered?: string }>;
}) {
  const [{ role }, { mode, registered }] = await Promise.all([params, searchParams]);
  const detail = roleDetails[role];
  if (!detail) notFound();

  if (role === "siswa" && mode === "register") {
    return (
      <main className="registration-page">
        <div className="registration-shell">
          <aside className="registration-aside">
            <Link className="registration-brand" href="/" aria-label="SMK Citra Negara, beranda">
              <BrandLogo width={36} /> SPMB SMK CITRA NEGARA
            </Link>
            <div className="registration-aside-copy">
              <h1>Ayo Bergabung Bersama Kami!</h1>
              <ul className="registration-benefits">
                <li><span aria-hidden="true">✓</span> Alur pendaftaran tertata agar proses seleksi mudah dipantau.</li>
                <li><span aria-hidden="true">✓</span> Data dan berkas pendaftaran tercatat rapi di satu portal.</li>
                <li><span aria-hidden="true">✓</span> Bantuan admin tersedia untuk membantu calon siswa.</li>
              </ul>
              <blockquote className="registration-quote">
                <p>“Pendaftaran SMK Citra Negara sangat mudah dan praktis. Informasi dari panitia juga jelas.”</p>
                <cite>— Aditya Pratama, Siswa PPLG Angkatan 2025</cite>
              </blockquote>
            </div>
          </aside>

          <section className="registration-form-panel" aria-labelledby="registration-title">
            <header className="registration-heading">
              <h2 id="registration-title">Registrasi Akun Calon Siswa</h2>
              <p>Sudah mempunyai akun? <Link href="/portal/login/siswa">Masuk di sini</Link></p>
            </header>
            <StudentRegistrationForm />
          </section>
        </div>
      </main>
    );
  }

  if (role === "siswa") {
    return (
      <main className="registration-page">
        <div className="registration-shell login-shell">
          <aside className="registration-aside login-aside">
            <Link className="registration-brand" href="/" aria-label="SMK Citra Negara, beranda">
              <BrandLogo width={36} /> SPMB SMK CITRA NEGARA
            </Link>
            <div className="registration-aside-copy">
              <h1>Selamat Datang Kembali!</h1>
              <ul className="registration-benefits">
                <li><span aria-hidden="true">✓</span> Masuk dengan akun calon siswa yang sudah terdaftar.</li>
                <li><span aria-hidden="true">✓</span> Lanjutkan proses dan pantau informasi pendaftaranmu.</li>
                <li><span aria-hidden="true">✓</span> Periksa pengumuman dan tahapan seleksi melalui portal.</li>
              </ul>
            </div>
          </aside>

          <section className="registration-form-panel login-form-panel" aria-labelledby="student-login-title">
            <header className="registration-heading">
              <h2 id="student-login-title">Masuk Portal Calon Siswa</h2>
              <p>Masuk menggunakan NISN atau email yang terdaftar.</p>
            </header>
            {registered === "1" && <p className="registration-feedback" role="status">Permintaan pendaftaran sudah diterima. Coba masuk dengan NISN atau email dan kata sandi yang digunakan. Jika tidak berhasil, hubungi admin SPMB.</p>}
            <StudentLoginForm />
            <p className="login-register-inline">Belum memiliki akun? <Link href="/portal/login/siswa?mode=register">Registrasi calon siswa baru</Link></p>
          </section>
        </div>
      </main>
    );
  }

  if (role === "admin") {
    return (
      <main className="admin-login-page">
        <div className="admin-login-shell">
          <aside className="admin-login-aside">
            <Link className="admin-login-brand" href="/" aria-label="SMK Citra Negara, beranda">
              <BrandLogo width={36} /> SPMB SMK CITRA NEGARA
            </Link>

            <div className="admin-login-aside-copy">
              <h1>Pusat Kendali Administrasi SPMB Citra Negara</h1>
              <p>Portal khusus panitia untuk mengelola verifikasi berkas, memantau proses seleksi, dan melihat informasi penerimaan siswa baru.</p>
            </div>

            <section className="admin-login-security" aria-label="Informasi akses staf">
              <span className="admin-login-security-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 3 4.5 6v5.5c0 4.5 3.2 7.7 7.5 9.5 4.3-1.8 7.5-5 7.5-9.5V6L12 3Z" stroke="currentColor" strokeWidth="1.8"/><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <div>
                <h2>Akses Khusus Staf Sekolah</h2>
                <p>Masuk menggunakan akun panitia yang telah terdaftar. Akses portal dibatasi berdasarkan role akun.</p>
              </div>
            </section>
          </aside>

          <section className="admin-login-panel" aria-labelledby="admin-login-title">
            <div className="admin-login-content">
              <header className="admin-login-heading">
                <h2 id="admin-login-title">Log In Panitia SPMB</h2>
                <p>Silakan masukkan email kerja dan password Anda untuk masuk.</p>
              </header>
              <AdminLoginForm />
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (role === "kepala-sekolah") {
    return (
      <main className="principal-login-page">
        <div className="principal-login-shell">
          <aside className="principal-login-aside">
            <Link className="principal-login-brand" href="/" aria-label="SPMB Citra Negara, kembali ke beranda"><BrandLogo width={30} /><b>PPDB CITRA NEGARA</b></Link>
            <div className="principal-login-quote"><h1>&ldquo;Pendidikan berkualitas melahirkan pemimpin masa depan berdaya saing global.&rdquo;</h1><p>Pantau seluruh perkembangan calon pendaftar, data administratif, dan hasil ujian masuk siswa secara real-time dari satu dashboard monitoring eksekutif.</p></div>
            <div className="principal-login-school"><strong>KEPALA SEKOLAH PORTAL</strong><span>SMK Citra Negara · Terakreditasi A Rujukan Nasional</span></div>
          </aside>
          <section className="principal-login-panel" aria-labelledby="principal-login-title">
            <div className="principal-login-form-wrap">
              <span className="principal-login-kicker"><span aria-hidden="true">◉</span> PORTAL EKSEKUTIF KEPALA SEKOLAH</span>
              <h2 id="principal-login-title">Selamat Datang Kembali</h2>
              <p className="principal-login-intro">Silakan masuk menggunakan email akun Kepala Sekolah.</p>
              <PrincipalLoginForm />
            </div>
          </section>
        </div>
      </main>
    );
  }

  notFound();
}
