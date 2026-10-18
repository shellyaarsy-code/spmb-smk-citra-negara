import Link from "next/link";
import BrandLogo from "./brand-logo";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="SMK Citra Negara, beranda">
        <BrandLogo className="brand-mark" />
        <span className="brand-name">SMK CITRA NEGARA<small>DEPOK · JAWA BARAT</small></span>
      </Link>
      <nav className="main-nav" aria-label="Navigasi utama">
        <Link href="/">Beranda</Link>
        <Link href="/#program">Program Keahlian</Link>
        <Link href="/#alur">Alur Pendaftaran</Link>
        <Link href="/#jadwal">Jadwal &amp; Biaya</Link>
        <Link href="/#faq">FAQ</Link>
      </nav>
      <div className="header-actions">
        <Link className="button button-outline button-mini" href="/portal">Masuk Portal</Link>
        <Link className="button button-mini" href="/portal/login/siswa?mode=register">Daftar Sekarang <span>↗</span></Link>
      </div>
      <Link className="mobile-login" href="/portal">Masuk Portal <span>↗</span></Link>
    </header>
  );
}

export function SiteFooter() {
  return (
      <footer className="site-footer" id="kontak">
      <div className="footer-main">
        <div className="footer-about">
          <Link className="brand brand-light" href="/">
            <BrandLogo className="brand-mark" />
            <span className="brand-name">SMK CITRA NEGARA<small>DEPOK · JAWA BARAT</small></span>
          </Link>
          <p>Membentuk generasi terampil, berkarakter, dan siap melangkah menuju masa depan.</p>
        </div>
        <div className="footer-links">
          <div><h3>Program Studi</h3><Link href="/#program">Pilihan program</Link><Link href="/#alur">Alur pendaftaran</Link><Link href="/#jadwal">Jadwal gelombang</Link><Link href="/#faq">Pertanyaan umum</Link></div>
          <div><h3>Kontak Informasi</h3><span>Informasi penerimaan siswa baru</span><span>SMK Citra Negara · Depok</span><a href="https://wa.me/6281277889900" target="_blank" rel="noreferrer">WhatsApp Tim Panitia</a><Link href="/portal">Masuk ke portal SPMB</Link></div>
        </div>
      </div>
      <div className="footer-bottom"><span>© 2026 SMK Citra Negara. Hak cipta dilindungi.</span></div>
    </footer>
  );
}
