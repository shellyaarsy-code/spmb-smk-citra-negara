import { announcementErrorResponse, readAnnouncementBody } from "../../../../../services/admin/announcement-http";
import { changeAdminAnnouncementStatus, deleteAdminDraftAnnouncement, updateAdminAnnouncement } from "../../../../../services/admin/announcement-service";
import { AnnouncementInputError } from "../../../../../services/admin/announcement-policy";

type Context = { params: Promise<{ announcementId: string }> };
async function getId(context: Context) {
  const { announcementId } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(announcementId)) throw new AnnouncementInputError();
  return announcementId;
}

export async function PATCH(request: Request, context: Context) {
  try {
    const id = await getId(context);
    const body = await readAnnouncementBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new AnnouncementInputError();
    if ("status" in body) return Response.json(await changeAdminAnnouncementStatus(id, body.status), { headers: { "Cache-Control": "no-store" } });
    return Response.json(await updateAdminAnnouncement(id, body), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return announcementErrorResponse(error); }
}

export async function DELETE(_request: Request, context: Context) {
  try { return Response.json(await deleteAdminDraftAnnouncement(await getId(context)), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return announcementErrorResponse(error); }
}
