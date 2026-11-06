import { analyticsService } from '../services/analytics.service.ts';
import { authenticateRequest } from '../middleware/auth.ts';
import { authorizeRoles } from '../middleware/rbac.ts';
import { jsonResponse } from '../lib/response.ts';
import { handleRouteError } from '../middleware/errorHandler.ts';

export async function handleGetUserAnalytics(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const data = await analyticsService.getUserAnalytics(auth.user.id);
    return jsonResponse(data, 200);
  } catch (err) {
    return handleRouteError(err, 'Get user analytics error');
  }
}

export async function handleGetSystemAnalytics(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const rbacError = authorizeRoles(auth.user, ['ADMIN']);
  if (rbacError) return rbacError;

  try {
    const data = await analyticsService.getSystemOverview();
    return jsonResponse(data, 200);
  } catch (err) {
    return handleRouteError(err, 'Get system analytics error');
  }
}
