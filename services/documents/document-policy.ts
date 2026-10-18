import { ApplicationStatus, VerificationStatus } from "@prisma/client";

export function currentStudentDocumentsWhere(studentId: string) {
  return { application: { studentId } };
}

export function activeDocumentTypesWhere() {
  return { isActive: true } as const;
}

export function ownedDocumentWhere(studentId: string, documentId: string) {
  return { id: documentId, application: { studentId } } as const;
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
