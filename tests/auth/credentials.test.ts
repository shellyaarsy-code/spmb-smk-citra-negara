import assert from "node:assert/strict";
import test from "node:test";
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  isPasswordWithinHashLimit,
  isValidEmail,
  normalizeEmail,
  verifyPassword,
} from "../../services/auth/credentials";

test("normalizes and validates email addresses", () => {
  assert.equal(normalizeEmail("  Student@Example.COM "), "student@example.com");
  assert.equal(isValidEmail("student@example.com"), true);
  assert.equal(isValidEmail("not-an-email"), false);
});

test("respects bcrypt's UTF-8 input limit", () => {
  assert.equal(isPasswordWithinHashLimit("a".repeat(72)), true);
  assert.equal(isPasswordWithinHashLimit("a".repeat(73)), false);
  assert.equal(isPasswordWithinHashLimit("é".repeat(36)), true);
  assert.equal(isPasswordWithinHashLimit("é".repeat(37)), false);
});

test("creates opaque session tokens and stores only their digest", () => {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);

  assert.equal(Buffer.from(token, "base64url").length, 32);
  assert.notEqual(tokenHash, token);
  assert.equal(tokenHash, hashSessionToken(token));
  assert.equal(hashSessionToken(createSessionToken()) === tokenHash, false);
});

test("hashes passwords and verifies matching credentials", async () => {
  const passwordHash = await hashPassword("test-password-not-for-production");

  assert.notEqual(passwordHash, "test-password-not-for-production");
  assert.equal(await verifyPassword("test-password-not-for-production", passwordHash), true);
  assert.equal(await verifyPassword("different-password", passwordHash), false);
});
