import { listAdminPayments } from "../../../../services/payments/payment-service";
import { paymentErrorResponse } from "../../../../services/payments/payment-http";

export async function GET() { try { return Response.json(await listAdminPayments(), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return paymentErrorResponse(error); } }
