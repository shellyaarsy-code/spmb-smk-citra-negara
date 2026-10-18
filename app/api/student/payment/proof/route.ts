import { uploadCurrentPaymentProof, downloadCurrentPaymentProof } from "../../../../../services/payments/payment-service";
import { paymentErrorResponse } from "../../../../../services/payments/payment-http";
import { documentFileResponse } from "../../../../../services/documents/document-http";
import { getDocumentConfiguration } from "../../../../../services/documents/document-config";
import { DocumentInputError } from "../../../../../services/documents/document-validation";
import { PaymentUnavailableError } from "../../../../../services/payments/payment-policy";

export async function GET() {
  try { return documentFileResponse(await downloadCurrentPaymentProof()); }
  catch (error) { return paymentErrorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const config = getDocumentConfiguration();
    if (!config) throw new PaymentUnavailableError();
    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > config.maxFileSizeBytes + 65_536) throw new DocumentInputError();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new DocumentInputError();
    if (file.size > config.maxFileSizeBytes) throw new DocumentInputError();
    const payment = await uploadCurrentPaymentProof({ fileName: file.name, mimeType: file.type, size: file.size, bytes: new Uint8Array(await file.arrayBuffer()) });
    return Response.json({ payment }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return paymentErrorResponse(error); }
}
