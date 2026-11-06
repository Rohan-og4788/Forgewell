import { z } from 'zod';
import { teamService } from '../services/team.service.ts';
import { authenticateRequest } from '../middleware/auth.ts';
import { parseJsonBody } from '../middleware/validate.ts';
import { jsonResponse } from '../lib/response.ts';
import { handleRouteError } from '../middleware/errorHandler.ts';

const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
  slug: z.string().optional(),
  description: z.string().max(500).optional(),
  avatarUrl: z.string().url().or(z.literal('')).optional(),
});

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']).optional(),
});

export async function handleListTeams(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const teams = await teamService.listUserTeams(auth.user.id);
    return jsonResponse(teams, 200);
  } catch (err) {
    return handleRouteError(err, 'List teams error');
  }
}

export async function handleCreateTeam(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, createTeamSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const team = await teamService.create(auth.user.id, parsed.data);
    return jsonResponse(team, 201);
  } catch (err) {
    return handleRouteError(err, 'Create team error');
  }
}

export async function handleGetTeamById(req: Request, teamId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const team = await teamService.getById(teamId, auth.user.id);
    return jsonResponse(team, 200);
  } catch (err) {
    return handleRouteError(err, 'Get team error');
  }
}

export async function handleAddTeamMember(req: Request, teamId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, addMemberSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const member = await teamService.addMember(teamId, auth.user.id, parsed.data.email, parsed.data.role);
    return jsonResponse(member, 201);
  } catch (err) {
    return handleRouteError(err, 'Add team member error');
  }
}

export async function handleRemoveTeamMember(req: Request, teamId: string, memberUserId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const result = await teamService.removeMember(teamId, auth.user.id, memberUserId);
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'Remove team member error');
  }
}
