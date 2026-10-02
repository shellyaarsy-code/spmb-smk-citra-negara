export function currentStudentDocumentsWhere(studentId: string) {
  return { application: { studentId } };
}

export function activeDocumentTypesWhere() {
  return { isActive: true } as const;
}
