import assert from "node:assert/strict";
import test from "node:test";
import { activeDocumentTypesWhere, currentStudentDocumentsWhere } from "../../services/documents/document-policy";

test("document query ownership is scoped through the owning application", () => {
  assert.deepEqual(currentStudentDocumentsWhere("session-owned-student"), {
    application: { studentId: "session-owned-student" },
  });
});

test("student document types query only active records and never grants mutations", () => {
  assert.deepEqual(activeDocumentTypesWhere(), { isActive: true });
});
