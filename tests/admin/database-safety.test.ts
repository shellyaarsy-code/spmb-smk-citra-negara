import assert from "node:assert/strict";
import test from "node:test";
import { isSafeLocalTestDatabaseUrl } from "../../services/database/database-safety";

test("database preflight accepts only explicitly named loopback PostgreSQL test targets", () => {
  assert.equal(isSafeLocalTestDatabaseUrl("postgresql://test:test@127.0.0.1:5432/spmb_test"), true);
  assert.equal(isSafeLocalTestDatabaseUrl("postgres://test:test@localhost:5432/spmb_dev"), true);
  assert.equal(isSafeLocalTestDatabaseUrl("postgresql://user:pass@localhost:5432/spmb"), false);
  assert.equal(isSafeLocalTestDatabaseUrl("postgresql://user:pass@localhost:5432/spmb_prod_test"), false);
  assert.equal(isSafeLocalTestDatabaseUrl("postgresql://user:pass@localhost:5432/spmb_live_dev"), false);
  assert.equal(isSafeLocalTestDatabaseUrl("postgresql://user:pass@localhost:5432/spmb_test?host=production.example"), false);
  assert.equal(isSafeLocalTestDatabaseUrl("postgresql://user:pass@db.example.test:5432/spmb_test"), false);
  assert.equal(isSafeLocalTestDatabaseUrl("mysql://root:@localhost/spmb_test"), false);
  assert.equal(isSafeLocalTestDatabaseUrl(undefined), false);
});
