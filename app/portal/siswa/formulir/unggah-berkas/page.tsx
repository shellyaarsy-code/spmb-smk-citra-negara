import StudentDocumentsForm from "../../student-documents-form";
import StudentSidebar from "../../student-sidebar";
import StudentReviewProgress from "../../student-review-progress";

export default function StudentDocumentsPage() {
  return (
    <main className="student-dashboard-outer">
      <div className="student-dashboard-app student-form-app">
        <StudentSidebar active="upload" />

        <section className="student-dashboard-main student-form-main" aria-label="Unggah berkas dokumen pendaftaran">
          <header className="student-dashboard-header student-form-header">
            <div>
              <h1>Unggah Berkas Dokumen</h1>
              <p>Unggah pindaian berkas administrasi wajib untuk mempermudah validasi SPMB</p>
            </div>
            <span className="student-status-badge">Status: Pengisian Formulir</span>
          </header>

          <section className="student-progress student-form-progress" aria-label="Tahapan formulir pendaftaran">
            <StudentReviewProgress currentStage={3} />
          </section>

          <section className="student-dashboard-card student-biodata-card student-documents-card">
            <StudentDocumentsForm />
          </section>
        </section>
      </div>
    </main>
  );
}
