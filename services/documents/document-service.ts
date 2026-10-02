import "server-only";
import { RoleName } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { requireRole } from "../auth/authorization";
import { getCurrentStudentId } from "../student/student-service";
import { activeDocumentTypesWhere, currentStudentDocumentsWhere } from "./document-policy";

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
  return prisma.document.findMany({
    where: currentStudentDocumentsWhere(studentId),
    orderBy: [{ uploadedAt: "desc" }, { createdAt: "desc" }],
    select: {
      fileName: true,
      mimeType: true,
      uploadedAt: true,
      status: true,
      documentType: { select: { code: true, name: true } },
    },
  });
}
