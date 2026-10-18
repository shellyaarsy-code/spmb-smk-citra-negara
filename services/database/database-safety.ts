export function isSafeLocalTestDatabaseUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ""));
    const isPostgres = url.protocol === "postgresql:" || url.protocol === "postgres:";
    const isLoopback = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    const hasConnectionOverride = ["host", "hostaddr", "port"].some((key) => url.searchParams.has(key));
    const looksProduction = /(?:^|[-_])(prod|production|prd|live|primary)(?:$|[-_])/i.test(databaseName);
    const explicitlyNonProduction = /(?:^|[-_])(test|testing|dev|development|local)(?:$|[-_])/i.test(databaseName);
    return isPostgres && isLoopback && !hasConnectionOverride && !looksProduction && explicitlyNonProduction;
  } catch {
    return false;
  }
}
