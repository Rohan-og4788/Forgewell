import { z, ZodError } from 'zod';
import { errorResponse } from '../lib/response.ts';

export async function parseJsonBody<T>(req: Request, schema: z.ZodType<T>): Promise<{ data: T } | { response: Response }> {
  try {
    const text = await req.text();
    if (!text) {
      return {
        response: errorResponse('Request body is required', 400, 'BAD_REQUEST'),
      };
    }
    const json = JSON.parse(text);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return {
        response: formatZodError(parsed.error),
      };
    }
    return { data: parsed.data };
  } catch (err) {
    if (err instanceof SyntaxError) {
      return {
        response: errorResponse('Invalid JSON payload in request body', 400, 'BAD_REQUEST'),
      };
    }
    return {
      response: errorResponse('Failed to parse request body', 400, 'BAD_REQUEST'),
    };
  }
}

export function parseQueryParams<T>(url: URL, schema: z.ZodType<T>): { data: T } | { response: Response } {
  const queryObj: Record<string, unknown> = {};
  for (const [key, value] of url.searchParams.entries()) {
    queryObj[key] = value;
  }
  const parsed = schema.safeParse(queryObj);
  if (!parsed.success) {
    return {
      response: formatZodError(parsed.error),
    };
  }
  return { data: parsed.data };
}

export function formatZodError(error: ZodError): Response {
  const issues = error.issues.map((i) => ({
    field: i.path.join('.'),
    message: i.message,
    code: i.code,
  }));

  return errorResponse('Validation failed', 422, 'UNPROCESSABLE_ENTITY', { issues });
}
