import { createCurrentPayment, getCurrentPayment } from "../../../../services/payments/payment-service";
import { paymentErrorResponse } from "../../../../services/payments/payment-http";

const headers = { "Cache-Control": "no-store" };
export async function GET() { try { return Response.json(await getCurrentPayment(), { headers }); } catch (error) { return paymentErrorResponse(error); } }
export async function POST() { try { return Response.json(await createCurrentPayment(), { status: 201, headers }); } catch (error) { return paymentErrorResponse(error); } }
