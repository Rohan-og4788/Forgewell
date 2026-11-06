import { prisma } from '../lib/prisma.ts';
import { aiService } from './ai.service.ts';
import { type DocType } from '@prisma/client';

export interface GenerateDocParams {
  userId: string;
  projectId?: string;
  title: string;
  docType: DocType;
  contextInfo?: {
    projectName?: string;
    description?: string;
    framework?: string;
    routes?: string[];
    codeSnippet?: string;
  };
}

export class DocService {
  /**
   * Automatically generate documentation using AI and persist to DB
   */
  async generateDoc(params: GenerateDocParams) {
    const { userId, projectId, title, docType, contextInfo } = params;

    let prompt = '';
    const name = contextInfo?.projectName || title;
    const desc = contextInfo?.description || 'A modern full-stack web application';
    const framework = contextInfo?.framework || 'TypeScript / Next.js / Node.js';

    switch (docType) {
      case 'README':
        prompt = `Generate a comprehensive, production-grade GitHub README.md for a project named "${name}".
Description: ${desc}
Tech Stack: ${framework}
Include sections for: Project Overview, Key Architecture Features, Getting Started, Environment Setup, API Overview, Contributing, and License.`;
        break;

      case 'API_DOC':
        prompt = `Generate structured OpenAPI / Markdown API documentation for project "${name}".
Include standard REST endpoints for Authentication, CRUD resources, error response formats, headers, and curl examples.`;
        break;

      case 'ARCHITECTURE':
        prompt = `Generate an architectural overview document for "${name}".
Explain the multi-tiered architecture (Controllers, Services, Data Access with Prisma, Supabase Auth/Storage), security boundaries, and scalability patterns.`;
        break;

      case 'CODE_EXPLANATION':
        prompt = `Provide a clear, detailed code walkthrough and annotation for the following code:\n\`\`\`\n${contextInfo?.codeSnippet || '// Main logic'}\n\`\`\``;
        break;

      case 'PROJECT_SUMMARY':
      default:
        prompt = `Provide an executive technical summary for project "${name}". Highlight core capabilities, deployment profile, and integration points.`;
        break;
    }

    const aiResult = await aiService.generateCompletion([
      { role: 'system', content: 'You are an expert technical writer and software architect.' },
      { role: 'user', content: prompt },
    ]);

    const doc = await prisma.documentation.create({
      data: {
        userId,
        projectId,
        title,
        docType,
        content: aiResult.text,
        format: 'markdown',
        metadata: contextInfo ? (contextInfo as any) : undefined,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'DOC_GENERATED',
        entityType: 'documentation',
        entityId: doc.id,
        description: `Generated ${docType} documentation: "${title}"`,
      },
    });

    return doc;
  }

  /**
   * List documentation items for user
   */
  async listDocs(userId: string, projectId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (projectId) where.projectId = projectId;

    const [docs, total] = await Promise.all([
      prisma.documentation.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: { project: { select: { name: true, slug: true } } },
      }),
      prisma.documentation.count({ where }),
    ]);

    return { docs, total, page, limit };
  }

  async getById(id: string, userId: string) {
    const doc = await prisma.documentation.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!doc || doc.userId !== userId) {
      throw new Error('Documentation not found');
    }
    return doc;
  }

  async update(id: string, userId: string, data: { title?: string; content?: string }) {
    const doc = await prisma.documentation.findUnique({ where: { id } });
    if (!doc || doc.userId !== userId) {
      throw new Error('Documentation not found');
    }

    return prisma.documentation.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    const doc = await prisma.documentation.findUnique({ where: { id } });
    if (!doc || doc.userId !== userId) {
      throw new Error('Documentation not found');
    }

    await prisma.documentation.delete({ where: { id } });
    return { deleted: true, id };
  }
}

export const docService = new DocService();
