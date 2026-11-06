import { z } from 'zod';
import { portfolioService } from '../services/portfolio.service.ts';
import { authenticateRequest } from '../middleware/auth.ts';
import { parseJsonBody } from '../middleware/validate.ts';
import { jsonResponse } from '../lib/response.ts';
import { handleRouteError } from '../middleware/errorHandler.ts';

const portfolioSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  slug: z.string().optional(),
  bio: z.string().max(1000).optional(),
  theme: z.string().optional(),
  sections: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(['about', 'projects', 'skills', 'experience', 'contact']),
        title: z.string(),
        content: z.any(),
        order: z.number(),
        visible: z.boolean(),
      })
    )
    .optional(),
  featuredProjects: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string(),
        description: z.string(),
        tags: z.array(z.string()),
        url: z.string().optional(),
        github: z.string().optional(),
        stars: z.number().optional(),
      })
    )
    .optional(),
  isPublished: z.boolean().optional(),
  customDomain: z.string().optional(),
});

const publishStatusSchema = z.object({
  isPublished: z.boolean(),
});

export async function handleListPortfolios(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const portfolios = await portfolioService.list(auth.user.id);
    return jsonResponse(portfolios, 200);
  } catch (err) {
    return handleRouteError(err, 'List portfolios error');
  }
}

export async function handleCreatePortfolio(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, portfolioSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const portfolio = await portfolioService.create(auth.user.id, parsed.data);
    return jsonResponse(portfolio, 201);
  } catch (err) {
    return handleRouteError(err, 'Create portfolio error');
  }
}

export async function handleGetPortfolioById(req: Request, portfolioId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const portfolio = await portfolioService.getById(portfolioId, auth.user.id);
    return jsonResponse(portfolio, 200);
  } catch (err) {
    return handleRouteError(err, 'Get portfolio error');
  }
}

export async function handleUpdatePortfolio(req: Request, portfolioId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, portfolioSchema.partial());
  if ('response' in parsed) return parsed.response;

  try {
    const updated = await portfolioService.update(portfolioId, auth.user.id, parsed.data);
    return jsonResponse(updated, 200);
  } catch (err) {
    return handleRouteError(err, 'Update portfolio error');
  }
}

export async function handleSetPublishStatus(req: Request, portfolioId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, publishStatusSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const updated = await portfolioService.setPublishStatus(
      portfolioId,
      auth.user.id,
      parsed.data.isPublished
    );
    return jsonResponse(updated, 200);
  } catch (err) {
    return handleRouteError(err, 'Publish status error');
  }
}

export async function handleDeletePortfolio(req: Request, portfolioId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const result = await portfolioService.delete(portfolioId, auth.user.id);
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'Delete portfolio error');
  }
}

export async function handleGetPublicPortfolio(slug: string): Promise<Response> {
  try {
    const portfolio = await portfolioService.getPublicBySlug(slug);
    return jsonResponse(portfolio, 200);
  } catch (err) {
    return handleRouteError(err, 'Get public portfolio error');
  }
}
