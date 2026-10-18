import "server-only";
import { randomUUID } from "node:crypto";
import { ApplicationStatus, PaymentStatus, RoleName, AuditAction, Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { requireRole } from "../auth/authorization";
import { getCurrentStudentId } from "../student/student-service";
import { readPositiveInteger, spmbPolicy } from "../../config/spmb-policy";
import { applicationStatusForPaymentStatus, canReviewPayment, parsePaymentConfiguration, parsePaymentReview, PaymentUnavailableError } from "./payment-policy";
import { getDocumentConfiguration } from "../documents/document-config";
import { documentStorage, DocumentStorageUnavailableError } from "../documents/document-storage";
import { DocumentInputError, validateDocumentUpload } from "../documents/document-validation";

async function getConfiguredPaymentPolicy(tx?: Prisma.TransactionClient) {
  const db = tx ?? prisma;
  const settings = await db.schoolSetting.findMany({ where: { key: { in: [spmbPolicy.paymentAmountSettingKey, spmbPolicy.paymentMethodSettingKey, spmbPolicy.paymentDestinationSettingKey] } }, select: { key: true, value: true } });
  const byKey = new Map(settings.map((setting) => [setting.key, setting.value.trim()]));
  const amount = readPositiveInteger(byKey.get(spmbPolicy.paymentAmountSettingKey));
  const method = byKey.get(spmbPolicy.paymentMethodSettingKey);
  const destination = byKey.get(spmbPolicy.paymentDestinationSettingKey);
  if (!amount || !method || method.length > 120 || !destination || destination.length > 300) throw new PaymentUnavailableError();
  return { amount, method, destination };
}

export async function getAdminPaymentConfiguration() {
  await requireRole(RoleName.ADMIN);
  try { return { configured: true, ...(await getConfiguredPaymentPolicy()) }; }
  catch (error) { if (error instanceof PaymentUnavailableError) return { configured: false, amount: null, method: "", destination: "" }; throw error; }
}

export async function saveAdminPaymentConfiguration(raw: unknown) {
  const actor = await requireRole(RoleName.ADMIN);
  const input = parsePaymentConfiguration(raw);
  return prisma.$transaction(async (tx) => {
    const settings = [
      [spmbPolicy.paymentAmountSettingKey, String(input.amount), "Nominal biaya formulir SPMB (rupiah)."],
      [spmbPolicy.paymentMethodSettingKey, input.method, "Metode pembayaran yang ditetapkan sekolah."],
      [spmbPolicy.paymentDestinationSettingKey, input.destination, "Tujuan pembayaran yang ditetapkan sekolah."],
    ] as const;
    for (const [key, value, description] of settings) await tx.schoolSetting.upsert({ where: { key }, create: { key, value, description }, update: { value, description } });
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "PAYMENT_CONFIGURATION", entityId: "SPMB_PAYMENT_POLICY", action: AuditAction.UPDATE, details: { amount: input.amount, method: input.method, destinationChanged: true } } });
    return { configured: true, amount: input.amount, method: input.method, destination: input.destination };
  });
}

export async function getCurrentPayment() {
  await requireRole(RoleName.SISWA);
  const studentId = await getCurrentStudentId();
  const application = await prisma.application.findFirst({ where: { studentId, status: { not: ApplicationStatus.DRAFT } }, orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }], select: { id: true, registrationNumber: true } });
  if (!application) return { configured: false, payment: null };
  const payment = await prisma.payment.findUnique({ where: { applicationId: application.id }, select: { id: true, referenceNumber: true, amount: true, paymentMethod: true, paymentDestination: true, status: true, createdAt: true, updatedAt: true, paymentProofFileName: true, paymentProofMimeType: true, paymentProofSize: true, statusHistory: { orderBy: { createdAt: "desc" }, take: 5, select: { status: true, notes: true, createdAt: true } } } });
  let policy: Awaited<ReturnType<typeof getConfiguredPaymentPolicy>> | null = null;
  try { policy = await getConfiguredPaymentPolicy(); }
  catch (error) { if (!(error instanceof PaymentUnavailableError)) throw error; }
  const storageEnabled = Boolean(getDocumentConfiguration()) && await documentStorage.isAvailable();
  const paymentSnapshot = payment?.amount !== null && payment?.amount !== undefined && payment.paymentMethod && payment.paymentDestination
    ? { amount: Number(payment.amount), method: payment.paymentMethod, destination: payment.paymentDestination }
    : null;
  const instructions = payment ? paymentSnapshot : policy ? { amount: policy.amount, method: policy.method, destination: policy.destination } : null;
  return { configured: Boolean(payment || policy), instructions, proofUploadEnabled: storageEnabled, application: { registrationNumber: application.registrationNumber }, payment: payment ? { ...payment, hasProof: Boolean(payment.paymentProofFileName) } : null };
}

export async function createCurrentPayment() {
  const user = await requireRole(RoleName.SISWA);
  const studentId = await getCurrentStudentId();
  try {
    return await prisma.$transaction(async (tx) => {
      const application = await tx.application.findFirst({ where: { studentId, status: { in: [ApplicationStatus.SUBMITTED, ApplicationStatus.WAITING_PAYMENT] } }, orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }], select: { id: true, status: true } });
      if (!application) throw new PaymentUnavailableError();
      const existing = await tx.payment.findUnique({ where: { applicationId: application.id }, select: { id: true, referenceNumber: true, amount: true, status: true, createdAt: true, updatedAt: true } });
      const nextApplicationStatus = applicationStatusForPaymentStatus(application.status, existing?.status ?? null);
      if (nextApplicationStatus) {
        const changed = await tx.application.updateMany({ where: { id: application.id, studentId, status: application.status }, data: { status: nextApplicationStatus } });
        if (changed.count !== 1) throw new PaymentUnavailableError();
        await tx.applicationStatusHistory.create({ data: { applicationId: application.id, status: nextApplicationStatus, changedByUserId: user.id } });
      }
      if (existing) return existing;
      const policy = await getConfiguredPaymentPolicy(tx);
      const payment = await tx.payment.create({ data: { applicationId: application.id, referenceNumber: `SPMB-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`, amount: policy.amount, paymentMethod: policy.method, paymentDestination: policy.destination, status: PaymentStatus.PENDING } });
      await tx.paymentStatusHistory.create({ data: { paymentId: payment.id, status: PaymentStatus.PENDING, changedByUserId: user.id, notes: "Tagihan dibuat dari nominal yang dikonfigurasi sekolah." } });
      await tx.auditLog.create({ data: { actorUserId: user.id, entityType: "PAYMENT", entityId: payment.id, action: AuditAction.CREATE, details: { status: PaymentStatus.PENDING } } });
      return { id: payment.id, referenceNumber: payment.referenceNumber, amount: payment.amount, status: payment.status, createdAt: payment.createdAt, updatedAt: payment.updatedAt };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const application = await prisma.application.findFirst({ where: { studentId, status: { in: [ApplicationStatus.SUBMITTED, ApplicationStatus.WAITING_PAYMENT] } }, orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }], select: { id: true } });
      if (application) {
        const existing = await prisma.payment.findUnique({ where: { applicationId: application.id }, select: { id: true, referenceNumber: true, amount: true, status: true, createdAt: true, updatedAt: true } });
        if (existing) return existing;
      }
    }
    throw error;
  }
}

export async function listAdminPayments() {
  await requireRole(RoleName.ADMIN);
  return prisma.payment.findMany({ orderBy: [{ createdAt: "desc" }], select: { id: true, referenceNumber: true, amount: true, paymentMethod: true, paymentDestination: true, status: true, paymentProofFileName: true, paymentProofMimeType: true, paymentProofSize: true, createdAt: true, updatedAt: true, statusHistory: { orderBy: { createdAt: "desc" }, take: 5, select: { status: true, notes: true, createdAt: true } }, application: { select: { registrationNumber: true, student: { select: { profile: { select: { fullName: true } } } } } } } });
}

export async function uploadCurrentPaymentProof(file: { fileName: string; mimeType: string; size: number; bytes: Uint8Array }) {
  const actor = await requireRole(RoleName.SISWA);
  const studentId = await getCurrentStudentId();
  const config = getDocumentConfiguration();
  if (!config || file.size > config.maxFileSizeBytes || !await documentStorage.isAvailable()) throw new PaymentUnavailableError();
  const metadata = validateDocumentUpload({ fileName: file.fileName, mimeType: file.mimeType, bytes: file.bytes }, config);
  const payment = await prisma.payment.findFirst({
    where: { application: { studentId, status: { in: [ApplicationStatus.SUBMITTED, ApplicationStatus.WAITING_PAYMENT] } }, status: { in: [PaymentStatus.PENDING, PaymentStatus.REJECTED] } },
    orderBy: { createdAt: "desc" }, select: { id: true, applicationId: true, status: true, paymentProofPath: true },
  });
  if (!payment) throw new PaymentUnavailableError();
  const storagePath = `${studentId}/${payment.applicationId}/payment/${payment.id}/${randomUUID()}`;
  try {
    await documentStorage.upload(storagePath, file.bytes, metadata.mimeType);
  } catch (error) {
    if (error instanceof DocumentStorageUnavailableError) throw new PaymentUnavailableError();
    throw error;
  }
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const changed = await tx.payment.updateMany({ where: { id: payment.id, applicationId: payment.applicationId, status: { in: [PaymentStatus.PENDING, PaymentStatus.REJECTED] }, paymentProofPath: payment.paymentProofPath }, data: { paymentProofPath: storagePath, paymentProofFileName: metadata.fileName, paymentProofMimeType: metadata.mimeType, paymentProofSize: metadata.fileSize, status: PaymentStatus.PENDING, verifiedByUserId: null } });
      if (changed.count !== 1) throw new PaymentUnavailableError();
      await tx.paymentStatusHistory.create({ data: { paymentId: payment.id, status: PaymentStatus.PENDING, changedByUserId: actor.id, notes: "Bukti pembayaran dikirim; menunggu pemeriksaan admin." } });
      await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "PAYMENT", entityId: payment.id, action: AuditAction.UPDATE, details: { proofUploaded: true } } });
      return tx.payment.findUniqueOrThrow({ where: { id: payment.id }, select: { id: true, referenceNumber: true, status: true, paymentProofFileName: true, paymentProofMimeType: true, paymentProofSize: true } });
    });
    if (payment.paymentProofPath) {
      try { await documentStorage.delete(payment.paymentProofPath); }
      catch {
        await prisma.auditLog.create({ data: { actorUserId: actor.id, entityType: "STORAGE_CLEANUP", entityId: payment.id, action: AuditAction.CREATE, details: { purpose: "payment-proof-replaced", objectPath: payment.paymentProofPath } } }).catch(() => undefined);
      }
    }
    return updated;
  } catch (error) {
    try { await documentStorage.delete(storagePath); }
    catch {
      await prisma.auditLog.create({ data: { actorUserId: actor.id, entityType: "STORAGE_CLEANUP", entityId: payment.id, action: AuditAction.CREATE, details: { purpose: "payment-proof-upload-rollback", objectPath: storagePath } } }).catch(() => undefined);
    }
    throw error;
  }
}

export async function changeAdminPaymentStatus(paymentId: string, rawStatus: unknown, rawReason: unknown) {
  const admin = await requireRole(RoleName.ADMIN);
  let review: ReturnType<typeof parsePaymentReview>;
  try { review = parsePaymentReview(rawStatus, rawReason); } catch { throw new DocumentInputError(); }
  const { status, notes } = review;
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId }, select: { id: true, referenceNumber: true, applicationId: true, status: true, paymentProofPath: true, application: { select: { status: true, student: { select: { userId: true } } } } } });
    if (!payment) throw new PaymentUnavailableError();
    if (!canReviewPayment(payment.status, Boolean(payment.paymentProofPath))) throw new PaymentUnavailableError();
    const changed = await tx.payment.updateMany({ where: { id: paymentId, status: PaymentStatus.PENDING, paymentProofPath: { not: null } }, data: { status, verifiedByUserId: admin.id } });
    if (changed.count !== 1) throw new PaymentUnavailableError();
    await tx.paymentStatusHistory.create({ data: { paymentId, status, changedByUserId: admin.id, notes } });
    const nextApplicationStatus = applicationStatusForPaymentStatus(payment.application.status, status);
    if (nextApplicationStatus) {
      const applicationChanged = await tx.application.updateMany({ where: { id: payment.applicationId, status: payment.application.status }, data: { status: nextApplicationStatus } });
      if (applicationChanged.count !== 1) throw new PaymentUnavailableError();
      await tx.applicationStatusHistory.create({ data: { applicationId: payment.applicationId, status: nextApplicationStatus, changedByUserId: admin.id, notes: notes ?? undefined } });
    }
    await tx.notification.create({ data: {
      userId: payment.application.student.userId,
      applicationId: payment.applicationId,
      title: status === PaymentStatus.VERIFIED ? "Pembayaran terverifikasi" : "Bukti pembayaran perlu diperbaiki",
      message: status === PaymentStatus.VERIFIED
        ? `Pembayaran dengan referensi ${payment.referenceNumber} telah diverifikasi.`
        : `Bukti pembayaran dengan referensi ${payment.referenceNumber} ditolak. Alasan: ${notes}`,
      type: status === PaymentStatus.VERIFIED ? "SUCCESS" : "WARNING",
    } });
    await tx.auditLog.create({ data: { actorUserId: admin.id, entityType: "PAYMENT", entityId: paymentId, action: status === PaymentStatus.VERIFIED ? AuditAction.VERIFY : AuditAction.REJECT, details: { status, reason: notes } } });
    return { id: paymentId, status };
  });
}

async function downloadPaymentProof(payment: { paymentProofPath: string | null; paymentProofFileName: string | null; paymentProofMimeType: string | null }) {
  if (!payment.paymentProofPath) throw new PaymentUnavailableError();
  return { fileName: payment.paymentProofFileName ?? "bukti-pembayaran", mimeType: payment.paymentProofMimeType ?? "application/octet-stream", bytes: await documentStorage.download(payment.paymentProofPath) };
}

export async function downloadAdminPaymentProof(paymentId: string) {
  await requireRole(RoleName.ADMIN);
  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, select: { paymentProofPath: true, paymentProofFileName: true, paymentProofMimeType: true } });
  if (!payment) throw new PaymentUnavailableError();
  return downloadPaymentProof(payment);
}

export async function downloadCurrentPaymentProof() {
  await requireRole(RoleName.SISWA);
  const studentId = await getCurrentStudentId();
  const payment = await prisma.payment.findFirst({ where: { application: { studentId }, paymentProofPath: { not: null } }, orderBy: { createdAt: "desc" }, select: { paymentProofPath: true, paymentProofFileName: true, paymentProofMimeType: true } });
  if (!payment) throw new PaymentUnavailableError();
  return downloadPaymentProof(payment);
}
