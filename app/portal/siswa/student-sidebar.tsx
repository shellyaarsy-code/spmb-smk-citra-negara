import Link from "next/link";
import AuthLogoutLink from "../../components/auth-logout-link";

type StudentSidebarProps = { active: "dashboard" | "formulir" | "upload" | "payment" | "exam" | "announcement" | "profile" };

const menu = [
  { label: "Dashboard", icon: "home", href: "/portal/siswa", key: "dashboard" },
  { label: "Formulir Pendaftaran", icon: "form", href: "/portal/siswa/formulir", key: "formulir" },
  { label: "Unggah Berkas", icon: "upload", href: "/portal/siswa/formulir/unggah-berkas", key: "upload" },
  { label: "Pembayaran Formulir", icon: "payment", href: "/portal/siswa/pembayaran-formulir", key: "payment" },
  { label: "Hasil Ujian & Seleksi", icon: "clipboard", href: "/portal/siswa/ujian-tka", key: "exam" },
  { label: "Pengumuman", icon: "bell", href: "/portal/siswa/pengumuman-kelulusan", key: "announcement" },
  { label: "Profil Siswa", icon: "profile", href: "/portal/siswa/profil", key: "profile" },
] as const;

function SidebarIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3.5 10 8.5-7 8.5 7" /><path d="M5.5 9v11h13V9M9 20v-6h6v6" /></>,
    form: <><path d="M7 3.5h7l4 4V20H7z" /><path d="M14 3.5v5h5M9.5 12h6M9.5 15.5h6" /><path d="M4.5 6.5v15h12" /></>,
    upload: <><path d="M12 15V3m0 0L8 7m4-4 4 4" /><path d="M5 13v6h14v-6" /></>,
    clipboard: <><rect x="5" y="5" width="14" height="16" rx="2" /><path d="M9 5V3h6v2M8.5 10h7M8.5 14h7M8.5 18h4" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    payment: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    logout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.3 2.3 0 1 1 3.8 1.7c-1 .8-1.6 1.2-1.6 2.8M12 17h.01" /></>,
  };

  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function StudentSidebar({ active }: StudentSidebarProps) {
  return (
    <aside className="student-sidebar">
      <Link className="student-dashboard-brand" href="/portal" aria-label="SPMB SMK Citra Negara, portal">
        <span className="student-dashboard-brand-mark">CN</span>
        <span>SPMB SMK CITRA NEGARA</span>
      </Link>
      <nav className="student-sidebar-nav" aria-label="Menu calon siswa">
        {menu.map((item) => (
          <Link key={item.label} href={item.href} className={`student-nav-link ${active === item.key ? "active" : ""}`} aria-current={active === item.key ? "page" : undefined}>
            <SidebarIcon name={item.icon} /><span>{item.label}</span>
          </Link>
        ))}
        <AuthLogoutLink className="student-nav-link" href="/portal/login/siswa"><SidebarIcon name="logout" /><span>Kembali ke Login</span></AuthLogoutLink>
      </nav>

      <section className="student-help-card" aria-labelledby="student-help-title">
        <h2 id="student-help-title">Butuh Bantuan?</h2>
        <p>Hubungi Tim Panitia SPMB Citra Negara melalui WhatsApp.</p>
        <p className="student-help-contact"><SidebarIcon name="help" /><span>0812-7788-9900</span></p>
      </section>
    </aside>
  );
}
