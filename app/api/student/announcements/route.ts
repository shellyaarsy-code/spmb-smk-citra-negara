import { announcementErrorResponse } from "../../../../services/admin/announcement-http";
import { listPublishedAnnouncements } from "../../../../services/admin/announcement-service";

export async function GET() {
  try { return Response.json(await listPublishedAnnouncements(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return announcementErrorResponse(error); }
}
