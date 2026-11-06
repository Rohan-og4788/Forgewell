import { z } from 'zod';
import { reviewService } from '../services/review.service.ts';
import { authenticateRequest } from '../middleware/auth.ts';
import { applyRateLimit } from '../middleware/rateLimit.ts';
import { parseJsonBody } from '../middleware/validate.ts';
import { jsonResponse, paginatedResponse } from '../lib/response.ts';
import { handleRouteError } from '../middleware/errorHandler.ts';

const reviewRequestSchema = z.object({
  title: z.string().min(1, 'Review title is required').max(150),
  language: z.string().min(1, 'Language is required').max(50),
  codeSnippet: z.string().min(10, 'Code snippet must be at least 10 characters').max(50000),
  projectId: z.string().uuid().optional(),
});

export async function handleCreateReview(req: Request): Promise<Response> {
  const rateLimitError = applyRateLimit(req, { limit: 20, identifier: 'code_review' });
  if (rateLimitError) return rateLimitError;

  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, reviewRequestSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const result = await reviewService.reviewCode(auth.user.id, {
      title: parsed.data.title,
      language: parsed.data.language,
      codeSnippet: parsed.data.codeSnippet,
      projectId: parsed.data.projectId,
    });
    return jsonResponse(result, 201);
  } catch (err) {
    return handleRouteError(err, 'Create code review error');
  }
}

export async function handleListReviews(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId') || undefined;
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);

  try {
    const result = await reviewService.listReviews(auth.user.id, projectId, page, limit);
    return paginatedResponse(result.reviews, result.total, result.page, result.limit);
  } catch (err) {
    return handleRouteError(err, 'List reviews error');
  }
}

export async function handleGetReviewById(req: Request, reviewId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const review = await reviewService.getById(reviewId, auth.user.id);
    return jsonResponse(review, 200);
  } catch (err) {
    return handleRouteError(err, 'Get review error');
  }
}
