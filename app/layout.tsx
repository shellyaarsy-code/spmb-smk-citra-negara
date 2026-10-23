import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "SPMB 2026 | SMK Citra Negara",
  description: "Portal Penerimaan Siswa Baru SMK Citra Negara tahun ajaran 2026/2027.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={plusJakarta.variable + " h-full antialiased"}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
