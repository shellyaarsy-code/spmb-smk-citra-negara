import StudentParentForm from "../../student-parent-form";
import StudentSidebar from "../../student-sidebar";
import StudentReviewProgress from "../../student-review-progress";

export default function StudentParentPage() {
  return (
    <main className="student-dashboard-outer">
      <div className="student-dashboard-app student-form-app">
        <StudentSidebar active="formulir" />

        <section className="student-dashboard-main student-form-main" aria-label="Data orang tua dan akademik calon siswa">
          <header className="student-dashboard-header student-form-header">
            <div>
              <h1>Formulir Pendaftaran</h1>
              <p>Isi data orang tua kandung/wali serta riwayat akademik asal sekolah</p>
            </div>
            <span className="student-status-badge">Status: Pengisian Formulir</span>
          </header>

          <section className="student-progress student-form-progress" aria-label="Tahapan formulir pendaftaran">
            <StudentReviewProgress currentStage={1} />
          </section>

          <section className="student-dashboard-card student-biodata-card student-parent-card">
            <StudentParentForm />
          </section>
        </section>
      </div>
    </main>
  );
}
