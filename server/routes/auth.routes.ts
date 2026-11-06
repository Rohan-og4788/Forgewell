import { z } from 'zod';
import { authService } from '../services/auth.service.ts';
import { authenticateRequest } from '../middleware/auth.ts';
import { applyRateLimit } from '../middleware/rateLimit.ts';
import { parseJsonBody } from '../middleware/validate.ts';
import { jsonResponse, errorResponse } from '../lib/response.ts';
import { handleRouteError } from '../middleware/errorHandler.ts';
import { env } from '../config/env.ts';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function handleRegister(req: Request): Promise<Response> {
  const rateLimitError = applyRateLimit(req, { limit: 10, identifier: 'auth_register' });
  if (rateLimitError) return rateLimitError;

  const parsed = await parseJsonBody(req, registerSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const result = await authService.register(parsed.data);
    return jsonResponse(result, 201);
  } catch (err) {
    return handleRouteError(err, 'Register error');
  }
}

export async function handleLogin(req: Request): Promise<Response> {
  const rateLimitError = applyRateLimit(req, { limit: 15, identifier: 'auth_login' });
  if (rateLimitError) return rateLimitError;

  const parsed = await parseJsonBody(req, loginSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const result = await authService.login(parsed.data);
    return jsonResponse(result, 200);
  } catch (err: any) {
    return errorResponse(err.message || 'Invalid credentials', 401, 'UNAUTHORIZED');
  }
}

export async function handleTestLogin(req: Request): Promise<Response> {
  if (env.NODE_ENV === 'production') {
    return errorResponse('Not found', 404, 'NOT_FOUND');
  }

  const rateLimitError = applyRateLimit(req, { limit: 30, identifier: 'auth_test_login' });
  if (rateLimitError) return rateLimitError;

  let role: 'USER' | 'ADMIN' = 'USER';
  const url = new URL(req.url);
  const queryRole = url.searchParams.get('role');
  if (queryRole === 'ADMIN') {
    role = 'ADMIN';
  } else if (req.method === 'POST') {
    try {
      const text = await req.text();
      if (text) {
        const body = JSON.parse(text);
        if (body.role === 'ADMIN') role = 'ADMIN';
      }
    } catch {
      // Default to USER
    }
  }

  try {
    const result = await authService.testLogin(role);
    return jsonResponse(
      {
        message: 'Signed in with testing account successfully',
        ...result,
      },
      200,
      undefined,
      {
        'Set-Cookie': `forgewell_token=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
      }
    );
  } catch (err) {
    return handleRouteError(err, 'Test login error');
  }
}

export async function handleLogout(): Promise<Response> {
  return jsonResponse({ message: 'Signed out successfully' }, 200, undefined, {
    'Set-Cookie': 'sb-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
  });
}

export async function handleGetCurrentUser(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const user = await authService.getCurrentUser(auth.user.id);
    return jsonResponse({ user }, 200);
  } catch (err) {
    return handleRouteError(err, 'Get current user error');
  }
}

export async function handleForgotPassword(req: Request): Promise<Response> {
  const rateLimitError = applyRateLimit(req, { limit: 5, identifier: 'auth_forgot' });
  if (rateLimitError) return rateLimitError;

  const parsed = await parseJsonBody(req, forgotPasswordSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const result = await authService.requestPasswordReset(parsed.data.email);
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'Forgot password error');
  }
}

export async function handleUpdatePassword(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, updatePasswordSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const result = await authService.updatePassword(auth.user.id, parsed.data.password);
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'Update password error');
  }
}
