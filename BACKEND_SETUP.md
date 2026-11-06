# Forgewell Backend Documentation & Setup Guide

This document describes the architecture, configuration, API endpoints, and running instructions for the **Forgewell** backend application.

---

## 1. Tech Stack Overview

- **Runtime**: Node.js v22+
- **Language**: TypeScript 6
- **Database ORM**: Prisma ORM 7.10.x with PostgreSQL (Supabase)
- **Authentication**: Supabase Authentication with server-side validation
- **Storage**: Supabase Storage with MIME/size limits
- **Validation**: Zod 4 runtime schema validation
- **Cryptography**: AES-256-GCM token encryption & `crypto.timingSafeEqual`
- **External Integrations**: GitHub REST API (OAuth, Repos, Commits, Languages) & AI/LLM APIs (OpenAI, Gemini, Anthropic, Groq, Native)

---

## 2. Directory Structure

```
Forgewell/
├── prisma/
│   └── schema.prisma              # 16 PostgreSQL models, enums, indexes, cascading rules
├── prisma.config.ts               # Prisma 7 configuration (datasource & migrations)
├── server/
│   ├── index.ts                   # Production HTTP server & route pattern dispatcher
│   ├── config/
│   │   ├── env.ts                 # Zod-validated environment configuration
│   │   └── constants.ts           # System limits, error codes, storage buckets
│   ├── lib/
│   │   ├── prisma.ts              # Resilient Prisma client singleton
│   │   ├── supabase.ts            # Supabase auth verification and admin client
│   │   ├── crypto.ts              # AES-256-GCM encryption & timing-safe verification
│   │   ├── logger.ts              # Structured logger (debug, info, warn, error)
│   │   └── response.ts            # Standardized API responses (json, error, paginated)
│   ├── middleware/
│   │   ├── auth.ts                # Bearer / cookie token extraction & user sync
│   │   ├── rbac.ts                # Role-based authorization & resource ownership checks
│   │   ├── rateLimit.ts           # Token-bucket sliding window rate limiter
│   │   ├── validate.ts            # Zod validation for body, query params & routes
│   │   └── errorHandler.ts        # Global error boundary for Prisma & syntax errors
│   ├── services/
│   │   ├── auth.service.ts        # Supabase Auth, login/register, password reset
│   │   ├── project.service.ts     # Project CRUD, filtering, sorting, visibility
│   │   ├── github.service.ts      # GitHub OAuth, repos, commits, languages, import
│   │   ├── ai.service.ts          # Multi-provider LLM router & streaming
│   │   ├── review.service.ts      # Automated code review & security auditing
│   │   ├── doc.service.ts         # Documentation generator (README, API, Architecture)
│   │   ├── resume.service.ts      # Resume builder, AI enhancer & printable HTML export
│   │   ├── portfolio.service.ts   # Portfolio management, project import & public view
│   │   ├── blog.service.ts        # Blog CRUD, drafts, publishing & tags
│   │   ├── notification.service.ts# User notifications, unread count & read status
│   │   ├── analytics.service.ts   # Real database analytics, activity & productivity stats
│   │   ├── team.service.ts        # Team collaboration & role memberships
│   │   └── storage.service.ts     # Supabase Storage bucket uploads & size validation
│   ├── routes/                    # API Route Handlers
│   └── tests/
│       └── run_tests.ts           # Automated backend verification test suite
```

---

## 3. Environment Variables Configuration

Create a `.env` file in the root directory (based on `.env.example`):

```bash
# Server Configuration
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:5173

# Database Connection (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?schema=public"

# Supabase Auth & Storage
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Security & Cryptography (32-byte hex key for AES-256-GCM)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
JWT_SECRET="forgewell-super-secure-jwt-secret-key-at-least-32-chars-long"

# GitHub OAuth Integration
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_CALLBACK_URL="http://localhost:3001/api/github/callback"

# AI Provider ("openai" | "anthropic" | "gemini" | "groq" | "mock")
AI_PROVIDER="mock"
OPENAI_API_KEY=""
GEMINI_API_KEY=""
ANTHROPIC_API_KEY=""
GROQ_API_KEY=""

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 4. Available NPM Scripts

| Command | Description |
|---|---|
| `npm run server:dev` | Launch backend server in development mode (`http://localhost:3001`) |
| `npm run server:start` | Run production backend server |
| `npm run test:backend` | Run the complete automated backend verification test suite |
| `npm run typecheck:server` | Typecheck backend server files with `tsc` |
| `npm run prisma:generate` | Regenerate Prisma Client from schema |
| `npm run build` | Compile frontend production bundle |

---

## 5. API Reference Endpoints

All responses follow the standardized format:
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

### Health Check
- `GET /api/health` - Server uptime, database status, environment info

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create account (email, password, name)
- `POST /api/auth/login` - Authenticate user & issue session token
- `POST /api/auth/logout` - Clear session cookies
- `GET /api/auth/me` - Get current authenticated user profile & subscription [Protected]
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/update-password` - Update password [Protected]

### Profile & Users (`/api/profile` & `/api/users`)
- `GET /api/profile` - Get current developer profile [Protected]
- `PATCH /api/profile` - Update profile, bio, skills, socials [Protected]
- `GET /api/users/:id` - Get public profile and featured projects

### Projects (`/api/projects`)
- `GET /api/projects` - List projects (query: `search`, `framework`, `visibility`, `status`, `sortBy`, `page`, `limit`)
- `POST /api/projects` - Create project [Protected]
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project [Protected, Owner]
- `DELETE /api/projects/:id` - Delete project [Protected, Owner]

### GitHub Integration (`/api/github`)
- `GET /api/github/connect` - Get OAuth authorization URL [Protected]
- `GET /api/github/callback` - OAuth callback exchange & encrypted token persistence
- `GET /api/github/repos` - List connected user's repositories from GitHub API [Protected]
- `GET /api/github/repo-details` - Get languages, commits, stars (query: `owner`, `repo`) [Protected]
- `POST /api/github/import` - Import GitHub repository into Forgewell project [Protected]
- `DELETE /api/github/disconnect` - Disconnect GitHub account [Protected]

### AI Developer Assistant (`/api/ai`)
- `GET /api/ai/conversations` - List chat sessions [Protected]
- `GET /api/ai/conversations/:id` - Get chat session & history [Protected]
- `DELETE /api/ai/conversations/:id` - Delete chat session [Protected]
- `POST /api/ai/chat` - Send prompt & receive completion with token tracking [Protected]
- `POST /api/ai/stream` - SSE streaming chat endpoint [Protected]

### Automated Code Review (`/api/reviews`)
- `POST /api/reviews` - Submit code snippet for audit (security, bugs, complexity, score) [Protected]
- `GET /api/reviews` - List reviews with pagination [Protected]
- `GET /api/reviews/:id` - Get structured review report & auto-patch [Protected]

### Documentation Generator (`/api/docs`)
- `POST /api/docs/generate` - AI generate README, API docs, Architecture specs [Protected]
- `GET /api/docs` - List documentation items [Protected]
- `GET /api/docs/:id` - Get documentation [Protected]
- `PATCH /api/docs/:id` - Update documentation [Protected]
- `DELETE /api/docs/:id` - Delete documentation [Protected]

### Resume Service (`/api/resumes`)
- `GET /api/resumes` - List resumes [Protected]
- `POST /api/resumes` - Create resume [Protected]
- `GET /api/resumes/:id` - Get resume details [Protected]
- `PATCH /api/resumes/:id` - Update resume [Protected]
- `DELETE /api/resumes/:id` - Delete resume [Protected]
- `POST /api/resumes/enhance-ai` - AI bullet point & summary enhancement [Protected]
- `GET /api/resumes/:id/export` - Export printable HTML / PDF format [Protected]

### Portfolio Service (`/api/portfolios`)
- `GET /api/portfolios` - List user portfolios [Protected]
- `POST /api/portfolios` - Create portfolio [Protected]
- `GET /api/portfolios/:id` - Get portfolio [Protected]
- `PATCH /api/portfolios/:id` - Update portfolio [Protected]
- `POST /api/portfolios/:id/publish` - Toggle published status [Protected]
- `DELETE /api/portfolios/:id` - Delete portfolio [Protected]
- `GET /api/portfolio/public/:slug` - Public portfolio view with view counter

### Blog Management (`/api/blogs`)
- `GET /api/blogs` - List published posts (query: `tag`, `search`, `page`, `limit`)
- `POST /api/blogs` - Create blog post [Protected]
- `GET /api/blogs/post/:slug` - Get single post by slug & increment views
- `PATCH /api/blogs/:id` - Update post [Protected, Owner]
- `DELETE /api/blogs/:id` - Delete post [Protected, Owner]

### Notifications (`/api/notifications`)
- `GET /api/notifications` - List notifications [Protected]
- `GET /api/notifications/unread-count` - Get unread count [Protected]
- `PATCH /api/notifications/:id/read` - Mark single notification as read [Protected]
- `POST /api/notifications/mark-all-read` - Mark all notifications as read [Protected]
- `DELETE /api/notifications/:id` - Delete notification [Protected]

### Analytics Service (`/api/analytics`)
- `GET /api/analytics` - Get user workspace overview, productivity velocity & activity logs [Protected]
- `GET /api/analytics/system` - System-wide administrative metrics [Protected, Admin]

### Team Collaboration (`/api/teams`)
- `GET /api/teams` - List user teams [Protected]
- `POST /api/teams` - Create team [Protected]
- `GET /api/teams/:id` - Get team details & member list [Protected]
- `POST /api/teams/:id/members` - Invite member by email [Protected, Owner/Admin]
- `DELETE /api/teams/:id/members/:userId` - Remove member [Protected]

### File Storage (`/api/storage`)
- `POST /api/storage/upload` - Secure upload to Supabase Storage (Multipart or Base64 JSON) [Protected]
- `DELETE /api/storage/file` - Delete file [Protected]

