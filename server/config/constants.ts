export const APP_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  TOKEN_EXPIRY_SECONDS: 60 * 60 * 24 * 7, // 7 days
  DEFAULT_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 mins
  DEFAULT_RATE_LIMIT_MAX: 100,
  AUTH_RATE_LIMIT_MAX: 10, // strict limit for login/register attempts
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_MIMES: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
  ALLOWED_DOC_MIMES: ['application/pdf', 'text/markdown', 'text/plain'],
  AI_DEFAULT_MODEL: 'gpt-4o',
  AI_MAX_TOKENS: 4096,
  STORAGE_BUCKETS: {
    AVATARS: 'avatars',
    PROJECTS: 'project-images',
    RESUMES: 'resumes',
    BLOGS: 'blog-images',
    PORTFOLIOS: 'portfolio-assets',
  },
} as const;

export const ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

