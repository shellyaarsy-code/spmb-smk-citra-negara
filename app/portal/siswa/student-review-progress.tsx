"use client";

import { useEffect, useState } from "react";
import { deferStudentDraftHydration, readStudentDraft } from "./student-application-draft";
import { toStudentFormValues, useCurrentStudentData } from "./student-profile-client";
import { useCurrentDraftApplication } from "./student-application-client";
import { useAvailableDocumentTypes, useStudentDocuments } from "./student-documents-client";

const stages = [
  { label: "Biodata Diri", fields: ["nik", "nisn", "fullName", "gender", "birthPlace", "birthDate", "religion", "familyCardNumber", "familyStatus", "citizenship", "streetAddress", "province", "city", "district", "village", "postalCode"] },
  { label: "Orang Tua & Akademik", fields: ["fatherName", "fatherOccupation", "fatherIncome", "motherName", "motherOccupation", "motherIncome", "parentWhatsapp", "schoolNpsn", "schoolName", "schoolType", "schoolStatus", "graduationYear", "semester1Average", "semester2Average", "semester3Average", "semester4Average"] },
  { label: "Pilihan Jurusan", fields: ["primaryProgram", "backupProgram"] },
];

export default function StudentReviewProgress({ currentStage = 4, completedThrough, labels }: { currentStage?: number; completedThrough?: number; labels?: string[] }) {
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const { data } = useCurrentStudentData();
  const { application } = useCurrentDraftApplication();
  const { documents, loading: documentsLoading } = useStudentDocuments();
  const { documentTypes, loading: documentTypesLoading } = useAvailableDocumentTypes();

  useEffect(() => deferStudentDraftHydration(() => {
    const draft = readStudentDraft();
    setDraftValues(draft.values);
  }), []);

  const applicationValues: Record<string, string> = application ? {
    semester1Average: application.semester1Average ?? "",
    semester2Average: application.semester2Average ?? "",
    semester3Average: application.semester3Average ?? "",
    semester4Average: application.semester4Average ?? "",
    primaryProgram: application.programChoices.find((choice) => choice.priority === 1)?.studyProgram.code ?? "",
    backupProgram: application.programChoices.find((choice) => choice.priority === 2)?.studyProgram.code ?? "",
  } : {};
  const values: Record<string, string> = { ...draftValues, ...applicationValues, ...(data ? toStudentFormValues(data) : {}) };
  const requiredTypes = documentTypes.filter((documentType) => documentType.required);
  const requiredDocumentsComplete = !documentsLoading && !documentTypesLoading && requiredTypes.every((documentType) =>
    documents.some((document) => document.documentType.code === documentType.code),
  );

  const progress = [
    ...stages.map((stage) => ({ label: stage.label, complete: stage.fields.every((field) => Boolean(values[field]?.trim())) })),
    { label: "Unggah Berkas", complete: requiredDocumentsComplete },
    { label: "Review & Submit", complete: false },
  ];
  const additionalStages = (labels ?? []).slice(progress.length).map((label) => ({ label, complete: false }));
  const displayProgress = [...progress, ...additionalStages];

  return <>
    {displayProgress.map((stage, index) => {
      const complete = completedThrough !== undefined && index <= completedThrough ? true : stage.complete;
      const state = index === currentStage ? "current" : index < currentStage ? complete ? "complete" : "incomplete" : "upcoming";
      return (
        <div className={`student-progress-stage ${state}`} key={stage.label}>
          <span className="student-progress-marker" aria-hidden="true">{complete ? "✓" : index + 1}</span>
          <span className="student-progress-label">{labels?.[index] ?? stage.label}</span>
          {index < displayProgress.length - 1 && <span className="student-progress-line" aria-hidden="true" />}
        </div>
      );
    })}
  </>;
}
