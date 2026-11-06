import { type Role } from '@prisma/client';
import { type AuthenticatedUser } from './auth.ts';
import { errorResponse } from '../lib/response.ts';

export function authorizeRoles(user: AuthenticatedUser, allowedRoles: Role[]): Response | null {
  if (!allowedRoles.includes(user.role)) {
    return errorResponse(
      `Access forbidden. Requires one of roles: ${allowedRoles.join(', ')}`,
      403,
      'FORBIDDEN'
    );
  }
  return null;
}

export function authorizeOwnership(
  user: AuthenticatedUser,
  resourceOwnerId: string,
  allowRoles: Role[] = ['ADMIN']
): Response | null {
  // If user is owner or has an override role (e.g. ADMIN), allow
  if (user.id === resourceOwnerId || allowRoles.includes(user.role)) {
    return null;
  }

  return errorResponse(
    'Forbidden: You do not have permission to access or modify this resource',
    403,
    'FORBIDDEN'
  );
}
