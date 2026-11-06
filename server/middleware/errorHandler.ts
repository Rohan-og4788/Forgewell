import { errorResponse } from '../lib/response.ts';
import { logger } from '../lib/logger.ts';
import { Prisma } from '@prisma/client';

export function handleRouteError(error: unknown, contextMsg = 'Internal server error'): Response {
  logger.error(contextMsg, error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      const target = (error.meta?.target as string[])?.join(', ') || 'field';
      return errorResponse(`A record with this ${target} already exists`, 409, 'CONFLICT', { target });
    }
    // Record not found
    if (error.code === 'P2025') {
      return errorResponse('Requested record was not found', 404, 'NOT_FOUND');
    }
    // Foreign key failure
    if (error.code === 'P2003') {
      return errorResponse('Foreign key constraint violation', 400, 'BAD_REQUEST');
    }
  }

  if (error instanceof SyntaxError) {
    return errorResponse('Invalid JSON syntax', 400, 'BAD_REQUEST');
  }

  const message = error instanceof Error ? error.message : 'An unexpected internal error occurred';
  return errorResponse(
    process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : message,
    500,
    'INTERNAL_ERROR'
  );
}
