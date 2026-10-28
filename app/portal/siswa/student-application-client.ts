"use client";

import { useEffect, useState } from "react";

export type StudentApplicationDraft = {
  status: "DRAFT" | "SUBMITTED" | "WAITING_DOCUMENT_VERIFICATION" | "DOCUMENT_REVISION_REQUIRED" | "DOCUMENT_VERIFIED" | "WAITING_PAYMENT" | "PAYMENT_VERIFIED" | "ELIGIBLE_FOR_TKA" | "TKA_STARTED" | "TKA_COMPLETED" | "WAITING_SELECTION" | "PASSED" | "WAITLISTED" | "FAILED" | "REJECTED" | "CANCELLED" | "WITHDRAWN";
  registrationNumber: string | null;
  submittedAt: string | null;
  semester1Average: string | null;
  semester2Average: string | null;
  semester3Average: string | null;
  semester4Average: string | null;
  programChoices: { priority: number; studyProgram: { code: string; name: string } }[];
};

export type StudentStudyProgram = { code: string; name: string };

async function parseResponse<T>(response: Response): Promise<T> {
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || "Data pendaftaran belum dapat dimuat.");
  if (result === null || typeof result !== "object") {
    throw new Error("Respons server tidak sesuai. Muat ulang halaman atau coba lagi beberapa saat.");
  }
  return result as T;
}

function isStudentApplicationDraft(value: unknown): value is StudentApplicationDraft {
  if (typeof value !== "object" || value === null) return false;
  if (!("status" in value) || typeof value.status !== "string") return false;
  if (!("programChoices" in value) || !Array.isArray(value.programChoices)) return false;
  return value.programChoices.every(
    (choice) =>
      typeof choice === "object" &&
      choice !== null &&
      "priority" in choice &&
      typeof choice.priority === "number" &&
      "studyProgram" in choice &&
      typeof choice.studyProgram === "object" &&
      choice.studyProgram !== null &&
      "code" in choice.studyProgram &&
      typeof choice.studyProgram.code === "string" &&
      "name" in choice.studyProgram &&
      typeof choice.studyProgram.name === "string",
  );
}

async function parseDraftResponse(response: Response): Promise<StudentApplicationDraft> {
  const result = await parseResponse<unknown>(response);
  if (!isStudentApplicationDraft(result)) {
    throw new Error("Respons data pendaftaran tidak sesuai. Muat ulang halaman atau coba lagi.");
  }
  return result;
}

export async function fetchCurrentDraftApplication() {
  const response = await fetch("/api/student/application/draft", { cache: "no-store" });
  return parseDraftResponse(response);
}

export async function fetchAvailableStudyPrograms() {
  const response = await fetch("/api/student/programs", { cache: "no-store" });
  const result = await parseResponse<{ programs?: unknown }>(response);
  if (
    !Array.isArray(result.programs) ||
    !result.programs.every(
      (program) =>
        typeof program === "object" &&
        program !== null &&
        "code" in program &&
        typeof program.code === "string" &&
        "name" in program &&
        typeof program.name === "string",
    )
  ) {
    throw new Error("Daftar program keahlian belum dapat dibaca. Muat ulang halaman atau coba lagi.");
  }
  return result.programs as StudentStudyProgram[];
}

export async function saveCurrentDraftApplication(input: unknown) {
  const response = await fetch("/api/student/application/draft", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseDraftResponse(response);
}

export async function submitCurrentApplication(accepted: boolean) {
  const response = await fetch("/api/student/application/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accepted }),
  });
  return parseDraftResponse(response);
}

export function useCurrentDraftApplication() {
  const [application, setApplication] = useState<StudentApplicationDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchCurrentDraftApplication()
      .then((result) => { if (!cancelled) setApplication(result); })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Draft aplikasi belum dapat dimuat.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { application, setApplication, loading, error };
}

export function useAvailableStudyPrograms() {
  const [programs, setPrograms] = useState<StudentStudyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchAvailableStudyPrograms()
      .then((result) => { if (!cancelled) setPrograms(result); })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Program belum dapat dimuat.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { programs, loading, error };
}
