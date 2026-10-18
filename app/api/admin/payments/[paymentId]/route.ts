import { changeAdminPaymentStatus, downloadAdminPaymentProof } from "../../../../../services/payments/payment-service";
import { paymentErrorResponse } from "../../../../../services/payments/payment-http";
import { documentFileResponse } from "../../../../../services/documents/document-http";

export async function GET(_request: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  try { return documentFileResponse(await downloadAdminPaymentProof((await params).paymentId)); }
  catch (error) { return paymentErrorResponse(error); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ error: "Data verifikasi tidak valid." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    const payment = await changeAdminPaymentStatus((await params).paymentId, (body as Record<string, unknown>).status, (body as Record<string, unknown>).reason);
    return Response.json({ payment }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return paymentErrorResponse(error); }
}
