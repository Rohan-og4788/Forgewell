import { z } from 'zod';
import { githubService } from '../services/github.service.ts';
import { authenticateRequest } from '../middleware/auth.ts';
import { parseJsonBody } from '../middleware/validate.ts';
import { jsonResponse, errorResponse } from '../lib/response.ts';
import { handleRouteError } from '../middleware/errorHandler.ts';

const importRepoSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
});

export async function handleGitHubConnect(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const { url, state } = githubService.getOAuthUrl(auth.user.id);
    return jsonResponse({ url, state }, 200);
  } catch (err) {
    return handleRouteError(err, 'GitHub connect error');
  }
}

export async function handleGitHubCallback(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    return errorResponse('Missing GitHub OAuth code or state parameter', 400, 'BAD_REQUEST');
  }

  try {
    const result = await githubService.handleCallback(code, state);
    return jsonResponse({ message: 'GitHub account successfully connected', ...result }, 200);
  } catch (err: any) {
    return errorResponse(err.message || 'GitHub OAuth failed', 400, 'BAD_REQUEST');
  }
}

export async function handleListGitHubRepos(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const perPage = parseInt(url.searchParams.get('per_page') || '30', 10);

  try {
    const repos = await githubService.listRepositories(auth.user.id, page, perPage);
    return jsonResponse(repos, 200);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to list GitHub repositories', 400, 'GITHUB_ERROR');
  }
}

export async function handleGetGitHubRepoDetails(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const url = new URL(req.url);
  const owner = url.searchParams.get('owner');
  const repo = url.searchParams.get('repo');

  if (!owner || !repo) {
    return errorResponse('Parameters "owner" and "repo" are required', 400, 'BAD_REQUEST');
  }

  try {
    const details = await githubService.getRepositoryDetails(auth.user.id, owner, repo);
    return jsonResponse(details, 200);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch repository details', 400, 'GITHUB_ERROR');
  }
}

export async function handleImportGitHubRepo(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, importRepoSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const project = await githubService.importRepository(
      auth.user.id,
      parsed.data.owner,
      parsed.data.repo
    );
    return jsonResponse(project, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to import repository', 400, 'GITHUB_IMPORT_ERROR');
  }
}

export async function handleDisconnectGitHub(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const result = await githubService.disconnect(auth.user.id);
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'Disconnect GitHub error');
  }
}
