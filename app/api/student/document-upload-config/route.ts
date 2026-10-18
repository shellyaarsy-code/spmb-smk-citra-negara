import { documentUploadConfigurationStatus } from "../../../../services/documents/document-config";
import { getAvailableStudentDocumentTypes } from "../../../../services/documents/document-service";
import { documentErrorResponse } from "../../../../services/documents/document-http";
import { documentStorage } from "../../../../services/documents/document-storage";

export async function GET() {
  try {
    const [configuration, documentTypes, storageAvailable] = await Promise.all([Promise.resolve(documentUploadConfigurationStatus()), getAvailableStudentDocumentTypes(), documentStorage.isAvailable()]);
    return Response.json({ ...configuration, enabled: configuration.enabled && storageAvailable && documentTypes.length > 0 }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return documentErrorResponse(error); }
}
