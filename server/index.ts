import http from 'node:http';
import { env } from './config/env.ts';
import { logger } from './lib/logger.ts';
import { prisma } from './lib/prisma.ts';
import { jsonResponse, errorResponse } from './lib/response.ts';

// Route handlers
import {
  handleRegister,
  handleLogin,
  handleTestLogin,
  handleLogout,
  handleGetCurrentUser,
  handleForgotPassword,
  handleUpdatePassword,
} from './routes/auth.routes.ts';
import { handleGetProfile, handleUpdateProfile, handleGetUserById } from './routes/user.routes.ts';
import {
  handleListProjects,
  handleCreateProject,
  handleGetProjectById,
  handleUpdateProject,
  handleDeleteProject,
} from './routes/project.routes.ts';
import {
  handleGitHubConnect,
  handleGitHubCallback,
  handleListGitHubRepos,
  handleGetGitHubRepoDetails,
  handleImportGitHubRepo,
  handleDisconnectGitHub,
} from './routes/github.routes.ts';
import {
  handleListConversations,
  handleGetConversation,
  handleDeleteConversation,
  handleAIChat,
  handleAIStream,
} from './routes/ai.routes.ts';
import { handleCreateReview, handleListReviews, handleGetReviewById } from './routes/review.routes.ts';
import {
  handleGenerateDoc,
  handleListDocs,
  handleGetDocById,
  handleUpdateDoc,
  handleDeleteDoc,
} from './routes/doc.routes.ts';
import {
  handleListResumes,
  handleCreateResume,
  handleGetResumeById,
  handleUpdateResume,
  handleDeleteResume,
  handleEnhanceResumeBullets,
  handleExportResumeHtml,
} from './routes/resume.routes.ts';
import {
  handleListPortfolios,
  handleCreatePortfolio,
  handleGetPortfolioById,
  handleUpdatePortfolio,
  handleSetPublishStatus,
  handleDeletePortfolio,
  handleGetPublicPortfolio,
} from './routes/portfolio.routes.ts';
import {
  handleListBlogs,
  handleCreateBlog,
  handleGetBlogBySlug,
  handleUpdateBlog,
  handleDeleteBlog,
} from './routes/blog.routes.ts';
import {
  handleListNotifications,
  handleGetUnreadNotificationCount,
  handleMarkNotificationAsRead,
  handleMarkAllNotificationsAsRead,
  handleDeleteNotification,
} from './routes/notification.routes.ts';
import { handleGetUserAnalytics, handleGetSystemAnalytics } from './routes/analytics.routes.ts';
import {
  handleListTeams,
  handleCreateTeam,
  handleGetTeamById,
  handleAddTeamMember,
  handleRemoveTeamMember,
} from './routes/team.routes.ts';
import { handleUploadFile, handleDeleteFile } from './routes/storage.routes.ts';

/**
 * Route pattern matching helper
 */
function matchRoute(pathname: string, pattern: string): Record<string, string> | null {
  const pathParts = pathname.split('/').filter(Boolean);
  const patternParts = pattern.split('/').filter(Boolean);

  if (pathParts.length !== patternParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

/**
 * Central router dispatcher
 */
export async function dispatchApiRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Health check
  if (pathname === '/api/health' && method === 'GET') {
    let dbStatus = 'ok';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'degraded';
    }

    return jsonResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      environment: env.NODE_ENV,
      version: '1.0.0',
    });
  }

  // --- Auth Routes ---
  if (pathname === '/api/auth/register' && method === 'POST') return handleRegister(req);
  if (pathname === '/api/auth/login' && method === 'POST') return handleLogin(req);
  if (pathname === '/api/auth/test-login' && (method === 'POST' || method === 'GET')) return handleTestLogin(req);
  if (pathname === '/api/auth/logout' && method === 'POST') return handleLogout();
  if (pathname === '/api/auth/me' && method === 'GET') return handleGetCurrentUser(req);
  if (pathname === '/api/auth/forgot-password' && method === 'POST') return handleForgotPassword(req);
  if (pathname === '/api/auth/update-password' && method === 'POST') return handleUpdatePassword(req);

  // --- User Profile Routes ---
  if (pathname === '/api/profile' && method === 'GET') return handleGetProfile(req);
  if (pathname === '/api/profile' && method === 'PATCH') return handleUpdateProfile(req);
  const userMatch = matchRoute(pathname, '/api/users/:id');
  if (userMatch && method === 'GET') return handleGetUserById(userMatch.id);

  // --- Project Routes ---
  if (pathname === '/api/projects' && method === 'GET') return handleListProjects(req);
  if (pathname === '/api/projects' && method === 'POST') return handleCreateProject(req);
  const projectMatch = matchRoute(pathname, '/api/projects/:id');
  if (projectMatch) {
    if (method === 'GET') return handleGetProjectById(req, projectMatch.id);
    if (method === 'PATCH') return handleUpdateProject(req, projectMatch.id);
    if (method === 'DELETE') return handleDeleteProject(req, projectMatch.id);
  }

  // --- GitHub Routes ---
  if (pathname === '/api/github/connect' && method === 'GET') return handleGitHubConnect(req);
  if (pathname === '/api/github/callback' && method === 'GET') return handleGitHubCallback(req);
  if (pathname === '/api/github/repos' && method === 'GET') return handleListGitHubRepos(req);
  if (pathname === '/api/github/repo-details' && method === 'GET') return handleGetGitHubRepoDetails(req);
  if (pathname === '/api/github/import' && method === 'POST') return handleImportGitHubRepo(req);
  if (pathname === '/api/github/disconnect' && method === 'DELETE') return handleDisconnectGitHub(req);

  // --- AI Assistant Routes ---
  if (pathname === '/api/ai/conversations' && method === 'GET') return handleListConversations(req);
  const convMatch = matchRoute(pathname, '/api/ai/conversations/:id');
  if (convMatch) {
    if (method === 'GET') return handleGetConversation(req, convMatch.id);
    if (method === 'DELETE') return handleDeleteConversation(req, convMatch.id);
  }
  if (pathname === '/api/ai/chat' && method === 'POST') return handleAIChat(req);
  if (pathname === '/api/ai/stream' && method === 'POST') return handleAIStream(req);

  // --- Code Review Routes ---
  if (pathname === '/api/reviews' && method === 'GET') return handleListReviews(req);
  if (pathname === '/api/reviews' && method === 'POST') return handleCreateReview(req);
  const reviewMatch = matchRoute(pathname, '/api/reviews/:id');
  if (reviewMatch && method === 'GET') return handleGetReviewById(req, reviewMatch.id);

  // --- Documentation Routes ---
  if (pathname === '/api/docs/generate' && method === 'POST') return handleGenerateDoc(req);
  if (pathname === '/api/docs' && method === 'GET') return handleListDocs(req);
  const docMatch = matchRoute(pathname, '/api/docs/:id');
  if (docMatch) {
    if (method === 'GET') return handleGetDocById(req, docMatch.id);
    if (method === 'PATCH') return handleUpdateDoc(req, docMatch.id);
    if (method === 'DELETE') return handleDeleteDoc(req, docMatch.id);
  }

  // --- Resume Routes ---
  if (pathname === '/api/resumes' && method === 'GET') return handleListResumes(req);
  if (pathname === '/api/resumes' && method === 'POST') return handleCreateResume(req);
  if (pathname === '/api/resumes/enhance-ai' && method === 'POST') return handleEnhanceResumeBullets(req);
  const resumeExportMatch = matchRoute(pathname, '/api/resumes/:id/export');
  if (resumeExportMatch && method === 'GET') return handleExportResumeHtml(req, resumeExportMatch.id);
  const resumeMatch = matchRoute(pathname, '/api/resumes/:id');
  if (resumeMatch) {
    if (method === 'GET') return handleGetResumeById(req, resumeMatch.id);
    if (method === 'PATCH') return handleUpdateResume(req, resumeMatch.id);
    if (method === 'DELETE') return handleDeleteResume(req, resumeMatch.id);
  }

  // --- Portfolio Routes ---
  if (pathname === '/api/portfolios' && method === 'GET') return handleListPortfolios(req);
  if (pathname === '/api/portfolios' && method === 'POST') return handleCreatePortfolio(req);
  const publicPortMatch = matchRoute(pathname, '/api/portfolio/public/:slug');
  if (publicPortMatch && method === 'GET') return handleGetPublicPortfolio(publicPortMatch.slug);
  const portPublishMatch = matchRoute(pathname, '/api/portfolios/:id/publish');
  if (portPublishMatch && method === 'POST') return handleSetPublishStatus(req, portPublishMatch.id);
  const portMatch = matchRoute(pathname, '/api/portfolios/:id');
  if (portMatch) {
    if (method === 'GET') return handleGetPortfolioById(req, portMatch.id);
    if (method === 'PATCH') return handleUpdatePortfolio(req, portMatch.id);
    if (method === 'DELETE') return handleDeletePortfolio(req, portMatch.id);
  }

  // --- Blog Routes ---
  if (pathname === '/api/blogs' && method === 'GET') return handleListBlogs(req);
  if (pathname === '/api/blogs' && method === 'POST') return handleCreateBlog(req);
  const blogSlugMatch = matchRoute(pathname, '/api/blogs/post/:slug');
  if (blogSlugMatch && method === 'GET') return handleGetBlogBySlug(blogSlugMatch.slug);
  const blogMatch = matchRoute(pathname, '/api/blogs/:id');
  if (blogMatch) {
    if (method === 'PATCH') return handleUpdateBlog(req, blogMatch.id);
    if (method === 'DELETE') return handleDeleteBlog(req, blogMatch.id);
  }

  // --- Notification Routes ---
  if (pathname === '/api/notifications' && method === 'GET') return handleListNotifications(req);
  if (pathname === '/api/notifications/unread-count' && method === 'GET') return handleGetUnreadNotificationCount(req);
  if (pathname === '/api/notifications/mark-all-read' && method === 'POST') return handleMarkAllNotificationsAsRead(req);
  const notifReadMatch = matchRoute(pathname, '/api/notifications/:id/read');
  if (notifReadMatch && method === 'PATCH') return handleMarkNotificationAsRead(req, notifReadMatch.id);
  const notifMatch = matchRoute(pathname, '/api/notifications/:id');
  if (notifMatch && method === 'DELETE') return handleDeleteNotification(req, notifMatch.id);

  // --- Analytics Routes ---
  if (pathname === '/api/analytics' && method === 'GET') return handleGetUserAnalytics(req);
  if (pathname === '/api/analytics/system' && method === 'GET') return handleGetSystemAnalytics(req);

  // --- Team Routes ---
  if (pathname === '/api/teams' && method === 'GET') return handleListTeams(req);
  if (pathname === '/api/teams' && method === 'POST') return handleCreateTeam(req);
  const teamMemberRemoveMatch = matchRoute(pathname, '/api/teams/:id/members/:userId');
  if (teamMemberRemoveMatch && method === 'DELETE') {
    return handleRemoveTeamMember(req, teamMemberRemoveMatch.id, teamMemberRemoveMatch.userId);
  }
  const teamMembersMatch = matchRoute(pathname, '/api/teams/:id/members');
  if (teamMembersMatch && method === 'POST') return handleAddTeamMember(req, teamMembersMatch.id);
  const teamMatch = matchRoute(pathname, '/api/teams/:id');
  if (teamMatch && method === 'GET') return handleGetTeamById(req, teamMatch.id);

  // --- Storage Routes ---
  if (pathname === '/api/storage/upload' && method === 'POST') return handleUploadFile(req);
  if (pathname === '/api/storage/file' && method === 'DELETE') return handleDeleteFile(req);

  return errorResponse(`Endpoint "${method} ${pathname}" not found`, 404, 'NOT_FOUND');
}

/**
 * Node.js HTTP server adapter
 */
export function createServer() {
  return http.createServer(async (req, res) => {
    const startTime = Date.now();
    const host = req.headers.host || `localhost:${env.PORT}`;
    const url = new URL(req.url || '/', `http://${host}`);

    // Buffer incoming request body
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);

    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (Array.isArray(val)) {
        for (const v of val) headers.append(key, v);
      } else if (val) {
        headers.set(key, val);
      }
    }

    const webReq = new Request(url.toString(), {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method?.toUpperCase() || '') ? undefined : bodyBuffer,
    });

    try {
      const webRes = await dispatchApiRequest(webReq);

      // Write status & headers
      res.statusCode = webRes.status;
      webRes.headers.forEach((value, name) => {
        res.setHeader(name, value);
      });

      // Default CORS headers
      if (!res.hasHeader('Access-Control-Allow-Origin')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }

      // Stream response body
      if (webRes.body) {
        const reader = webRes.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      }
      res.end();

      const duration = Date.now() - startTime;
      logger.info(`[${req.method}] ${url.pathname} - ${res.statusCode} (${duration}ms)`);
    } catch (err) {
      logger.error(`Unhandled server error on [${req.method}] ${url.pathname}`, err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: { message: 'Internal Server Error', code: 'INTERNAL_ERROR' } }));
    }
  });
}

// Start standalone server when executed directly
if (process.argv[1]?.endsWith('server/index.ts') || process.argv[1]?.endsWith('server\\index.ts')) {
  const server = createServer();
  server.listen(env.PORT, () => {
    logger.info(`⚡ Forgewell Production Backend Server running at http://localhost:${env.PORT}`);
    logger.info(`🌐 Environment: ${env.NODE_ENV} | Database: PostgreSQL Prisma`);
    logger.info(`🤖 AI Provider: ${env.AI_PROVIDER}`);
  });

  const shutdown = async () => {
    logger.info('Shutting down server gracefully...');
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server and database connections terminated.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
