import { saveAdminTkaDuration } from "../../../../../services/tka/admin-tka-service";
import { readTkaBody, tkaErrorResponse } from "../../../../../services/tka/tka-http";
import { prisma } from "../../../../../db/prisma";
import { requireRole } from "../../../../../services/auth/authorization";
import { RoleName } from "@prisma/client";
import { spmbPolicy } from "../../../../../config/spmb-policy";
import { MAX_TKA_DURATION_MINUTES } from "../../../../../services/tka/tka-policy";

export async function GET() {
  try {
    await requireRole(RoleName.ADMIN);
    const setting = await prisma.schoolSetting.findUnique({ where: { key: spmbPolicy.tkaDurationMinutesSettingKey }, select: { value: true, updatedAt: true } });
    const parsed = setting && /^\d+$/.test(setting.value) ? Number(setting.value) : null;
    const durationMinutes = parsed && Number.isSafeInteger(parsed) && parsed > 0 && parsed <= MAX_TKA_DURATION_MINUTES ? parsed : null;
    return Response.json({ durationMinutes, updatedAt: setting?.updatedAt ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return tkaErrorResponse(error); }
}

export async function PUT(request: Request) { try { return Response.json(await saveAdminTkaDuration(await readTkaBody(request)), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return tkaErrorResponse(error); } }
