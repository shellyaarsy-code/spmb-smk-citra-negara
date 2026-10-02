import StudentBiodataForm from "../student-biodata-form";
import StudentSidebar from "../student-sidebar";
import StudentReviewProgress from "../student-review-progress";

export default function StudentBiodataPage() {
  return (
    <main className="student-dashboard-outer">
      <div className="student-dashboard-app student-form-app">
        <StudentSidebar active="formulir" />

        <section className="student-dashboard-main student-form-main" aria-label="Formulir biodata calon siswa">
          <header className="student-dashboard-header student-form-header">
            <div>
              <h1>Formulir Pendaftaran</h1>
              <p>Lengkapi data profil calon siswa dengan benar sesuai dokumen KK & Akta Lahir.</p>
            </div>
            <span className="student-status-badge">Status: Pengisian Formulir</span>
          </header>

          <section className="student-progress student-form-progress" aria-label="Tahapan formulir pendaftaran">
            <StudentReviewProgress currentStage={0} />
          </section>

          <section className="student-dashboard-card student-biodata-card">
            <StudentBiodataForm />
          </section>
        </section>
      </div>
    </main>
  );
}
