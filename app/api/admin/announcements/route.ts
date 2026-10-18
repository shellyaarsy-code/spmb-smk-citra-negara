import { announcementErrorResponse, readAnnouncementBody } from "../../../../services/admin/announcement-http";
import { createAdminAnnouncement, listAdminAnnouncements } from "../../../../services/admin/announcement-service";

const headers = { "Cache-Control": "no-store" };
export async function GET() {
  try { return Response.json(await listAdminAnnouncements(), { headers }); }
  catch (error) { return announcementErrorResponse(error); }
}
export async function POST(request: Request) {
  try { return Response.json(await createAdminAnnouncement(await readAnnouncementBody(request)), { status: 201, headers }); }
  catch (error) { return announcementErrorResponse(error); }
}
