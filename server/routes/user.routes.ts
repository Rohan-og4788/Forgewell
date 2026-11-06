import { z } from 'zod';
import { prisma } from '../lib/prisma.ts';
import { authenticateRequest } from '../middleware/auth.ts';
import { parseJsonBody } from '../middleware/validate.ts';
import { jsonResponse, errorResponse } from '../lib/response.ts';
import { handleRouteError } from '../middleware/errorHandler.ts';

const updateProfileSchema = z.object({
  title: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  company: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().or(z.literal('')).optional(),
  twitterUsername: z.string().max(50).optional(),
  linkedinUrl: z.string().url().or(z.literal('')).optional(),
  skills: z.array(z.string()).optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

export async function handleGetProfile(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: auth.user.id },
      include: {
        user: { select: { id: true, email: true, name: true, role: true, createdAt: true } },
      },
    });

    if (!profile) {
      return errorResponse('Profile not found', 404, 'NOT_FOUND');
    }

    return jsonResponse(profile, 200);
  } catch (err) {
    return handleRouteError(err, 'Get profile error');
  }
}

export async function handleUpdateProfile(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, updateProfileSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const profile = await prisma.userProfile.upsert({
      where: { userId: auth.user.id },
      create: {
        userId: auth.user.id,
        ...parsed.data,
        preferences: parsed.data.preferences as any,
      },
      update: {
        ...parsed.data,
        preferences: parsed.data.preferences as any,
      },
    });

    return jsonResponse(profile, 200);
  } catch (err) {
    return handleRouteError(err, 'Update profile error');
  }
}

export async function handleGetUserById(userId: string): Promise<Response> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        profile: true,
        projects: {
          where: { visibility: 'PUBLIC' },
          take: 6,
          orderBy: { starsCount: 'desc' },
        },
      },
    });

    if (!user) {
      return errorResponse('User not found', 404, 'NOT_FOUND');
    }

    return jsonResponse(user, 200);
  } catch (err) {
    return handleRouteError(err, 'Get user by id error');
  }
}
