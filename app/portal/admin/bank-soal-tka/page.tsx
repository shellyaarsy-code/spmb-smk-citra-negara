import Link from "next/link";
import AdminSidebar from "../admin-sidebar";
import QuestionBank from "../question-bank";

export default async function AdminQuestionBankPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";
  return <main className="admin-dashboard-outer"><div className="admin-dashboard-app"><AdminSidebar active="bankQuestions" demo={demo} /><section className="admin-dashboard-main admin-question-bank-main" aria-label="Bank soal TKA">{demo ? <QuestionBank /> : <div className="admin-detail-not-found"><span className="admin-detail-not-found-icon">i</span><h1>Bank soal belum tersedia</h1><p>Butir soal akan tampil saat bank soal tersambung ke data aplikasi.</p><Link className="button button-mini" href="/portal/admin/bank-soal-tka?mode=demo">Buka pratinjau simulasi</Link></div>}</section></div></main>;
}
