import { z } from 'zod';
import { projectService } from '../services/project.service.ts';
import { authenticateRequest, optionalAuthenticate } from '../middleware/auth.ts';
import { parseJsonBody } from '../middleware/validate.ts';
import { jsonResponse, paginatedResponse, errorResponse } from '../lib/response.ts';
import { handleRouteError } from '../middleware/errorHandler.ts';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(1000).optional(),
  framework: z.string().max(50).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).optional(),
  status: z.enum(['ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).optional(),
  repositoryUrl: z.string().url().or(z.literal('')).optional(),
  liveDemoUrl: z.string().url().or(z.literal('')).optional(),
  coverImageUrl: z.string().url().or(z.literal('')).optional(),
  tags: z.array(z.string()).optional(),
  teamId: z.string().uuid().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

export async function handleListProjects(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const user = await optionalAuthenticate(req);

  const search = url.searchParams.get('search') || undefined;
  const framework = url.searchParams.get('framework') || undefined;
  const visibility = (url.searchParams.get('visibility') as any) || undefined;
  const status = (url.searchParams.get('status') as any) || undefined;
  const sortBy = (url.searchParams.get('sortBy') as any) || 'createdAt';
  const sortOrder = (url.searchParams.get('sortOrder') as any) || 'desc';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const myProjectsOnly = url.searchParams.get('my') === 'true';

  try {
    const result = await projectService.list({
      userId: myProjectsOnly && user ? user.id : undefined,
      search,
      framework,
      visibility: myProjectsOnly ? visibility : (visibility || 'PUBLIC'),
      status,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return paginatedResponse(result.projects, result.total, result.page, result.limit);
  } catch (err) {
    return handleRouteError(err, 'List projects error');
  }
}

export async function handleCreateProject(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, createProjectSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const project = await projectService.create({
      userId: auth.user.id,
      ...parsed.data,
    });
    return jsonResponse(project, 201);
  } catch (err) {
    return handleRouteError(err, 'Create project error');
  }
}

export async function handleGetProjectById(req: Request, projectId: string): Promise<Response> {
  const user = await optionalAuthenticate(req);

  try {
    const project = await projectService.getById(projectId);

    // Visibility check
    if (project.visibility === 'PRIVATE' && (!user || (user.id !== project.userId && user.role !== 'ADMIN'))) {
      return errorResponse('Project is private', 403, 'FORBIDDEN');
    }

    return jsonResponse(project, 200);
  } catch (err) {
    return handleRouteError(err, 'Get project error');
  }
}

export async function handleUpdateProject(req: Request, projectId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, updateProjectSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const updated = await projectService.update(projectId, auth.user.id, parsed.data);
    return jsonResponse(updated, 200);
  } catch (err) {
    return handleRouteError(err, 'Update project error');
  }
}

export async function handleDeleteProject(req: Request, projectId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const result = await projectService.delete(projectId, auth.user.id);
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'Delete project error');
  }
}
