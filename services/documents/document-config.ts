export type DocumentConfiguration = {
  allowedMimeTypes: string[];
  maxFileSizeBytes: number;
};

export function getDocumentConfiguration(env: NodeJS.ProcessEnv = process.env): DocumentConfiguration | null {
  const hasVercelBlobConnection = env.VERCEL === "1" && Boolean(env.BLOB_STORE_ID?.trim());
  const hasLocalBlobToken = Boolean(env.BLOB_READ_WRITE_TOKEN?.trim());
  if (!hasVercelBlobConnection && !hasLocalBlobToken) return null;

  const allowedMimeTypes = (env.SPMB_DOCUMENT_ALLOWED_MIME_TYPES ?? "application/pdf,image/jpeg,image/png")
    .split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  const configuredMaxFileSize = env.SPMB_DOCUMENT_MAX_FILE_SIZE_BYTES?.trim();
  const maxFileSizeBytes = configuredMaxFileSize ? Number(configuredMaxFileSize) : 4 * 1024 * 1024;

  const supportedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
  if (!allowedMimeTypes.length || allowedMimeTypes.some((type) => !supportedMimeTypes.has(type)) || !Number.isSafeInteger(maxFileSizeBytes) || maxFileSizeBytes <= 0) return null;
  return { allowedMimeTypes, maxFileSizeBytes };
}

export function documentUploadConfigurationStatus(env: NodeJS.ProcessEnv = process.env) {
  const config = getDocumentConfiguration(env);
  return config ? { enabled: true, allowedMimeTypes: config.allowedMimeTypes, maxFileSizeBytes: config.maxFileSizeBytes } : { enabled: false, allowedMimeTypes: [], maxFileSizeBytes: null };
}
