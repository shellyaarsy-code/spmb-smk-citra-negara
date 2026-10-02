export class StudentRecordMissingError extends Error {
  constructor() {
    super("Student record is missing");
    this.name = "StudentRecordMissingError";
  }
}

export async function resolveOwnedStudentId(
  authenticatedUserId: string,
  findStudentByUserId: (userId: string) => Promise<{ id: string } | null>,
) {
  const student = await findStudentByUserId(authenticatedUserId);
  if (!student) throw new StudentRecordMissingError();
  return student.id;
}
