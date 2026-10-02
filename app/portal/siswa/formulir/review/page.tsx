import StudentReviewForm from "../../student-review-form";
import StudentSidebar from "../../student-sidebar";
import StudentReviewProgress from "../../student-review-progress";

export default function StudentReviewPage() {
  return (
    <main className="student-dashboard-outer">
      <div className="student-dashboard-app student-form-app">
        <StudentSidebar active="formulir" />

        <section className="student-dashboard-main student-form-main" aria-label="Review dan validasi pendaftaran">
          <header className="student-dashboard-header student-form-header">
            <div>
              <h1>Review &amp; Validasi Pendaftaran</h1>
              <p>Periksa kembali seluruh berkas dan isian data sebelum melakukan kirim formulir</p>
            </div>
            <span className="student-status-badge">Status: Pengisian Formulir</span>
          </header>

          <section className="student-progress student-form-progress" aria-label="Tahapan formulir pendaftaran">
            <StudentReviewProgress />
          </section>

          <section className="student-dashboard-card student-biodata-card student-review-card">
            <StudentReviewForm />
          </section>
        </section>
      </div>
    </main>
  );
}
