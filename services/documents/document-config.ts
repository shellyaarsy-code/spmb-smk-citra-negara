export type DocumentConfiguration = {
  supabaseUrl: string;
  serviceRoleKey: string;
  bucket: string;
  allowedMimeTypes: string[];
  maxFileSizeBytes: number;
};

export function getDocumentConfiguration(env: NodeJS.ProcessEnv = process.env): DocumentConfiguration | null {
  const supabaseUrl = env.SUPABASE_URL?.trim();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = env.SUPABASE_STORAGE_BUCKET?.trim();
  const allowedMimeTypes = env.SPMB_DOCUMENT_ALLOWED_MIME_TYPES?.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean) ?? [];
  const maxFileSizeBytes = Number(env.SPMB_DOCUMENT_MAX_FILE_SIZE_BYTES);

  const supportedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
  if (!supabaseUrl || !serviceRoleKey || !bucket || !allowedMimeTypes.length || allowedMimeTypes.some((type) => !supportedMimeTypes.has(type)) || !Number.isSafeInteger(maxFileSizeBytes) || maxFileSizeBytes <= 0) return null;
  try {
    const parsed = new URL(supabaseUrl);
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") return null;
  } catch {
    return null;
  }
  return { supabaseUrl: supabaseUrl.replace(/\/$/, ""), serviceRoleKey, bucket, allowedMimeTypes, maxFileSizeBytes };
}

export function documentUploadConfigurationStatus(env: NodeJS.ProcessEnv = process.env) {
  const config = getDocumentConfiguration(env);
  return config ? { enabled: true, allowedMimeTypes: config.allowedMimeTypes, maxFileSizeBytes: config.maxFileSizeBytes } : { enabled: false, allowedMimeTypes: [], maxFileSizeBytes: null };
}
