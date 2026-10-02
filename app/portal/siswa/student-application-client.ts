"use client";

import { useEffect, useState } from "react";

export type StudentApplicationDraft = {
  status: "DRAFT" | "SUBMITTED";
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
  return result as T;
}

export async function fetchCurrentDraftApplication() {
  const response = await fetch("/api/student/application/draft", { cache: "no-store" });
  return parseResponse<StudentApplicationDraft>(response);
}

export async function fetchAvailableStudyPrograms() {
  const response = await fetch("/api/student/programs", { cache: "no-store" });
  const result = await parseResponse<{ programs: StudentStudyProgram[] }>(response);
  return result.programs;
}

export async function saveCurrentDraftApplication(input: unknown) {
  const response = await fetch("/api/student/application/draft", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<StudentApplicationDraft>(response);
}

export async function submitCurrentApplication() {
  const response = await fetch("/api/student/application/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  return parseResponse<StudentApplicationDraft>(response);
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
