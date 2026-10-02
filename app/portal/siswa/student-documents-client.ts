"use client";

import { useEffect, useState } from "react";

export type StudentDocumentType = {
  code: string;
  name: string;
  description: string | null;
  required: boolean;
};

export type StudentDocumentRecord = {
  fileName: string;
  mimeType: string | null;
  uploadedAt: string;
  status: string;
  documentType: { code: string; name: string };
};

async function getResponse<T>(url: string, key: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || "Data dokumen belum dapat dimuat.");
  return result[key] as T;
}

export function useStudentDocuments() {
  const [documents, setDocuments] = useState<StudentDocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return { documents, loading, error };
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
