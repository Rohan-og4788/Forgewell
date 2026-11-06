import { z } from 'zod';
import { blogService } from '../services/blog.service.ts';
import { authenticateRequest } from '../middleware/auth.ts';
import { parseJsonBody } from '../middleware/validate.ts';
import { jsonResponse, paginatedResponse } from '../lib/response.ts';
import { handleRouteError } from '../middleware/errorHandler.ts';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().or(z.literal('')).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export async function handleListBlogs(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const status = (url.searchParams.get('status') as any) || 'PUBLISHED';
  const tag = url.searchParams.get('tag') || undefined;
  const search = url.searchParams.get('search') || undefined;
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);

  try {
    const result = await blogService.list({ status, tag, search, page, limit });
    return paginatedResponse(result.posts, result.total, result.page, result.limit);
  } catch (err) {
    return handleRouteError(err, 'List blogs error');
  }
}

export async function handleCreateBlog(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, blogSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const post = await blogService.create(auth.user.id, parsed.data);
    return jsonResponse(post, 201);
  } catch (err) {
    return handleRouteError(err, 'Create blog error');
  }
}

export async function handleGetBlogBySlug(slug: string): Promise<Response> {
  try {
    const post = await blogService.getBySlug(slug);
    return jsonResponse(post, 200);
  } catch (err) {
    return handleRouteError(err, 'Get blog error');
  }
}

export async function handleUpdateBlog(req: Request, blogId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, blogSchema.partial());
  if ('response' in parsed) return parsed.response;

  try {
    const updated = await blogService.update(blogId, auth.user.id, parsed.data);
    return jsonResponse(updated, 200);
  } catch (err) {
    return handleRouteError(err, 'Update blog error');
  }
}

export async function handleDeleteBlog(req: Request, blogId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const result = await blogService.delete(blogId, auth.user.id);
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'Delete blog error');
  }
}
