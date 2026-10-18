import { getAdminPaymentConfiguration, saveAdminPaymentConfiguration } from "../../../../../services/payments/payment-service";
import { paymentErrorResponse } from "../../../../../services/payments/payment-http";

export async function GET() { try { return Response.json(await getAdminPaymentConfiguration(), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return paymentErrorResponse(error); } }
export async function PUT(request: Request) { try { return Response.json(await saveAdminPaymentConfiguration(await request.json()), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return paymentErrorResponse(error); } }
