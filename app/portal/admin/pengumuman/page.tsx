import AdminSidebar from "../admin-sidebar";
import AnnouncementManager from "../announcement-manager";
import LiveAnnouncementManager from "../live-announcement-manager";

export default async function AnnouncementPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";
  return <main className="admin-dashboard-outer"><div className="admin-dashboard-app"><AdminSidebar active="announcements" demo={demo} /><section className="admin-dashboard-main admin-announcement-main" aria-label="Kelola pengumuman">{demo ? <AnnouncementManager /> : <LiveAnnouncementManager />}</section></div></main>;
}
