import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";

const storageUrl = process.env.SPMB_TEST_SUPABASE_URL;
const serviceRoleKey = process.env.SPMB_TEST_SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SPMB_TEST_SUPABASE_BUCKET;
const writesAllowed = process.env.SPMB_TEST_STORAGE_WRITES === "ALLOW_TEST_BUCKET_WRITES";
const configured = Boolean(storageUrl && serviceRoleKey && bucketName && writesAllowed);

function isLoopback(hostname: string) { return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname); }
function privateHeaders(contentType?: string) {
  return { apikey: serviceRoleKey!, Authorization: `Bearer ${serviceRoleKey}`, ...(contentType ? { "Content-Type": contentType } : {}) };
}
function objectUrl(objectPath = "") {
  const url = storageUrl!.replace(/\/$/, "");
  return `${url}/storage/v1/object/${encodeURIComponent(bucketName!)}${objectPath ? "/" + objectPath.split("/").map(encodeURIComponent).join("/") : ""}`;
}
async function removeObject(objectPath: string) {
  return fetch(objectUrl(), { method: "DELETE", headers: { ...privateHeaders("application/json") }, body: JSON.stringify({ prefixes: [objectPath] }) });
}

test("private Supabase test bucket upload, download, and delete", { skip: !configured }, async () => {
  const parsed = new URL(storageUrl!);
  const allowedProtocol = parsed.protocol === "https:" || (parsed.protocol === "http:" && isLoopback(parsed.hostname));
  assert.ok(allowedProtocol && !parsed.username && !parsed.password && !parsed.search && !parsed.hash, "test storage URL must be HTTPS (or local loopback) without embedded credentials or overrides");
  assert.match(bucketName!, /(?:^|[-_])(test|testing|dev|development|local)(?:$|[-_])/i, "bucket name must explicitly identify a test/dev/local bucket");

  const bucketResponse = await fetch(`${parsed.origin}/storage/v1/bucket/${encodeURIComponent(bucketName!)}`, { headers: privateHeaders() });
  assert.equal(bucketResponse.ok, true, "test bucket must be reachable with the configured server credential");
  const bucket = await bucketResponse.json() as { public?: unknown };
  assert.equal(bucket.public, false, "test bucket must be private");

  const objectPath = `__integration_tests__/${randomUUID()}.pdf`;
  const bytes = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF\n", "utf8");
  let uploaded = false;
  try {
    const upload = await fetch(objectUrl(objectPath), { method: "POST", headers: { ...privateHeaders("application/pdf"), "x-upsert": "false" }, body: bytes });
    assert.equal(upload.ok, true, "test object upload succeeded");
    uploaded = true;

    const download = await fetch(objectUrl(objectPath), { headers: privateHeaders() });
    assert.equal(download.ok, true, "test object download succeeded");
    assert.deepEqual(Buffer.from(await download.arrayBuffer()), bytes, "downloaded bytes match upload");
  } finally {
    if (uploaded) {
      const deletion = await removeObject(objectPath);
      assert.equal(deletion.ok, true, "test object cleanup succeeded");
    }
  }
});
