import { AuditAction, RoleName } from "@prisma/client";
import { documentStorage } from "../../../../services/documents/document-storage";
import { canProvisionDemoDocumentTypes } from "../../../../services/documents/document-policy";
import { prisma } from "../../../../db/prisma";
import { requireRole } from "../../../../services/auth/authorization";
import { documentErrorResponse } from "../../../../services/documents/document-http";

const demoDocumentTypes = [
  { code: "DEMO-KK", name: "Kartu Keluarga (contoh)", required: true, description: "Jenis dokumen untuk simulasi. Unggah berkas fiktif saja.", isActive: true },
  { code: "DEMO-RAPOR", name: "Rapor (contoh)", required: true, description: "Jenis dokumen untuk simulasi. Unggah berkas fiktif saja.", isActive: true },
  { code: "DEMO-FOTO", name: "Pas foto (contoh)", required: true, description: "Jenis dokumen untuk simulasi. Unggah berkas fiktif saja.", isActive: true },
] as const;

export async function POST() {
  if (!canProvisionDemoDocumentTypes()) {
    return Response.json({ error: "Konfigurasi hanya tersedia pada Preview mode demo." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const actor = await requireRole(RoleName.ADMIN);
    if (!await documentStorage.isAvailable()) {
      return Response.json({ error: "Storage privat Preview belum dapat dijangkau; database tidak diubah." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    const result = await prisma.$transaction(async (tx) => {
      const codes = demoDocumentTypes.map(({ code }) => code);
      const existing = await tx.documentType.findMany({ where: { code: { in: codes } }, select: { code: true, name: true, required: true, description: true, isActive: true } });
      const byCode = new Map(existing.map((item) => [item.code, item]));
      const matchesExpected = (actual: typeof existing[number] | undefined, expected: typeof demoDocumentTypes[number]) =>
        Boolean(actual && actual.name === expected.name && actual.required === expected.required && actual.description === expected.description && actual.isActive === expected.isActive);
      if (demoDocumentTypes.some((expected) => byCode.has(expected.code) && !matchesExpected(byCode.get(expected.code), expected))) {
        throw new DemoDocumentTypeConflictError();
      }

      const missing = demoDocumentTypes.filter(({ code }) => !byCode.has(code));
      const created = missing.length ? await tx.documentType.createMany({ data: missing, skipDuplicates: true }) : { count: 0 };
      const finalRows = await tx.documentType.findMany({ where: { code: { in: codes } }, select: { code: true, name: true, required: true, description: true, isActive: true } });
      const finalByCode = new Map(finalRows.map((item) => [item.code, item]));
      if (demoDocumentTypes.some((expected) => !matchesExpected(finalByCode.get(expected.code), expected))) {
        throw new DemoDocumentTypeConflictError();
      }
      if (created.count) {
        await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "DOCUMENT_TYPE", entityId: "DEMO-DOCUMENT-TYPES", action: AuditAction.CREATE, details: { createdCodes: missing.map(({ code }) => code) } } });
      }
      return { created: created.count, total: finalRows.length };
    });
    return Response.json({ ...result, storageAvailable: true, message: result.created ? "Tipe dokumen demo berhasil diaktifkan." : "Tipe dokumen demo sudah aktif." }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof DemoDocumentTypeConflictError) return Response.json({ error: "Kode tipe dokumen demo sudah dipakai oleh konfigurasi lain. Data tidak diubah." }, { status: 409, headers: { "Cache-Control": "no-store" } });
    return documentErrorResponse(error);
  }
}

class DemoDocumentTypeConflictError extends Error {
  constructor() { super("Demo document type conflict"); this.name = "DemoDocumentTypeConflictError"; }
}