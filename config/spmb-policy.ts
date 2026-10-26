/**
 * Operational policy switches. A value is not official until the school has
 * approved the corresponding rule and configured it explicitly.
 */
export const spmbPolicy = {
  demoMode: process.env.SPMB_DEMO_MODE === "true",
  officialRulesApproved: process.env.SPMB_OFFICIAL_RULES_APPROVED === "true",
  paymentAmountSettingKey: "SPMB_FORM_PAYMENT_AMOUNT",
  paymentMethodSettingKey: "SPMB_PAYMENT_METHOD",
  paymentDestinationSettingKey: "SPMB_PAYMENT_DESTINATION",
  tkaDurationMinutesSettingKey: "SPMB_TKA_DURATION_MINUTES",
  selectionResultsPublishedSettingKey: "SPMB_SELECTION_RESULTS_PUBLISHED",
} as const;

export function readPositiveInteger(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}
