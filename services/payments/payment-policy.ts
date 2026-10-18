import { ApplicationStatus, PaymentStatus } from "@prisma/client";

export class PaymentUnavailableError extends Error { constructor() { super("Payment is unavailable"); this.name = "PaymentUnavailableError"; } }
export class PaymentInputError extends Error { constructor() { super("Invalid payment input"); this.name = "PaymentInputError"; } }

export function parsePaymentConfiguration(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new PaymentInputError();
  const body = value as Record<string, unknown>;
  const amount = body.amount;
  const method = typeof body.method === "string" ? body.method.trim() : "";
  const destination = typeof body.destination === "string" ? body.destination.trim() : "";
  if (!Number.isSafeInteger(amount) || (amount as number) < 1 || (amount as number) > 9_999_999_999 || !method || method.length > 120 || !destination || destination.length > 300) throw new PaymentInputError();
  return { amount: amount as number, method, destination };
}

export function parsePaymentReview(status: unknown, reason: unknown) {
  if (status !== "VERIFIED" && status !== "REJECTED") throw new PaymentInputError();
  const notes = typeof reason === "string" ? reason.trim().slice(0, 1000) : "";
  if (status === "REJECTED" && !notes) throw new PaymentInputError();
  return { status, notes: notes || null } as { status: "VERIFIED" | "REJECTED"; notes: string | null };
}

export function canReviewPayment(currentStatus: string, hasProof: boolean) { return currentStatus === "PENDING" && hasProof; }

export function applicationStatusForPaymentStatus(current: ApplicationStatus, paymentStatus: PaymentStatus | null): ApplicationStatus | null {
  if (paymentStatus === PaymentStatus.VERIFIED && (current === ApplicationStatus.SUBMITTED || current === ApplicationStatus.WAITING_PAYMENT)) return ApplicationStatus.PAYMENT_VERIFIED;
  if ((paymentStatus === null || paymentStatus === PaymentStatus.PENDING || paymentStatus === PaymentStatus.REJECTED) && current === ApplicationStatus.SUBMITTED) return ApplicationStatus.WAITING_PAYMENT;
  return null;
}
