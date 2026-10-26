import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/site-chrome";
import "./demo.css";

const demoRoles = [
  {
    title: "Calon siswa",
    description: "Daftarkan akun siswa baru, lengkapi formulir, dan pantau tahapan SPMB dari data tersimpan.",
    href: "/portal/login/siswa?mode=register",
    action: "Daftar sebagai siswa demo",
  },
  {
    title: "Admin SPMB",
    description: "Verifikasi berkas dan pembayaran, kelola TKA, seleksi, dan pengumuman.",
    href: "/portal/login/admin",
    action: "Masuk sebagai admin",
  },
  {
    title: "Kepala sekolah",
    description: "Pantau dashboard, pendaftar, hasil seleksi, statistik, dan laporan.",
    href: "/portal/login/kepala-sekolah",
    action: "Masuk sebagai kepala sekolah",
  },
];

export const metadata = {
  title: "Demo SPMB | SMK Citra Negara",
  description: "Coba alur SPMB dengan akun dan data demo melalui portal resmi.",
};

export default function DemoPage() {
  return (
    <main className="portal-page">
      <SiteHeader />
      <section className="portal-welcome">
        <span className="kicker">DEMO SPMB · SMK CITRA NEGARA · 2026/2027</span>
        <h1>Jelajahi alur penerimaan siswa baru</h1>
        <p>Demo memakai portal, autentikasi, dan data bersama yang sama dengan aplikasi. Perubahan pada pendaftaran siswa dapat dilihat oleh admin dan kepala sekolah sesuai hak aksesnya.</p>
        <div className="portal-grid demo-role-grid">
          {demoRoles.map((role) => (
            <article className="portal-card" key={role.title}>
              <div className="portal-card-top"><span className="portal-badge">AKSES TERAUTENTIKASI</span></div>
              <h2>{role.title}</h2>
              <p>{role.description}</p>
              <Link className="button portal-button" href={role.href}>{role.action} <span>↗</span></Link>
            </article>
          ))}
        </div>
        <aside className="demo-access-note" role="note">
          <strong>Demo aktif dengan data sintetis bersama.</strong>
          <p>Gunakan hanya data fiktif dan akun demo. Jangan masukkan data pribadi calon siswa sungguhan. Kata sandi akun bersama dibagikan terpisah oleh pengelola.</p>
          <h2>Akses demo</h2>
          <ul>
            <li>Admin: <code>admin.demo@spmb.test</code></li>
            <li>Kepala sekolah: <code>kepala-sekolah.demo@spmb.test</code></li>
            <li>Siswa baru: pilih “Daftar sebagai siswa demo” untuk membuat akun baru. Akun tersebut tersimpan di database demo bersama.</li>
          </ul>
        </aside>
      </section>
      <SiteFooter />
    </main>
  );
}
