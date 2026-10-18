import { markCurrentStudentNotificationRead } from "../../../../../services/notifications/notification-service";
import { notificationErrorResponse } from "../../../../../services/notifications/notification-http";

export async function PATCH(_request: Request, { params }: { params: Promise<{ notificationId: string }> }) {
  try { return Response.json(await markCurrentStudentNotificationRead((await params).notificationId), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return notificationErrorResponse(error); }
}
