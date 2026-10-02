"use client";

import { useEffect, useState } from "react";

export type StudentProfileData = Record<string, string | null>;
export type GuardianType = "FATHER" | "MOTHER" | "OTHER";
export type StudentGuardianData = {
  guardianType: GuardianType;
  guardianName: string | null;
  relationship: string | null;
  occupation: string | null;
  incomeBracket: string | null;
  nik: string | null;
  phoneNumber: string | null;
  email: string | null;
  address: string | null;
};
export type StudentDataResponse = {
  profile: StudentProfileData | null;
  guardians: StudentGuardianData[];
};

export function useCurrentStudentData() {
  const [data, setData] = useState<StudentDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchCurrentStudentData()
      .then((result) => { if (!cancelled) setData(result); })
      .catch(() => { if (!cancelled) setError("Data profil belum dapat dimuat. Coba muat ulang halaman."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

export async function fetchCurrentStudentData(): Promise<StudentDataResponse> {
  const response = await fetch("/api/student/profile", { cache: "no-store" });
  if (!response.ok) throw new Error("Data profil belum dapat dimuat.");
  return response.json() as Promise<StudentDataResponse>;
}

export function toStudentFormValues(data: StudentDataResponse) {
  const profile = data.profile ?? {};
  const values: Record<string, string> = {};

  for (const [key, value] of Object.entries(profile)) {
    values[key] = value ?? "";
  }

  values.streetAddress = values.address ?? "";
  values.schoolName = values.schoolOrigin ?? "";
  values.birthDate = values.birthDate?.slice(0, 10) ?? "";

  for (const guardian of data.guardians) {
    const prefix = guardian.guardianType === "FATHER" ? "father" : guardian.guardianType === "MOTHER" ? "mother" : "otherGuardian";
    values[`${prefix}Name`] = guardian.guardianName ?? "";
    values[`${prefix}Occupation`] = guardian.occupation ?? "";
    values[`${prefix}Income`] = guardian.incomeBracket ?? "";
  }

  values.parentWhatsapp = values.parentWhatsapp ?? "";
  return values;
}

export function applyStudentFormValues(form: HTMLFormElement, values: Record<string, string>) {
  for (const element of Array.from(form.elements)) {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)) continue;
    if (!element.name || !(element.name in values) || element.type === "file") continue;
    if (element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio")) continue;
    element.value = values[element.name];
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }
}
