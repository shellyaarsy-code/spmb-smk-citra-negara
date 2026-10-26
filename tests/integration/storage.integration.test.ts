import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { del, get, put } from "@vercel/blob";

const storeName = process.env.SPMB_TEST_BLOB_STORE_NAME;
const token = process.env.SPMB_TEST_BLOB_READ_WRITE_TOKEN;
const writesAllowed = process.env.SPMB_TEST_STORAGE_WRITES === "ALLOW_TEST_BUCKET_WRITES";
const configured = Boolean(token && storeName && /(?:^|[-_])(demo|test|testing|dev|development|local)(?:$|[-_])/i.test(storeName) && writesAllowed);

test("private Vercel Blob test store upload, download, and delete", { skip: !configured }, async () => {
  const objectPath = `__integration_tests__/${randomUUID()}.pdf`;
  const bytes = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF\n", "utf8");
  let uploaded = false;
  try {
    const blob = await put(objectPath, bytes, { access: "private", addRandomSuffix: false, allowOverwrite: false, contentType: "application/pdf", token: token! });
    uploaded = true;
    assert.equal(blob.pathname, objectPath, "test blob uses only its unique integration-test path");

    const downloaded = await get(objectPath, { access: "private", token: token! });
    assert.ok(downloaded && downloaded.statusCode === 200, "private test object is readable by the test token");
    assert.deepEqual(Buffer.from(await new Response(downloaded.stream).arrayBuffer()), bytes, "downloaded bytes match upload");
  } finally {
    if (uploaded) await del(objectPath, { token: token! });
  }
});
