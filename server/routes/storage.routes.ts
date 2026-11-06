import { z } from 'zod';
import { storageService } from '../services/storage.service.ts';
import { authenticateRequest } from '../middleware/auth.ts';
import { parseJsonBody } from '../middleware/validate.ts';
import { jsonResponse, errorResponse } from '../lib/response.ts';
import { handleRouteError } from '../middleware/errorHandler.ts';

const uploadSchema = z.object({
  bucket: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  base64Data: z.string().min(1, 'Base64 file data is required'),
});

const deleteFileSchema = z.object({
  bucket: z.string().min(1),
  path: z.string().min(1),
});

export async function handleUploadFile(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const contentType = req.headers.get('content-type') || '';

  // 1. If JSON base64 upload
  if (contentType.includes('application/json')) {
    const parsed = await parseJsonBody(req, uploadSchema);
    if ('response' in parsed) return parsed.response;

    try {
      const buffer = Buffer.from(parsed.data.base64Data, 'base64');
      const result = await storageService.uploadFile(
        parsed.data.bucket,
        buffer,
        parsed.data.fileName,
        parsed.data.mimeType,
        auth.user.id
      );
      return jsonResponse(result, 201);
    } catch (err) {
      return handleRouteError(err, 'Upload file error');
    }
  }

  // 2. If FormData multipart upload
  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const bucket = (formData.get('bucket') as string) || 'avatars';

      if (!file) {
        return errorResponse('File not provided in multipart body', 400, 'BAD_REQUEST');
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await storageService.uploadFile(
        bucket,
        buffer,
        file.name,
        file.type,
        auth.user.id
      );
      return jsonResponse(result, 201);
    } catch (err) {
      return handleRouteError(err, 'Multipart file upload error');
    }
  }

  return errorResponse('Unsupported content type for upload', 415, 'UNSUPPORTED_MEDIA_TYPE');
}

export async function handleDeleteFile(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, deleteFileSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const result = await storageService.deleteFile(parsed.data.bucket, parsed.data.path);
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'Delete file error');
  }
}
