import "server-only";
import { ApplicationStatus, AuditAction, Prisma, RoleName, VerificationStatus } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { requireRole } from "../auth/authorization";
import { getCurrentStudentId } from "../student/student-service";
import { activeDocumentTypesWhere, canMutateDocumentsInStatus, currentStudentDocumentsWhere, editableDocumentApplicationWhere, ownedDocumentWhere, resolveApplicationStatusAfterDocumentReview } from "./document-policy";
import { documentStorage } from "./document-storage";
import { getDocumentConfiguration } from "./document-config";
import { DocumentInputError, parseDocumentVerification, validateDocumentUpload } from "./document-validation";
import { deleteWithCompensation, uploadWithCompensation } from "./document-consistency";
export { DocumentInputError } from "./document-validation";
export class DocumentNotFoundError extends Error { constructor() { super("Document not found"); this.name = "DocumentNotFoundError"; } }
export class DocumentUnavailableError extends Error { constructor() { super("Document operation unavailable"); this.name = "DocumentUnavailableError"; } }

const documentSelect = {
  id: true, fileName: true, mimeType: true, fileSize: true, uploadedAt: true, status: true,
  documentType: { select: { code: true, name: true } },
} as const;


export async function getAvailableStudentDocumentTypes() {
  await requireRole(RoleName.SISWA);
  return prisma.documentType.findMany({
    where: activeDocumentTypesWhere(),
    orderBy: { name: "asc" },
    select: {
      code: true,
      name: true,
      description: true,
      required: true,
    },
  });
}

export async function getCurrentStudentDocuments() {
  const studentId = await getCurrentStudentId();
  const documents = await prisma.document.findMany({
    where: currentStudentDocumentsWhere(studentId),
    orderBy: [{ uploadedAt: "desc" }, { createdAt: "desc" }],
    select: { ...documentSelect, application: { select: { status: true } } },
  });
  return documents.map(({ application, ...document }) => ({ ...document, canDelete: canMutateDocumentsInStatus(application.status) && document.status === VerificationStatus.PENDING }));
}

export async function uploadCurrentStudentDocument(input: { documentTypeCode: string; fileName: string; mimeType: string; bytes: Uint8Array }) {
  const actor = await requireRole(RoleName.SISWA);
  const studentId = await getCurrentStudentId();
  const config = getDocumentConfiguration();
  const metadata = validateDocumentUpload(input, config);
  if (!config) throw new DocumentUnavailableError();
  const documentType = await prisma.documentType.findFirst({ where: { code: input.documentTypeCode, isActive: true }, select: { id: true } });
  if (!documentType) throw new DocumentInputError();
  const application = await prisma.application.findFirst({ where: { studentId, status: { in: [ApplicationStatus.DRAFT, ApplicationStatus.DOCUMENT_REVISION_REQUIRED] } }, orderBy: { updatedAt: "desc" }, select: { id: true, status: true } });
  if (!application || !canMutateDocumentsInStatus(application.status)) throw new DocumentUnavailableError();

  const documentId = crypto.randomUUID();
  const storagePath = `${studentId}/${application.id}/${documentId}`;
  try {
    return await uploadWithCompensation(documentStorage, storagePath, input.bytes, metadata.mimeType, () =>
      prisma.$transaction(async (tx) => {
        const stillEditable = await tx.application.findFirst({ where: { id: application.id, studentId, status: application.status }, select: { id: true } });
        if (!stillEditable || !canMutateDocumentsInStatus(application.status)) throw new DocumentUnavailableError();
        const created = await tx.document.create({
          data: { id: documentId, applicationId: application.id, documentTypeId: documentType.id, fileName: metadata.fileName, storagePath, mimeType: metadata.mimeType, fileSize: metadata.fileSize },
          select: documentSelect,
        });
        await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "DOCUMENT", entityId: documentId, action: AuditAction.CREATE, details: { applicationId: application.id, documentTypeCode: input.documentTypeCode, fileName: metadata.fileName } } });
        return created;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }),
      async () => { await prisma.auditLog.create({ data: { actorUserId: actor.id, entityType: "STORAGE_CLEANUP", entityId: documentId, action: AuditAction.CREATE, details: { purpose: "document-upload-rollback", objectPath: storagePath } } }); },
    );
  } catch {
    throw new DocumentUnavailableError();
  }
}

async function getOwnedDocument(documentId: string, studentId: string) {
  const document = await prisma.document.findFirst({ where: ownedDocumentWhere(studentId, documentId), select: { id: true, applicationId: true, storagePath: true, fileName: true, mimeType: true, status: true, application: { select: { status: true } } } });
  if (!document) throw new DocumentNotFoundError();
  return document;
}

export async function downloadStudentDocument(documentId: string) {
  const studentId = await getCurrentStudentId();
  const document = await getOwnedDocument(documentId, studentId);
  return { fileName: document.fileName, mimeType: document.mimeType ?? "application/octet-stream", bytes: await documentStorage.download(document.storagePath) };
}

export async function deleteCurrentStudentDocument(documentId: string) {
  const actor = await requireRole(RoleName.SISWA);
  const studentId = await getCurrentStudentId();
  const document = await getOwnedDocument(documentId, studentId);
  if (!canMutateDocumentsInStatus(document.application.status) || document.status !== VerificationStatus.PENDING) throw new DocumentUnavailableError();
  try {
    await deleteWithCompensation(documentStorage, document.storagePath, document.mimeType ?? "application/octet-stream", async () => {
      await prisma.$transaction(async (tx) => {
        const applicationWhere = editableDocumentApplicationWhere(document.applicationId, studentId, document.application.status);
        if (!applicationWhere || !await tx.application.findFirst({ where: applicationWhere, select: { id: true } })) throw new DocumentUnavailableError();
        const deleted = await tx.document.deleteMany({ where: { id: document.id, applicationId: document.applicationId, status: VerificationStatus.PENDING } });
        if (deleted.count !== 1) throw new DocumentUnavailableError();
        await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "DOCUMENT", entityId: document.id, action: AuditAction.DELETE, details: { applicationId: document.applicationId } } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    }, async () => { await prisma.auditLog.create({ data: { actorUserId: actor.id, entityType: "STORAGE_CLEANUP", entityId: document.id, action: AuditAction.CREATE, details: { purpose: "document-delete-restore", objectPath: document.storagePath } } }); });
  } catch {
    throw new DocumentUnavailableError();
  }
}

export async function getAdminDocuments(registrationNumber: string) {
  await requireRole(RoleName.ADMIN);
  const application = await prisma.application.findUnique({ where: { registrationNumber }, select: { id: true } });
  if (!application) throw new DocumentNotFoundError();
  return prisma.document.findMany({ where: { applicationId: application.id }, orderBy: { uploadedAt: "desc" }, select: { ...documentSelect, verifications: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, notes: true, verifiedAt: true } } } });
}

export async function verifyAdminDocument(documentId: string, statusInput: unknown, notesInput: unknown) {
  const admin = await requireRole(RoleName.ADMIN);
  const { status, notes } = parseDocumentVerification(statusInput, notesInput);
  return prisma.$transaction(async (tx) => {
    const current = await tx.document.findUnique({ where: { id: documentId }, select: { id: true, status: true, applicationId: true, documentType: { select: { required: true } }, application: { select: { status: true } } } });
    if (!current) throw new DocumentNotFoundError();
    const changed = await tx.document.updateMany({ where: { id: documentId, status: current.status }, data: { status } });
    if (changed.count !== 1) throw new DocumentUnavailableError();
    await tx.documentVerification.create({ data: { documentId, verifiedByUserId: admin.id, status, notes, verifiedAt: new Date() } });

    const requiredTypes = await tx.documentType.findMany({ where: { isActive: true, required: true }, select: { id: true } });
    const latestDocuments = requiredTypes.length ? await tx.document.findMany({ where: { applicationId: current.applicationId, documentTypeId: { in: requiredTypes.map((item) => item.id) } }, orderBy: [{ uploadedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }], select: { documentTypeId: true, status: true } }) : [];
    const latestByType = new Map<string, VerificationStatus>();
    for (const item of latestDocuments) if (!latestByType.has(item.documentTypeId)) latestByType.set(item.documentTypeId, item.status);
    const requiredDocumentsComplete = requiredTypes.length > 0 && requiredTypes.every((item) => latestByType.get(item.id) === VerificationStatus.VERIFIED);
    const nextApplicationStatus = resolveApplicationStatusAfterDocumentReview({ currentStatus: current.application.status, reviewedStatus: status, reviewedDocumentRequired: current.documentType.required, requiredDocumentsComplete });
    if (nextApplicationStatus) {
      const applicationChanged = await tx.application.updateMany({ where: { id: current.applicationId, status: current.application.status }, data: { status: nextApplicationStatus } });
      if (applicationChanged.count !== 1) throw new DocumentUnavailableError();
      await tx.applicationStatusHistory.create({ data: { applicationId: current.applicationId, status: nextApplicationStatus, changedByUserId: admin.id, notes: notes ?? undefined } });
    }
    await tx.auditLog.create({ data: { actorUserId: admin.id, entityType: "DOCUMENT", entityId: documentId, action: status === VerificationStatus.VERIFIED ? AuditAction.VERIFY : status === VerificationStatus.REJECTED ? AuditAction.REJECT : AuditAction.UPDATE, details: { status, notes, applicationStatus: nextApplicationStatus } } });
    return tx.document.findUnique({ where: { id: documentId }, select: documentSelect });
  });
}

export async function downloadAdminDocument(documentId: string) {
  await requireRole(RoleName.ADMIN);
  const document = await prisma.document.findUnique({ where: { id: documentId }, select: { storagePath: true, fileName: true, mimeType: true } });
  if (!document) throw new DocumentNotFoundError();
  return { fileName: document.fileName, mimeType: document.mimeType ?? "application/octet-stream", bytes: await documentStorage.download(document.storagePath) };
}
