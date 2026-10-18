import assert from "node:assert/strict";
import test from "node:test";
import { ApplicationStatus, PaymentStatus } from "@prisma/client";
import { readPositiveInteger } from "../../config/spmb-policy";
import { applicationStatusForPaymentStatus, canReviewPayment, parsePaymentConfiguration, parsePaymentReview, PaymentInputError, PaymentUnavailableError } from "../../services/payments/payment-policy";

test("payment amounts require an explicit positive whole-rupiah setting", () => {
  assert.equal(readPositiveInteger("250000"), 250000);
  for (const value of [undefined, "", "0", "-5", "1.25", "abc"]) assert.equal(readPositiveInteger(value), null);
  assert.ok(new PaymentUnavailableError() instanceof Error);
});

test("payment configuration must be explicitly provided with valid server policy fields", () => {
  assert.deepEqual(parsePaymentConfiguration({ amount: 250000, method: "Transfer", destination: "Rekening sekolah" }), { amount: 250000, method: "Transfer", destination: "Rekening sekolah" });
  for (const value of [{ amount: 0, method: "Transfer", destination: "A" }, { amount: 12.5, method: "Transfer", destination: "A" }, { amount: 12, method: "", destination: "A" }, { amount: 12, method: "Transfer", destination: "" }, null]) assert.throws(() => parsePaymentConfiguration(value), PaymentInputError);
});

test("payment review requires a proof and a reason for rejection", () => {
  assert.deepEqual(parsePaymentReview("VERIFIED", ""), { status: "VERIFIED", notes: null });
  assert.deepEqual(parsePaymentReview("REJECTED", "  Bukti buram  "), { status: "REJECTED", notes: "Bukti buram" });
  assert.throws(() => parsePaymentReview("REJECTED", " "), PaymentInputError);
  assert.throws(() => parsePaymentReview("PENDING", "alasan"), PaymentInputError);
  assert.equal(canReviewPayment("PENDING", true), true);
  assert.equal(canReviewPayment("PENDING", false), false);
  assert.equal(canReviewPayment("VERIFIED", true), false);
});

test("payment review keeps the application lifecycle in sync without regressing later stages", () => {
  assert.equal(applicationStatusForPaymentStatus(ApplicationStatus.SUBMITTED, PaymentStatus.VERIFIED), ApplicationStatus.PAYMENT_VERIFIED);
  assert.equal(applicationStatusForPaymentStatus(ApplicationStatus.WAITING_PAYMENT, PaymentStatus.VERIFIED), ApplicationStatus.PAYMENT_VERIFIED);
  assert.equal(applicationStatusForPaymentStatus(ApplicationStatus.SUBMITTED, PaymentStatus.REJECTED), ApplicationStatus.WAITING_PAYMENT);
  assert.equal(applicationStatusForPaymentStatus(ApplicationStatus.SUBMITTED, PaymentStatus.PENDING), ApplicationStatus.WAITING_PAYMENT);
  assert.equal(applicationStatusForPaymentStatus(ApplicationStatus.WAITING_PAYMENT, PaymentStatus.REJECTED), null);
  assert.equal(applicationStatusForPaymentStatus(ApplicationStatus.ELIGIBLE_FOR_TKA, PaymentStatus.VERIFIED), null);
  assert.equal(applicationStatusForPaymentStatus(ApplicationStatus.SUBMITTED, PaymentStatus.CANCELLED), null);
  assert.equal(applicationStatusForPaymentStatus(ApplicationStatus.SUBMITTED, null), ApplicationStatus.WAITING_PAYMENT);
});
