# Safe local database verification

PostgreSQL/Prisma is the application's database. Integration checks use only the explicitly configured disposable test database and never fall back to the application's `DATABASE_URL`.

## Preconditions

1. Create or select a disposable local PostgreSQL database with a name such as `spmb_test` or `spmb_dev`.
2. Set `SPMB_TEST_DATABASE_URL` only in the local development process. Do not copy a production URL into it.
3. The integration test checks that the URL uses a loopback host and a database name explicitly marked test/development/local. It does not use a diagnostic HTTP endpoint.

The endpoint does not migrate, seed, or write to the database. The database integration test is opt-in and uses only SPMB_TEST_DATABASE_URL; it never falls back to .env DATABASE_URL. It requires SPMB_TEST_DATABASE_WRITES=ALLOW_DISPOSABLE_DATABASE, checks the local/test URL before connecting, runs a read-only SELECT 1, and keeps all fixture writes inside a transaction that is intentionally rolled back. The test requires the existing SISWA role and at least two active study programs, so provision migrations and seed data only after confirming this is a disposable database.

## Current verification boundary

Unit and policy tests run without a database. Query, transaction, and ownership integration tests are available through npm run test:integration:db; without the explicit URL and write opt-in they are skipped. Real PostgreSQL verification remains pending until a dedicated disposable database and its schema are available.

## Windows PowerShell: disposable PostgreSQL test setup

1. Create a new local PostgreSQL database in pgAdmin or another trusted local tool. Choose a name containing a clear test, dev, or local segment (for example spmb_citra_test). Confirm the server is local and the database contains no needed data. Do not repoint .env at an unknown database.
2. Provide SPMB_TEST_DATABASE_URL to the current PowerShell process using the connection details you confirmed locally. Set SPMB_TEST_DATABASE_WRITES to ALLOW_DISPOSABLE_DATABASE only after confirming the target is disposable. Do not commit these values or paste them into logs.
3. Only after that confirmation, target Prisma CLI commands at the same database by setting $env:DATABASE_URL = $env:SPMB_TEST_DATABASE_URL, then run npm run prisma:validate and npx prisma migrate deploy. Migrations change schema; do not use migrate reset.
4. The repository seed creates roles and active program records required by the database integration test. Run npm run prisma:seed only against this confirmed disposable database. No seed or migration has been run as part of this audit.
5. Run npm run test:integration:db. The fixture transaction is rolled back. Clear the process variables when finished.

## Optional Supabase Storage test bucket

The storage integration test uses only SPMB_TEST_SUPABASE_URL, SPMB_TEST_SUPABASE_SERVICE_ROLE_KEY, and SPMB_TEST_SUPABASE_BUCKET; it does not fall back to the application storage settings. Configure a separate Supabase test project or isolated test bucket, make the bucket private, and use a bucket name with a test, dev, or local segment. Set SPMB_TEST_STORAGE_WRITES to ALLOW_TEST_BUCKET_WRITES only when the bucket is confirmed safe for temporary upload/delete testing. Then run npm run test:integration:storage. It verifies bucket privacy and performs upload, download, and cleanup. Keep the credential server-side; never use a NEXT_PUBLIC_ name. Without all four settings, the test is skipped and makes no network request.
