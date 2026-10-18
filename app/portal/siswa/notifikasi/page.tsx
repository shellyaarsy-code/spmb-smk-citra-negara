import Link from "next/link";
import StudentSidebar from "../student-sidebar";
import LiveNotifications from "../live-notifications";

export default function StudentNotificationsPage() {
  return <main className="student-dashboard-outer"><div className="student-dashboard-app"><StudentSidebar active="notifications" /><LiveNotifications /></div><Link className="verification-preview-link" href="/portal/siswa">Kembali ke dashboard siswa</Link></main>;
}
