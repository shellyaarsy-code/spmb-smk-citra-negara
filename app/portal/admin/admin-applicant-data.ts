import { demoPpdbPrograms } from "../demo-ppdb-data";

export type ApplicantStatus = "Verifikasi Berkas" | "Berkas Terverifikasi" | "Berkas Lengkap" | "Diterima" | "Berkas Kurang" | "Pendaftaran Akun";

export type Applicant = {
  id: number;
  registrationNumber: string;
  name: string;
  nisn: string;
  program: string;
  backupProgram: string;
  date: string;
  status: ApplicantStatus;
  birthPlace: string;
  birthDate: string;
  gender: string;
  email: string;
  whatsapp: string;
  address: string;
  schoolName: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  parentWhatsapp: string;
  schoolNpsn: string;
  schoolType: string;
  schoolStatus: string;
  graduationYear: string;
  semesterGrades: [string, string, string, string];
};

const initialApplicants: Applicant[] = [
  {
    id: 1, registrationNumber: "CN260012", name: "Rahman Aditya", nisn: "00987654321", program: "PPLG", backupProgram: "TJKT", date: "2026-02-04", status: "Verifikasi Berkas",
    birthPlace: "Depok", birthDate: "12 Maret 2011", gender: "Laki-laki", email: "rahman.aditya@gmail.com", whatsapp: "081234567890", address: "Jl. Margonda Raya No. 45, Pancoran Mas, Depok, Jawa Barat", schoolName: "SMP Negeri 1 Depok",
    fatherName: "Budi Hermawan", fatherOccupation: "Wiraswasta", motherName: "Siti Aminah", motherOccupation: "Ibu Rumah Tangga", parentWhatsapp: "08129876543", schoolNpsn: "20101234", schoolType: "SMP", schoolStatus: "Negeri", graduationYear: "2026", semesterGrades: ["86.50", "87.20", "89.00", "91.10"],
  },
  {
    id: 2, registrationNumber: "CN260013", name: "Siti Rahmawati", nisn: "00987654310", program: "DKV", backupProgram: "PPLG", date: "2026-02-04", status: "Diterima",
    birthPlace: "Depok", birthDate: "8 Juni 2010", gender: "Perempuan", email: "siti.rahmawati@contoh.invalid", whatsapp: "081200000013", address: "Depok, Jawa Barat", schoolName: "SMP Negeri 1 Depok",
    fatherName: "Orang Tua Simulasi", fatherOccupation: "Karyawan", motherName: "Orang Tua Simulasi", motherOccupation: "Wiraswasta", parentWhatsapp: "081200000113", schoolNpsn: "20101234", schoolType: "SMP", schoolStatus: "Negeri", graduationYear: "2026", semesterGrades: ["84.00", "85.50", "87.00", "88.50"],
  },
  {
    id: 3, registrationNumber: "CN260014", name: "Andi Wijaya", nisn: "00954321098", program: "TJKT", backupProgram: "PHT", date: "2026-02-03", status: "Berkas Kurang",
    birthPlace: "Depok", birthDate: "3 Februari 2010", gender: "Laki-laki", email: "andi.wijaya@contoh.invalid", whatsapp: "081200000014", address: "Depok, Jawa Barat", schoolName: "SMP Negeri 1 Depok",
    fatherName: "Orang Tua Simulasi", fatherOccupation: "Wiraswasta", motherName: "Orang Tua Simulasi", motherOccupation: "Ibu Rumah Tangga", parentWhatsapp: "081200000114", schoolNpsn: "20101234", schoolType: "SMP", schoolStatus: "Negeri", graduationYear: "2026", semesterGrades: ["80.00", "83.00", "85.00", "86.00"],
  },
  {
    id: 4, registrationNumber: "CN260015", name: "Rina Kartika", nisn: "00812345678", program: "MPLB", backupProgram: "BDR", date: "2026-02-02", status: "Diterima",
    birthPlace: "Depok", birthDate: "11 November 2010", gender: "Perempuan", email: "rina.kartika@contoh.invalid", whatsapp: "081200000015", address: "Depok, Jawa Barat", schoolName: "SMP Negeri 1 Depok",
    fatherName: "Orang Tua Simulasi", fatherOccupation: "Karyawan", motherName: "Orang Tua Simulasi", motherOccupation: "Wiraswasta", parentWhatsapp: "081200000115", schoolNpsn: "20101234", schoolType: "SMP", schoolStatus: "Negeri", graduationYear: "2026", semesterGrades: ["88.00", "87.00", "89.00", "90.00"],
  },
  {
    id: 5, registrationNumber: "CN260016", name: "Fajar Nugraha", nisn: "00789012345", program: "PHT", backupProgram: "MPLB", date: "2026-02-02", status: "Pendaftaran Akun",
    birthPlace: "Depok", birthDate: "20 Mei 2010", gender: "Laki-laki", email: "fajar.nugraha@contoh.invalid", whatsapp: "081200000016", address: "Depok, Jawa Barat", schoolName: "SMP Negeri 1 Depok",
    fatherName: "Orang Tua Simulasi", fatherOccupation: "Wiraswasta", motherName: "Orang Tua Simulasi", motherOccupation: "Ibu Rumah Tangga", parentWhatsapp: "081200000116", schoolNpsn: "20101234", schoolType: "SMP", schoolStatus: "Negeri", graduationYear: "2026", semesterGrades: ["82.00", "84.00", "85.00", "86.00"],
  },
  {
    id: 6, registrationNumber: "CN260017", name: "Dewi Lestari", nisn: "00921098765", program: "BDR", backupProgram: "DKV", date: "2026-02-01", status: "Verifikasi Berkas",
    birthPlace: "Depok", birthDate: "7 Juli 2010", gender: "Perempuan", email: "dewi.lestari@contoh.invalid", whatsapp: "081200000017", address: "Depok, Jawa Barat", schoolName: "SMP Negeri 1 Depok",
    fatherName: "Orang Tua Simulasi", fatherOccupation: "Karyawan", motherName: "Orang Tua Simulasi", motherOccupation: "Wiraswasta", parentWhatsapp: "081200000117", schoolNpsn: "20101234", schoolType: "SMP", schoolStatus: "Negeri", graduationYear: "2026", semesterGrades: ["86.00", "88.00", "87.00", "90.00"],
  },
];

const programCodes = demoPpdbPrograms.map((program) => program.code);
const programTotals = demoPpdbPrograms.map((program) => program.count);
const remainingPrograms = programCodes.flatMap((program, index) => Array.from({ length: programTotals[index] - 1 }, () => program));

export const demoApplicants: Applicant[] = [
  ...initialApplicants,
  ...Array.from({ length: 1234 }, (_, offset): Applicant => {
    const id = offset + 7;
    const status: ApplicantStatus = offset < 491 ? "Diterima" : offset < 638 ? "Berkas Terverifikasi" : offset < 978 ? "Berkas Lengkap" : offset < 1173 ? "Berkas Kurang" : "Pendaftaran Akun";
    const day = String((offset % 28) + 1).padStart(2, "0");
    return {
      id, registrationNumber: `CN26${String(id + 11).padStart(4, "0")}`, name: `Calon Simulasi ${String(id).padStart(4, "0")}`, nisn: String(9900000000 + id),
      program: remainingPrograms[offset], backupProgram: programCodes[(offset + 2) % programCodes.length], date: `2026-02-${day}`, status,
      birthPlace: "Depok", birthDate: "10 Mei 2010", gender: offset % 2 ? "Perempuan" : "Laki-laki", email: `calon${id}@contoh.invalid`, whatsapp: `081200${String(id).padStart(6, "0")}`,
      address: "Depok, Jawa Barat", schoolName: "SMP Simulasi Depok", fatherName: "Orang Tua Simulasi", fatherOccupation: "Karyawan", motherName: "Orang Tua Simulasi", motherOccupation: "Wiraswasta", parentWhatsapp: `081200${String(id + 100000).slice(-6)}`,
      schoolNpsn: "00000000", schoolType: "SMP", schoolStatus: "Negeri", graduationYear: "2026", semesterGrades: ["80.00", "82.00", "84.00", "86.00"],
    };
  }),
];

export function findDemoApplicant(registrationNumber: string) {
  return demoApplicants.find((applicant) => applicant.registrationNumber === registrationNumber);
}

export const programNames: Record<string, string> = {
  PPLG: "Pengembangan Perangkat Lunak dan Gim",
  TJKT: "Teknik Jaringan Komputer dan Telekomunikasi",
  DKV: "Desain Komunikasi Visual",
  MPLB: "Manajemen Perkantoran dan Layanan Bisnis",
  BDR: "Bisnis Digital dan Ritel",
  PHT: "Perhotelan",
};
