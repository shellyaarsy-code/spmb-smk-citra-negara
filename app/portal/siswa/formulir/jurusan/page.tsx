import StudentMajorForm from "../../student-major-form";
import StudentSidebar from "../../student-sidebar";
import StudentReviewProgress from "../../student-review-progress";

export default function StudentMajorPage() {
  return (
    <main className="student-dashboard-outer">
      <div className="student-dashboard-app student-form-app">
        <StudentSidebar active="formulir" />

        <section className="student-dashboard-main student-form-main" aria-label="Pemilihan program keahlian calon siswa">
          <header className="student-dashboard-header student-form-header">
            <div>
              <h1>Formulir Pendaftaran</h1>
              <p>Tentukan pilihan program keahlian utama dan cadangan sesuai dengan minat kamu</p>
            </div>
            <span className="student-status-badge">Status: Pengisian Formulir</span>
          </header>

          <section className="student-progress student-form-progress" aria-label="Tahapan formulir pendaftaran">
            <StudentReviewProgress currentStage={2} />
          </section>

          <section className="student-dashboard-card student-biodata-card student-major-card">
            <StudentMajorForm />
          </section>
        </section>
      </div>
    </main>
  );
}
