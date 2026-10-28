"use client";

import { useEffect, useState } from "react";

export type StudentDocumentType = {
  code: string;
  name: string;
  description: string | null;
  required: boolean;
};

export type StudentDocumentRecord = {
  id: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  uploadedAt: string;
  status: string;
  canDelete: boolean;
  documentType: { code: string; name: string };
};

async function getResponse<T>(url: string, key: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error
        : "Data dokumen belum dapat dimuat.";
    throw new Error(message);
  }
  if (
    typeof result !== "object" ||
    result === null ||
    !(key in result) ||
    !Array.isArray(result[key])
  ) {
    throw new Error("Respons data dokumen tidak sesuai. Muat ulang halaman atau coba lagi.");
  }
  return result[key] as T;
}

export function useStudentDocuments() {
  const [documents, setDocuments] = useState<StudentDocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try { setDocuments(await getResponse<StudentDocumentRecord[]>("/api/student/documents", "documents")); }
    catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "Data dokumen belum dapat dimuat."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    let cancelled = false;
    getResponse<StudentDocumentRecord[]>("/api/student/documents", "documents")
      .then((result) => { if (!cancelled) setDocuments(result); })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Data dokumen belum dapat dimuat.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { documents, loading, error, refresh };
}

export function useAvailableDocumentTypes() {
  const [documentTypes, setDocumentTypes] = useState<StudentDocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getResponse<StudentDocumentType[]>("/api/student/document-types", "documentTypes")
      .then((result) => { if (!cancelled) setDocumentTypes(result); })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Tipe dokumen belum dapat dimuat.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { documentTypes, loading, error };
}
