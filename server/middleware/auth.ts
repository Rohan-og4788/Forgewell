import { prisma } from '../lib/prisma.ts';
import { verifySupabaseToken } from '../lib/supabase.ts';
import { errorResponse } from '../lib/response.ts';
import { logger } from '../lib/logger.ts';
import { type Role, type User } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  supabaseUid?: string | null;
  email: string;
  name?: string | null;
  role: Role;
  isVerified: boolean;
}

export interface AuthContext {
  user: AuthenticatedUser;
}

/**
 * Extract auth token from Authorization header or Cookie
 */
export function extractAuthToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith('sb-access-token=')) {
        return decodeURIComponent(cookie.slice('sb-access-token='.length));
      }
      if (cookie.startsWith('forgewell_token=')) {
        return decodeURIComponent(cookie.slice('forgewell_token='.length));
      }
    }
  }

  return null;
}

/**
 * Authenticate request, returning AuthenticatedUser or throwing / returning error response
 */
export async function authenticateRequest(
  req: Request
): Promise<{ user: AuthenticatedUser } | { response: Response }> {
  const token = extractAuthToken(req);

  if (!token) {
    return {
      response: errorResponse('Missing or invalid authentication token', 401, 'UNAUTHORIZED'),
    };
  }

  try {
    // 1. Verify via Supabase Auth
    const supabaseUser = await verifySupabaseToken(token);

    if (supabaseUser) {
      // Find or synchronize user in Prisma DB
      let dbUser = await prisma.user.findFirst({
        where: {
          OR: [{ supabaseUid: supabaseUser.id }, { email: supabaseUser.email }],
        },
      });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            supabaseUid: supabaseUser.id,
            email: supabaseUser.email,
            isVerified: true,
            profile: {
              create: {
                title: 'Developer',
              },
            },
            subscription: {
              create: {
                plan: 'FREE',
                status: 'ACTIVE',
              },
            },
          },
        });
        logger.info(`Auto-provisioned new database user for Supabase UID: ${supabaseUser.id}`);
      } else if (!dbUser.supabaseUid) {
        // Link existing email to Supabase UID
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { supabaseUid: supabaseUser.id },
        });
      }

      return {
        user: {
          id: dbUser.id,
          supabaseUid: dbUser.supabaseUid,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          isVerified: dbUser.isVerified,
        },
      };
    }

    // 2. Fallback: Check if token is a direct local session token / Bearer user ID for test or local dev
    if (token.startsWith('usr_') || token.startsWith('test_')) {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.replace('test_', '') },
      });
      if (dbUser) {
        return {
          user: {
            id: dbUser.id,
            supabaseUid: dbUser.supabaseUid,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            isVerified: dbUser.isVerified,
          },
        };
      }
    }

    return {
      response: errorResponse('Invalid or expired authentication session', 401, 'UNAUTHORIZED'),
    };
  } catch (error) {
    logger.error('Authentication middleware error', error);
    return {
      response: errorResponse('Authentication service error', 500, 'INTERNAL_ERROR'),
    };
  }
}

/**
 * Optional authentication - extracts user if present, but doesn't reject if not
 */
export async function optionalAuthenticate(req: Request): Promise<AuthenticatedUser | null> {
  const token = extractAuthToken(req);
  if (!token) return null;

  try {
    const result = await authenticateRequest(req);
    if ('user' in result) {
      return result.user;
    }
  } catch {
    // Ignore optional auth failures
  }
  return null;
}
