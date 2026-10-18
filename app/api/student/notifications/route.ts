import { listCurrentStudentNotifications } from "../../../../services/notifications/notification-service";
import { notificationErrorResponse } from "../../../../services/notifications/notification-http";

export async function GET() { try { return Response.json(await listCurrentStudentNotifications(), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return notificationErrorResponse(error); } }
