import assert from "node:assert/strict";
import test from "node:test";
import { isSafeDemoSeedDatabaseUrl, isSafeLocalTestDatabaseUrl } from "../../services/database/database-safety";

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

test("demo seed requires a PostgreSQL database name marker and an exact host/database allowlist", () => {
  const localUrl = "postgresql://user:pass@localhost:5432/spmb_demo";
  const neonUrl = "postgresql://user:pass@ep-spmb-demo-123.neon.tech:5432/spmb_demo?sslmode=require";
  assert.equal(isSafeDemoSeedDatabaseUrl(localUrl, "localhost/spmb_demo"), true);
  assert.equal(isSafeDemoSeedDatabaseUrl(neonUrl, "ep-spmb-demo-123.neon.tech/spmb_demo"), true);
  assert.equal(isSafeDemoSeedDatabaseUrl(neonUrl, "ep-primary-123.neon.tech/spmb_demo"), false);
  assert.equal(isSafeDemoSeedDatabaseUrl("postgresql://user:pass@ep-spmb-demo-123.neon.tech:5432/spmb", "ep-spmb-demo-123.neon.tech/spmb"), false);
  assert.equal(isSafeDemoSeedDatabaseUrl("postgresql://user:pass@ep-spmb-demo-123.neon.tech:5432/spmb_demo?host=production.example", "ep-spmb-demo-123.neon.tech/spmb_demo"), false);
  assert.equal(isSafeDemoSeedDatabaseUrl("mysql://user:pass@localhost:3306/spmb_demo", "localhost/spmb_demo"), false);
  assert.equal(isSafeDemoSeedDatabaseUrl(neonUrl, undefined), false);
  assert.equal(isSafeDemoSeedDatabaseUrl(undefined, "localhost/spmb_demo"), false);
});
