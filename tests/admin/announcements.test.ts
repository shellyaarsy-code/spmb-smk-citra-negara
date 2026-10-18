import assert from "node:assert/strict";
import test from "node:test";
import { parseAnnouncementInput, parseAnnouncementStatus, AnnouncementInputError } from "../../services/admin/announcement-policy";

test("announcement content is trimmed and bounded before persistence", () => {
  assert.deepEqual(parseAnnouncementInput({ title: "  Jadwal  ", content: "  Informasi\n  " }), { title: "Jadwal", content: "Informasi" });
  assert.throws(() => parseAnnouncementInput({ title: "", content: "Isi" }), AnnouncementInputError);
  assert.throws(() => parseAnnouncementInput({ title: "Judul", content: " " }), AnnouncementInputError);
  assert.throws(() => parseAnnouncementInput({ title: "x".repeat(201), content: "Isi" }), AnnouncementInputError);
  assert.throws(() => parseAnnouncementInput({ title: "Judul", content: "x".repeat(10001) }), AnnouncementInputError);
  assert.throws(() => parseAnnouncementInput(null), AnnouncementInputError);
});

test("only publish and archive are accepted as status transitions", () => {
  assert.equal(parseAnnouncementStatus("PUBLISHED"), "PUBLISHED");
  assert.equal(parseAnnouncementStatus("ARCHIVED"), "ARCHIVED");
  assert.throws(() => parseAnnouncementStatus("DRAFT"), AnnouncementInputError);
  assert.throws(() => parseAnnouncementStatus("FAKE"), AnnouncementInputError);
});
