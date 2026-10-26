import { ApplicationStatus, VerificationStatus } from "@prisma/client";
import { spmbPolicy } from "../../config/spmb-policy";

export function canProvisionDemoDocumentTypes(env: Record<string, string | undefined> = process.env) {
  return env.VERCEL_ENV === "preview" && env.SPMB_DEMO_MODE === "true";
}

export function visibleDocumentTypeWhere(demoMode = process.env.VERCEL_ENV === "preview" && spmbPolicy.demoMode) {
  return { code: demoMode ? { startsWith: "DEMO-" } : { not: { startsWith: "DEMO-" } } } as const;
}

export function currentStudentDocumentsWhere(studentId: string, demoMode = spmbPolicy.demoMode) {
  return { application: { studentId }, documentType: visibleDocumentTypeWhere(demoMode) };
}

export function activeDocumentTypesWhere(demoMode = spmbPolicy.demoMode) {
  return { isActive: true, ...visibleDocumentTypeWhere(demoMode) } as const;
}

export function ownedDocumentWhere(studentId: string, documentId: string, demoMode = spmbPolicy.demoMode) {
  return { id: documentId, application: { studentId }, documentType: visibleDocumentTypeWhere(demoMode) } as const;
}

export function canMutateDocumentsInStatus(status: string) {
  return status === "DRAFT" || status === "DOCUMENT_REVISION_REQUIRED";
}

export function editableDocumentApplicationWhere(applicationId: string, studentId: string, status: string) {
  if (status !== "DRAFT" && status !== "DOCUMENT_REVISION_REQUIRED") return null;
  return { id: applicationId, studentId, status: status as "DRAFT" | "DOCUMENT_REVISION_REQUIRED" };
}

const documentReviewStatuses = new Set<ApplicationStatus>([
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.WAITING_DOCUMENT_VERIFICATION,
  ApplicationStatus.DOCUMENT_REVISION_REQUIRED,
]);

export function resolveApplicationStatusAfterDocumentReview(input: {
  currentStatus: ApplicationStatus;
  reviewedStatus: VerificationStatus;
  reviewedDocumentRequired: boolean;
  requiredDocumentsComplete: boolean;
}): ApplicationStatus | null {
  if (!documentReviewStatuses.has(input.currentStatus)) return null;
  if (input.reviewedDocumentRequired && input.reviewedStatus !== VerificationStatus.VERIFIED) {
    return input.currentStatus === ApplicationStatus.DOCUMENT_REVISION_REQUIRED ? null : ApplicationStatus.DOCUMENT_REVISION_REQUIRED;
  }
  if (input.requiredDocumentsComplete) {
    return input.currentStatus === ApplicationStatus.DOCUMENT_VERIFIED ? null : ApplicationStatus.DOCUMENT_VERIFIED;
  }
  if (input.currentStatus === ApplicationStatus.SUBMITTED && input.reviewedStatus === VerificationStatus.VERIFIED) return ApplicationStatus.WAITING_DOCUMENT_VERIFICATION;
  return null;
}
