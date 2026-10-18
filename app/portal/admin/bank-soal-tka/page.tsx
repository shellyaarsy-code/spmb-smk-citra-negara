import LiveTkaManagement from "../live-tka-management";

export default async function AdminQuestionBankPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  if (mode === "demo") {
    const { default: AdminSidebar } = await import("../admin-sidebar");
    const { default: QuestionBank } = await import("../question-bank");
    return <main className="admin-dashboard-outer"><div className="admin-dashboard-app"><AdminSidebar active="bankQuestions" demo /><section className="admin-dashboard-main admin-question-bank-main" aria-label="Pratinjau bank soal"><QuestionBank /></section></div></main>;
  }
  return <LiveTkaManagement section="questions" />;
}
