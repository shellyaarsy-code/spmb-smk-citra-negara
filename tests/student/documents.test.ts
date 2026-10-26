import assert from "node:assert/strict";
import test from "node:test";
import { activeDocumentTypesWhere, canMutateDocumentsInStatus, canProvisionDemoDocumentTypes, currentStudentDocumentsWhere, editableDocumentApplicationWhere, ownedDocumentWhere, resolveApplicationStatusAfterDocumentReview, visibleDocumentTypeWhere } from "../../services/documents/document-policy";
import { DocumentInputError, parseDocumentVerification, validateDocumentUpload } from "../../services/documents/document-validation";
import { documentUploadConfigurationStatus, getDocumentConfiguration } from "../../services/documents/document-config";
import { deleteWithCompensation, uploadWithCompensation } from "../../services/documents/document-consistency";
import { applyDocumentVerification } from "../../services/documents/document-verification";
import { documentErrorDetails } from "../../services/documents/document-error-policy";

const uploadConfig = { allowedMimeTypes: ["application/pdf"], maxFileSizeBytes: 12 };
const pdfBytes = new TextEncoder().encode("%PDF-1.7\n");

test("demo document setup is restricted to Preview with demo mode enabled", () => {
  assert.equal(canProvisionDemoDocumentTypes({ VERCEL_ENV: "preview", SPMB_DEMO_MODE: "true" }), true);
  assert.equal(canProvisionDemoDocumentTypes({ VERCEL_ENV: "production", SPMB_DEMO_MODE: "true" }), false);
  assert.equal(canProvisionDemoDocumentTypes({ VERCEL_ENV: "preview", SPMB_DEMO_MODE: "false" }), false);
});

test("document storage stays disabled until a Blob store is connected", () => {
  assert.equal(getDocumentConfiguration({ NODE_ENV: "test", SPMB_DOCUMENT_ALLOWED_MIME_TYPES: "application/pdf" }), null);
  assert.deepEqual(documentUploadConfigurationStatus({ NODE_ENV: "test", SPMB_DOCUMENT_ALLOWED_MIME_TYPES: "application/pdf" }), { enabled: false, allowedMimeTypes: [], maxFileSizeBytes: null });
});

test("connected Vercel Preview gets safe document upload defaults", () => {
  assert.deepEqual(getDocumentConfiguration({ NODE_ENV: "test", VERCEL: "1", BLOB_STORE_ID: "demo-store" }), {
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    maxFileSizeBytes: 4 * 1024 * 1024,
  });
});

test("document upload configuration rejects unsupported types and unsafe size values", () => {
  assert.equal(getDocumentConfiguration({ NODE_ENV: "test", VERCEL: "1", BLOB_STORE_ID: "demo-store", SPMB_DOCUMENT_ALLOWED_MIME_TYPES: "application/x-msdownload" }), null);
  assert.equal(getDocumentConfiguration({ NODE_ENV: "test", VERCEL: "1", BLOB_STORE_ID: "demo-store", SPMB_DOCUMENT_MAX_FILE_SIZE_BYTES: "-1" }), null);
});

test("document query ownership is scoped through the owning application", () => {
  assert.deepEqual(currentStudentDocumentsWhere("session-owned-student", false), {
    application: { studentId: "session-owned-student" },
    documentType: { code: { not: { startsWith: "DEMO-" } } },
  });
  assert.deepEqual(currentStudentDocumentsWhere("session-owned-student", true).documentType, { code: { startsWith: "DEMO-" } });
});

test("student document types query only active records and never grants mutations", () => {
  assert.deepEqual(activeDocumentTypesWhere(false), { isActive: true, code: { not: { startsWith: "DEMO-" } } });
  assert.deepEqual(activeDocumentTypesWhere(true), { isActive: true, code: { startsWith: "DEMO-" } });
  assert.deepEqual(visibleDocumentTypeWhere(false), { code: { not: { startsWith: "DEMO-" } } });
});

test("document ownership query scopes lookup to the authenticated student", () => {
  assert.deepEqual(ownedDocumentWhere("student-a", "doc-a", false), { id: "doc-a", application: { studentId: "student-a" }, documentType: { code: { not: { startsWith: "DEMO-" } } } });
  assert.notDeepEqual(ownedDocumentWhere("student-a", "doc-a"), ownedDocumentWhere("student-b", "doc-a"));
});

test("document upload accepts a configured file with a matching signature", () => {
  assert.deepEqual(validateDocumentUpload({ fileName: "folder\\identity.pdf", mimeType: "application/pdf", bytes: pdfBytes }, uploadConfig), {
    fileName: "folder_identity.pdf", mimeType: "application/pdf", fileSize: pdfBytes.length,
  });
});

test("document upload rejects missing configuration and disallowed or mismatched file types", () => {
  assert.throws(() => validateDocumentUpload({ fileName: "id.pdf", mimeType: "application/pdf", bytes: pdfBytes }, null), DocumentInputError);
  assert.throws(() => validateDocumentUpload({ fileName: "id.exe", mimeType: "application/x-msdownload", bytes: pdfBytes }, uploadConfig), DocumentInputError);
  assert.throws(() => validateDocumentUpload({ fileName: "fake.pdf", mimeType: "application/pdf", bytes: new TextEncoder().encode("not a pdf") }, uploadConfig), DocumentInputError);
});

test("document upload rejects files larger than the configured maximum", () => {
  const oversized = new Uint8Array(uploadConfig.maxFileSizeBytes + 1); oversized.set(pdfBytes);
  assert.throws(() => validateDocumentUpload({ fileName: "large.pdf", mimeType: "application/pdf", bytes: oversized }, uploadConfig), DocumentInputError);
});

test("student document mutation is allowed in draft and requested-revision states", () => {
  assert.equal(canMutateDocumentsInStatus("DRAFT"), true);
  assert.equal(canMutateDocumentsInStatus("DOCUMENT_REVISION_REQUIRED"), true);
  assert.equal(canMutateDocumentsInStatus("SUBMITTED"), false);
});

test("student document delete guard matches both editable application states", () => {
  assert.deepEqual(editableDocumentApplicationWhere("application-1", "student-1", "DRAFT"), { id: "application-1", studentId: "student-1", status: "DRAFT" });
  assert.deepEqual(editableDocumentApplicationWhere("application-1", "student-1", "DOCUMENT_REVISION_REQUIRED"), { id: "application-1", studentId: "student-1", status: "DOCUMENT_REVISION_REQUIRED" });
  assert.equal(editableDocumentApplicationWhere("application-1", "student-1", "SUBMITTED"), null);
});

test("document review advances only the document stage and never regresses later application stages", () => {
  assert.equal(resolveApplicationStatusAfterDocumentReview({ currentStatus: "SUBMITTED", reviewedStatus: "VERIFIED", reviewedDocumentRequired: true, requiredDocumentsComplete: false }), "WAITING_DOCUMENT_VERIFICATION");
  assert.equal(resolveApplicationStatusAfterDocumentReview({ currentStatus: "WAITING_DOCUMENT_VERIFICATION", reviewedStatus: "VERIFIED", reviewedDocumentRequired: true, requiredDocumentsComplete: true }), "DOCUMENT_VERIFIED");
  assert.equal(resolveApplicationStatusAfterDocumentReview({ currentStatus: "DOCUMENT_VERIFIED", reviewedStatus: "REVISION_REQUIRED", reviewedDocumentRequired: true, requiredDocumentsComplete: false }), null);
  assert.equal(resolveApplicationStatusAfterDocumentReview({ currentStatus: "PAYMENT_VERIFIED", reviewedStatus: "REVISION_REQUIRED", reviewedDocumentRequired: true, requiredDocumentsComplete: false }), null);
  assert.equal(resolveApplicationStatusAfterDocumentReview({ currentStatus: "WAITING_DOCUMENT_VERIFICATION", reviewedStatus: "REJECTED", reviewedDocumentRequired: false, requiredDocumentsComplete: false }), null);
});

test("storage upload failure does not create a database record", async () => {
  let persisted = false;
  const storage = { async upload() { throw new Error("storage unavailable"); }, async download() { return pdfBytes; }, async delete() {} };
  await assert.rejects(uploadWithCompensation(storage, "object", pdfBytes, "application/pdf", async () => { persisted = true; }), /storage unavailable/);
  assert.equal(persisted, false);
});

test("database create failure compensates by deleting the uploaded object", async () => {
  let deleted = false;
  const storage = { async upload() {}, async download() { return pdfBytes; }, async delete() { deleted = true; } };
  await assert.rejects(uploadWithCompensation(storage, "object", pdfBytes, "application/pdf", async () => { throw new Error("database unavailable"); }), /database unavailable/);
  assert.equal(deleted, true);
});

test("document download reads the stored object and database delete failure restores it", async () => {
  let downloaded = false; let deleted = false; let restored = false;
  const storage = {
    async upload() { restored = true; },
    async download() { downloaded = true; return pdfBytes; },
    async delete() { deleted = true; },
  };
  await assert.rejects(deleteWithCompensation(storage, "object", "application/pdf", async () => { throw new Error("database unavailable"); }), /database unavailable/);
  assert.equal(downloaded, true); assert.equal(deleted, true); assert.equal(restored, true);
});

test("failed storage compensation invokes a reconciliation callback", async () => {
  let cleanupRecorded = false;
  const uploadStorage = { async upload() {}, async download() { return pdfBytes; }, async delete() { throw new Error("delete unavailable"); } };
  await assert.rejects(uploadWithCompensation(uploadStorage, "object", pdfBytes, "application/pdf", async () => { throw new Error("database unavailable"); }, async () => { cleanupRecorded = true; }), /database unavailable/);
  assert.equal(cleanupRecorded, true);
  cleanupRecorded = false;
  const deleteStorage = { async upload() { throw new Error("restore unavailable"); }, async download() { return pdfBytes; }, async delete() {} };
  await assert.rejects(deleteWithCompensation(deleteStorage, "object", "application/pdf", async () => { throw new Error("database unavailable"); }, async () => { cleanupRecorded = true; }), /database unavailable/);
  assert.equal(cleanupRecorded, true);
});

test("admin verification accepts persisted review states and sanitizes optional notes", () => {
  assert.deepEqual(parseDocumentVerification("REVISION_REQUIRED", "  Scan buram  "), { status: "REVISION_REQUIRED", notes: "Scan buram" });
  assert.deepEqual(parseDocumentVerification("VERIFIED", ""), { status: "VERIFIED", notes: null });
  assert.throws(() => parseDocumentVerification("PENDING", ""), DocumentInputError);
});

test("admin verification persists document status and actor history together", async () => {
  const operations: string[] = [];
  const document = await applyDocumentVerification({
    async updateDocument() { operations.push("status"); return { count: 1 }; },
    async createHistory() { operations.push("history"); },
    async updateApplicationStatus() { operations.push("application-status"); },
    async createAudit() { operations.push("audit"); },
    async findDocument() { operations.push("read"); return { id: "doc-1", status: "VERIFIED" }; },
    notFoundError: new Error("not found"),
  });
  assert.deepEqual(document, { id: "doc-1", status: "VERIFIED" });
  assert.deepEqual(operations, ["status", "history", "application-status", "audit", "read"]);
});

test("document API maps missing authentication to a safe unauthorized response", () => {
  assert.deepEqual(documentErrorDetails("AuthenticationRequiredError"), { status: 401, message: "Autentikasi diperlukan." });
});
