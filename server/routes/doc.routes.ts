import { z } from 'zod';
import { docService } from '../services/doc.service.ts';
import { authenticateRequest } from '../middleware/auth.ts';
import { parseJsonBody } from '../middleware/validate.ts';
import { jsonResponse, paginatedResponse } from '../lib/response.ts';
import { handleRouteError } from '../middleware/errorHandler.ts';

const generateDocSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  docType: z.enum(['README', 'API_DOC', 'ARCHITECTURE', 'CODE_EXPLANATION', 'PROJECT_SUMMARY']),
  projectId: z.string().uuid().optional(),
  contextInfo: z
    .object({
      projectName: z.string().optional(),
      description: z.string().optional(),
      framework: z.string().optional(),
      routes: z.array(z.string()).optional(),
      codeSnippet: z.string().optional(),
    })
    .optional(),
});

const updateDocSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  content: z.string().min(1).optional(),
});

export async function handleGenerateDoc(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, generateDocSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const doc = await docService.generateDoc({
      userId: auth.user.id,
      ...parsed.data,
    });
    return jsonResponse(doc, 201);
  } catch (err) {
    return handleRouteError(err, 'Generate doc error');
  }
}

export async function handleListDocs(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId') || undefined;
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);

  try {
    const result = await docService.listDocs(auth.user.id, projectId, page, limit);
    return paginatedResponse(result.docs, result.total, result.page, result.limit);
  } catch (err) {
    return handleRouteError(err, 'List docs error');
  }
}

export async function handleGetDocById(req: Request, docId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const doc = await docService.getById(docId, auth.user.id);
    return jsonResponse(doc, 200);
  } catch (err) {
    return handleRouteError(err, 'Get doc error');
  }
}

export async function handleUpdateDoc(req: Request, docId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, updateDocSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const updated = await docService.update(docId, auth.user.id, parsed.data);
    return jsonResponse(updated, 200);
  } catch (err) {
    return handleRouteError(err, 'Update doc error');
  }
}

export async function handleDeleteDoc(req: Request, docId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const result = await docService.delete(docId, auth.user.id);
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'Delete doc error');
  }
}
