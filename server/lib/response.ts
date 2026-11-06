export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
}

export function jsonResponse<T>(
  data: T,
  status = 200,
  meta?: Record<string, unknown>,
  headersInit?: HeadersInit
): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
    meta,
  };

  const headers = new Headers(headersInit);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

export function errorResponse(
  message: string,
  status = 400,
  code = 'BAD_REQUEST',
  details?: unknown,
  headersInit?: HeadersInit
): Response {
  const body: ApiResponse<null> = {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };

  const headers = new Headers(headersInit);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  extraMeta?: Record<string, unknown>
): Response {
  const totalPages = Math.ceil(total / limit) || 1;
  return jsonResponse(items, 200, {
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    ...extraMeta,
  });
}

